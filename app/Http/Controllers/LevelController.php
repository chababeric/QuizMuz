<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Level;
use App\Models\Module;
use App\Models\Score;
use App\Models\User;
use App\Models\UserCourseMode;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LevelController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function index(Request $request): Response
    {
        $courseId = $request->route('courseId');
        $course = Course::findOrFail($courseId);
        $courseName = $course->name;

        // Get user's institution ID
        $user = Auth::user();
        $institutionId = $user->institution->id;

        // Fetch levels and sort them alphabetically by name
        $levels = Level::where('course_id', $courseId)
            ->where('institution_id', $institutionId)
            ->orderBy('name', 'asc')  // Sort alphabetically by name
            ->get();

        // Module titles per level, used as practice topics
        $modulesByLevel = Module::whereIn('level_id', $levels->pluck('id'))
            ->orderBy('order')
            ->get(['level_id', 'title'])
            ->groupBy('level_id')
            ->map(fn ($modules) => $modules->pluck('title'));

        // Scores are cumulative per course, so the leaderboard is course-wide
        $leaderboard = Score::with('user:id,username')
            ->where('course_id', $courseId)
            ->where('score', '>', 0)
            ->orderBy('score', 'desc')
            ->take(3)
            ->get()
            ->map(fn ($score) => [
                'userId' => $score->user_id,
                'username' => $score->user->username,
                'score' => $score->score,
            ]);

        $userScore = Score::where('user_id', $user->id)->where('course_id', $courseId)->value('score') ?? 0;
        $userRank = $userScore > 0
            ? Score::where('course_id', $courseId)->where('score', '>', $userScore)->count() + 1
            : null;

        $modeCounts = UserCourseMode::where('user_id', $user->id)->where('course_id', $courseId)->first();

        return Inertia::render('MainMenu', [
            'levels' => $levels,
            'courseId' => $courseId,
            'courseName' => $courseName,
            'modulesByLevel' => $modulesByLevel,
            'leaderboard' => $leaderboard,
            'userStats' => [
                'score' => $userScore,
                'rank' => $userRank,
                'quizCount' => $modeCounts->quiz_count ?? 0,
                'practiceCount' => $modeCounts->practice_count ?? 0,
            ],
        ]);
    }

    public function getAllLevels(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
        ]);
        $levels = Level::with('course')->where('institution_id', $request->institution_id)->get();

        return response()->json($levels);
    }

    public function toggleLevelAccess(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'level_id' => 'required|exists:levels,id',
            'name' => 'required|string',
            'selectedInstitutionName' => 'required|string',
        ]);

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier l\'accès aux niveaux.',
            ], 403);
        }

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->selectedInstitutionName != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de modifier l\'accès d\'un niveau d\'une autre institution.'], 403);
        } else {
            $level = Level::find($request->level_id);
            $newStatus = !$level->is_enabled;
            $level->is_enabled = $newStatus;
            $level->save();

            $message = $newStatus ? 'Le niveau ' . $request->name . ' a été activé avec succès.' : 'Le niveau ' . $request->name . ' a été désactivé avec succès.';

            // Enhanced logging with all requested information and styling
            $statusSpan = $newStatus
                ? '<span class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded">activé</span>'
                : '<span class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded">désactivé</span>';

            $this->logsController->createLog(
                'Niveau',
                "Le niveau <strong>{$request->name}</strong> du cours <strong>{$level->course->name}</strong> a été {$statusSpan}. " .
                "Institution: <strong>{$institution_name}</strong>",
                $initiator->id
            );

            return response()->json(['message' => $message]);
        }
    }

    public function updateLastLevel(Request $request): JsonResponse
    {
        $request->validate([
            'level' => 'required|exists:levels,id',
            'userId' => 'required|exists:users,id',
        ]);

        $user = User::find($request->userId);

        if ($user) {
            $user->last_level = $request->level;
            $user->save();
            return response()->json(['message' => 'Niveau mis à jour avec succès'], 200);
        }
        else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }

    public function addLevel(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'name' => 'required|digits:3',
            'course_id' => 'required|exists:courses,id',
            'institution_name' => 'required|string',
        ], [
            'name.required' => 'Le nom du niveau est requis.',
            'name.digits' => 'Le nom du niveau doit être un nombre de 3 chiffres.',
            'course_id.required' => 'Le cours est requis.',
            'course_id.exists' => 'Le cours sélectionné n\'existe pas.',
        ]);

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à créer des niveaux.',
            ], 403);
        }

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->institution_name != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de créer un niveau pour une autre institution.'], 403);
        }

        Level::create([
            'name' => $request->name,
            'course_id' => $request->course_id,
            'institution_id' => $institution,
        ]);

        $this->logsController->createLog(
            'Niveau',
            "Le niveau <strong>{$request->name}</strong> a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">ajouté</span> au cours <strong>" . Course::find($request->course_id)->name . "</strong> " .
            "à l'institution <strong>{$institution_name}</strong>.",
            $initiator->id
        );

        return response()->json(['message' => 'Le niveau \'' . $request->name . '\' a été ajouté avec succès.'], 200);
    }

    public function deleteLevel(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'level_id' => 'required|integer',
            'name' => 'required|string',
            'institution_name' => 'required|string',
        ]);

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à supprimer des niveaux.',
            ], 403);
        }

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->institution_name != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de supprimer un niveau d\'une autre institution.'], 403);
        }

        $level = Level::find($request->level_id);

        if (!$level) {
            return response()->json(['message' => 'Le niveau \'' . $request->name . '\' n\'a pas été trouvé.'], 404);
        } else {
            try {
                // Use transaction to ensure database consistency
                DB::beginTransaction();

                // Get the course name before deleting the level
                $courseName = $level->course->name;

                // Delete the level without cascading to user
                $level->delete();

                DB::commit();

                $this->logsController->createLog(
                    'Niveau',
                    "Le niveau <strong>{$request->name}</strong> a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span> du cours <strong>{$courseName}</strong> " .
                    "de l'institution <strong>{$institution_name}</strong>.",
                    $initiator->id
                );

                return response()->json(['message' => 'Le niveau \'' . $request->name . '\' a été supprimé avec succès.'], 200);
            } catch (Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Une erreur est survenue lors de la suppression du niveau.'], 500);
            }
        }
    }

    public function getLevelsFromCourse(Request $request): JsonResponse
    {
        $request->validate([
            'course_name' => 'required|string',
        ]);

        $levels = Level::with(['course'])
            ->whereHas('course', function($query) use ($request) {
                $query->where('name', $request->course_name);
            })
            ->where('institution_id', auth()->user()->institution_id)
            ->get();

        return response()->json($levels);
    }

    public function getFMALevels(): JsonResponse
    {
        $initiator = auth()->user();
        $levels = Level::with(['course'])
            ->whereHas('course', function($query) {
                $query->where('name', 'Formation Musicale et Auditive');
            })
            ->where('institution_id', $initiator->institution_id)
            ->get();
        return response()->json($levels);
    }
}
