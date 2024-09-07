<?php

namespace App\Http\Controllers;

use App\Models\Course;
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
}
