<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
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

    public function getAllCourses(): JsonResponse
    {
        $courses = Course::where('institution_id', auth()->user()->institution_id)->get();

        return response()->json($courses);
    }
}
