<?php

namespace App\Http\Middleware;

use App\Models\Course;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CourseAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next, $courseSlug = null): Response
    {
        $user = $request->user();

        // Allow SuperAdmin and Teacher to access all courses
        if ($user->hasPrivilege('SuperAdmin') || $user->hasPrivilege('Teacher')) {
            return $next($request);
        }

        // If no specific course is provided, deny access
        if (!$courseSlug) {
            abort(403, 'Unauthorized');
        }

        // Get course by name
        $course = Course::where('name', $courseSlug)->first();

        if (!$course) {
            abort(404, 'Course not found');
        }

        // Check if user is admin for this course
        if (!$user->isCourseAdmin($course->id)) {
            abort(403, 'You do not have permission to access this course');
        }

        return $next($request);
    }
}
