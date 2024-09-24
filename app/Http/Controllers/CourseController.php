<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Course', [
            'courses' => Course::where('institution_id', auth()->user()->institution_id)->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $institution = auth()->user()->institution_id;

        $request->validate([
            'name' => 'required|string',
        ], [
            'name.required' => 'Le nom du cours est requis',
        ]);

        Course::create([
            'name' => $request->name,
            'institution_id' => $institution,
        ]);

        return response()->json(['message' => 'Le cours a été créé avec succès pour l\'institution \''. $institution . '\'']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $course = Course::find($request->course_id);
        $course->delete();

        return response()->json(['message' => 'Le cours \''. $course->name . '\' a été supprimé avec succès']);
    }

    public function getAllCourses(): JsonResponse
    {
        $courses = Course::where('institution_id', auth()->user()->institution_id)->get();

        return response()->json($courses);
    }
}
