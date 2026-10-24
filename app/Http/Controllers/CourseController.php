<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Level;
use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function index(): Response
    {
        $user = auth()->user();

        $courses = Course::where('institution_id', $user->institution_id)->get()
            ->map(function ($course) use ($user) {
                $score = Score::where('user_id', $user->id)->where('course_id', $course->id)->value('score') ?? 0;

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'levelCount' => Level::where('course_id', $course->id)
                        ->where('institution_id', $user->institution_id)
                        ->where('is_enabled', true)
                        ->count(),
                    'score' => $score,
                    'rank' => $score > 0
                        ? Score::where('course_id', $course->id)->where('score', '>', $score)->count() + 1
                        : null,
                ];
            });

        return Inertia::render('Course', [
            'courses' => $courses,
            'lastCourseId' => Level::find($user->last_level)?->course_id,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'selectedInstitutionName' => 'required|string',
        ], [
            'name.required' => 'Le nom du cours est requis',
        ]);
        $initiator = auth()->user();

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à créer un cours',
            ], 403);
        }

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->selectedInstitutionName != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de créer un cours pour une autre institution'], 403);
        }

        Course::create([
            'name' => $request->name,
            'institution_id' => $institution,
        ]);

        $this->logsController->createLog(
            'Cours',
            "Le cours <strong>'{$request->name}'</strong> a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">créé</span> pour l'institution <strong>{$institution_name}</strong>.",
            $initiator->id
        );

        return response()->json(['message' => 'Le cours a été créé avec succès pour l\'institution \''. $institution_name . '\'']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string',
            'institution_name' => 'required|string',
        ]);

        $initiator = auth()->user();

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à supprimer un cours',
            ], 403);
        }

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->institution_name != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de supprimer un cours d\'une autre institution'], 403);
        }

        $course = Course::find($request->course_id);
        $course->delete();

        $this->logsController->createLog(
            'Cours',
            "Le cours <strong>'{$request->name}'</strong> a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span> pour l'institution <strong>{$institution_name}</strong>.",
            $initiator->id
        );

        return response()->json(['message' => 'Le cours \''. $course->name . '\' a été supprimé avec succès']);
    }

    public function getAllCourses(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
        ]);

        $courses = Course::where('institution_id', $request->institution_id)->get();

        return response()->json($courses);
    }
}
