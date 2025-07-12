<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Institution;
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
        return Inertia::render('Course', [
            'courses' => Course::where('institution_id', auth()->user()->institution_id)->get(),
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

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;
        $initiator = auth()->user();

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

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;
        $initiator = auth()->user();

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
