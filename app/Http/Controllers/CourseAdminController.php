<?php

namespace App\Http\Controllers;

use App\Models\AdminControl;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseAdminController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function getCourseAdmins(Request $request, $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        // Check permission
        if (!auth()->user()->hasPrivilege('SuperAdmin') &&
            !auth()->user()->hasPrivilege('Teacher') &&
            !auth()->user()->isCourseAdmin($courseId)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $admins = $course->admins;

        return response()->json($admins);
    }

    public function addCourseAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'admin_control_id' => 'required|exists:admin_controls,id',
        ]);

        $user = User::find($request->user_id);
        $course = Course::find($request->course_id);
        $role = AdminControl::find($request->admin_control_id);

        // Check if user already has this role for this course
        $existingRole = $user->adminCourses()
            ->where('course_id', $course->id)
            ->wherePivot('admin_control_id', $role->id)
            ->exists();

        if ($existingRole) {
            return response()->json([
                'message' => "L'utilisateur a déjà le rôle {$role->name} pour le cours {$course->name}."
            ], 400);
        }

        // Attach the role to the user for the specific course
        $user->adminCourses()->attach($course->id, ['admin_control_id' => $role->id]);

        // Log the action
        $initiator = $request->user();
        $this->logsController->createLog(
            'Permission',
            "Accès <strong>{$role->name}</strong> <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">accordé</span> à <strong>{$user->first_name} {$user->last_name}</strong>.",
            $initiator->id
        );

        return response()->json([
            'message' => "Le rôle {$role->name} a été ajouté à l'utilisateur {$user->first_name} {$user->last_name} pour le cours {$course->name}."
        ]);
    }

    /**
     * Remove an admin from a course
     */
    public function removeCourseAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'admin_control_id' => 'required|exists:admin_controls,id', // Changed from 'role_id' to 'admin_control_id'
        ]);

        $user = User::find($request->user_id);
        $course = Course::find($request->course_id);
        $role = AdminControl::find($request->admin_control_id);

        // Check if user has this role for this course
        $existingRole = $user->adminCourses()
            ->where('course_id', $course->id)
            ->wherePivot('admin_control_id', $role->id)
            ->exists();

        if (!$existingRole) {
            return response()->json([
                'message' => "L'utilisateur n'a pas le rôle {$role->name} pour le cours {$course->name}."
            ], 400);
        }

        // Detach the role from the user for the specific course
        $user->adminCourses()->wherePivot('course_id', $course->id)
            ->wherePivot('admin_control_id', $role->id)
            ->detach();

        // Log the action
        $initiator = $request->user();
        $this->logsController->createLog(
            'Permission',
            "Accès <strong>{$role->name}</strong> <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">retiré</span> à <strong>{$user->first_name} {$user->last_name}</strong>.",
            $initiator->id
        );

        return response()->json([
            'message' => "Le rôle {$role->name} a été retiré de l'utilisateur {$user->first_name} {$user->last_name} pour le cours {$course->name}."
        ]);
    }
}
