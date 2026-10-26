<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\Course;
use App\Models\Institution;
use App\Models\Level;
use App\Models\Log;
use App\Models\Piece;
use App\Models\Score;
use App\Models\User;
use App\Models\UserCourseMode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // A user is online when one of their sessions checked in within this window.
    // Open pages send a heartbeat every 60 seconds while visible (see app.jsx).
    public const ONLINE_WINDOW_SECONDS = 150;

    private const ACTIVE_DAYS = 7;
    private const INACTIVE_DAYS = 30;
    private const PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'institution' => $request->input('institution'),
            'course' => $request->input('course'),
            'status' => $request->input('status'),
            'sort' => $request->input('sort', 'last_activity'),
            'direction' => $request->input('direction') === 'asc' ? 'asc' : 'desc',
        ];

        $onlineIds = $this->onlineUserIds();

        // Closures let partial reloads (filters, pagination) skip the stats they don't need
        return Inertia::render('Dashboard', [
            'kpis' => fn () => $this->kpis($onlineIds),
            'courses' => fn () => $this->courseStats(),
            'recentLogs' => fn () => $this->recentLogs(),
            'users' => fn () => $this->users($filters, $onlineIds),
            'filters' => $filters,
            'filterOptions' => fn () => [
                'institutions' => Institution::orderBy('name')->get(['id', 'name']),
                'courses' => Course::orderBy('name')->get(['id', 'name']),
            ],
            'onlineWindowMinutes' => round(self::ONLINE_WINDOW_SECONDS / 60, 1),
        ]);
    }

    // Lets the page refresh the online count without reloading everything
    public function online(): JsonResponse
    {
        $onlineIds = $this->onlineUserIds();

        return response()->json([
            'count' => $onlineIds->count(),
            'userIds' => $onlineIds->values(),
        ]);
    }

    /**
     * Users with a recently active session. Logging out deletes the session row, so users
     * drop off immediately; closing the tab drops them after ONLINE_WINDOW_SECONDS.
     * Falls back to last_action_time when sessions are not stored in the database.
     */
    private function onlineUserIds(): Collection
    {
        if (config('session.driver') === 'database') {
            return DB::table(config('session.table', 'sessions'))
                ->whereNotNull('user_id')
                ->where('last_activity', '>=', now()->subSeconds(self::ONLINE_WINDOW_SECONDS)->getTimestamp())
                ->distinct()
                ->pluck('user_id');
        }

        return User::where('last_action_time', '>=', now()->subSeconds(self::ONLINE_WINDOW_SECONDS))->pluck('id');
    }

    private function kpis(Collection $onlineIds): array
    {
        $startOfMonth = now()->startOfMonth();

        return [
            'totalUsers' => User::count(),
            'online' => $onlineIds->count(),
            'active7' => User::where('last_action_time', '>=', now()->subDays(self::ACTIVE_DAYS))->count(),
            'inactive' => User::where(function (Builder $query) {
                $query->whereNull('last_action_time')
                    ->orWhere('last_action_time', '<', now()->subDays(self::INACTIVE_DAYS));
            })->count(),
            'newThisMonth' => User::where('created_at', '>=', $startOfMonth)->count(),
            'newLastMonth' => User::whereBetween('created_at', [$startOfMonth->copy()->subMonth(), $startOfMonth])->count(),
            'totalQuiz' => (int) UserCourseMode::sum('quiz_count'),
            'totalPractice' => (int) UserCourseMode::sum('practice_count'),
            'activeDays' => self::ACTIVE_DAYS,
            'inactiveDays' => self::INACTIVE_DAYS,
        ];
    }

    // Per course: usage, students active this week, content per level and the top 3 scores
    private function courseStats(): Collection
    {
        $courses = Course::with('institution:id,name')->orderBy('name')->get(['id', 'name', 'institution_id']);
        $courseIds = $courses->pluck('id');

        $usage = UserCourseMode::whereIn('course_id', $courseIds)
            ->select('course_id')
            ->selectRaw('COUNT(*) as students, SUM(quiz_count) as quiz, SUM(practice_count) as practice')
            ->selectRaw('SUM(CASE WHEN updated_at >= ? THEN 1 ELSE 0 END) as active7', [now()->subDays(self::ACTIVE_DAYS)])
            ->groupBy('course_id')
            ->get()
            ->keyBy('course_id');

        $institutionNames = Institution::pluck('name', 'id');
        $levels = Level::whereIn('course_id', $courseIds)
            ->orderBy('name')
            ->get(['id', 'name', 'course_id', 'institution_id', 'is_enabled']);
        $levelIds = $levels->pluck('id');
        $pieceCounts = Piece::whereIn('level_id', $levelIds)->selectRaw('level_id, COUNT(*) as total')->groupBy('level_id')->pluck('total', 'level_id');
        $chordCounts = Chord::whereIn('level_id', $levelIds)->selectRaw('level_id, COUNT(*) as total')->groupBy('level_id')->pluck('total', 'level_id');

        $topScores = Score::with('user:id,username,first_name,last_name')
            ->whereIn('course_id', $courseIds)
            ->where('score', '>', 0)
            ->orderByDesc('score')
            ->get(['id', 'user_id', 'course_id', 'score'])
            ->groupBy('course_id');

        return $courses->map(function ($course) use ($usage, $levels, $institutionNames, $pieceCounts, $chordCounts, $topScores) {
            $stats = $usage->get($course->id);
            $courseLevels = $levels->where('course_id', $course->id)->values()->map(fn ($level) => [
                'id' => $level->id,
                'name' => $level->name,
                'institution' => $institutionNames[$level->institution_id] ?? null,
                'isEnabled' => (bool) $level->is_enabled,
                'items' => (int) ($pieceCounts[$level->id] ?? 0) + (int) ($chordCounts[$level->id] ?? 0),
            ]);

            return [
                'id' => $course->id,
                'name' => $course->name,
                'institution' => $course->institution->name ?? null,
                'students' => (int) ($stats->students ?? 0),
                'active7' => (int) ($stats->active7 ?? 0),
                'quiz' => (int) ($stats->quiz ?? 0),
                'practice' => (int) ($stats->practice ?? 0),
                'levels' => $courseLevels,
                'emptyLevels' => $courseLevels->where('items', 0)->count(),
                'lockedLevels' => $courseLevels->where('isEnabled', false)->count(),
                'topScores' => ($topScores->get($course->id) ?? collect())->take(3)->map(fn ($score) => [
                    'username' => $score->user->username ?? '—',
                    'name' => trim(($score->user->first_name ?? '') . ' ' . ($score->user->last_name ?? '')),
                    'score' => $score->score,
                ])->values(),
            ];
        })->values();
    }

    private function recentLogs(): Collection
    {
        return Log::with('user:id,first_name,last_name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'action', 'description', 'created_at'])
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'createdAt' => $log->created_at,
                'user' => $log->user ? trim($log->user->first_name . ' ' . $log->user->last_name) : null,
            ]);
    }

    private function users(array $filters, Collection $onlineIds)
    {
        $query = User::query()->with([
            'institution:id,name',
            'courseModes:id,user_id,course_id,practice_count,quiz_count,updated_at',
            'courseModes.course:id,name',
        ]);

        if ($filters['search'] !== '') {
            $term = '%' . $filters['search'] . '%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('username', 'like', $term)
                    ->orWhere('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", [$term]);
            });
        }

        if ($filters['institution']) {
            $query->where('institution_id', $filters['institution']);
        }

        if ($filters['course']) {
            $query->whereHas('courseModes', fn (Builder $q) => $q->where('course_id', $filters['course']));
        }

        match ($filters['status']) {
            'online' => $query->whereIn('id', $onlineIds),
            'active' => $query->where('last_action_time', '>=', now()->subDays(self::ACTIVE_DAYS)),
            'inactive' => $query->where('last_action_time', '<', now()->subDays(self::INACTIVE_DAYS)),
            'never' => $query->whereNull('last_action_time'),
            default => null,
        };

        $direction = $filters['direction'];
        match ($filters['sort']) {
            'name' => $query->orderBy('last_name', $direction)->orderBy('first_name', $direction),
            'institution' => $query->orderBy(
                Institution::select('name')->whereColumn('institutions.id', 'users.institution_id'),
                $direction
            ),
            'created' => $query->orderBy('created_at', $direction),
            'activity' => $query->orderBy(
                UserCourseMode::selectRaw('COALESCE(SUM(quiz_count + practice_count), 0)')->whereColumn('user_course_modes.user_id', 'users.id'),
                $direction
            ),
            // Most recent activity first; users who never logged in go last
            default => $query->orderByRaw('last_action_time IS NULL')->orderBy('last_action_time', $direction),
        };

        $page = $query->paginate(self::PER_PAGE)->withQueryString();
        // Scores only for the users on this page
        $scores = Score::whereIn('user_id', collect($page->items())->pluck('id'))->get(['user_id', 'course_id', 'score']);

        return $page->through(function ($user) use ($onlineIds, $scores) {
            $userScores = $scores->where('user_id', $user->id)->keyBy('course_id');
            $courses = $user->courseModes->map(fn ($mode) => [
                'id' => $mode->course_id,
                'name' => $mode->course->name ?? 'Cours inconnu',
                'quiz' => $mode->quiz_count,
                'practice' => $mode->practice_count,
                'lastUsed' => $mode->updated_at,
                'score' => (int) ($userScores->get($mode->course_id)->score ?? 0),
            ])->values();

            return [
                'id' => $user->id,
                'username' => $user->username,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'institution' => $user->institution->name ?? null,
                'lastActionTime' => $user->last_action_time,
                'createdAt' => $user->created_at,
                'isOnline' => $onlineIds->contains($user->id),
                'quiz' => $courses->sum('quiz'),
                'practice' => $courses->sum('practice'),
                'courses' => $courses,
            ];
        });
    }
}
