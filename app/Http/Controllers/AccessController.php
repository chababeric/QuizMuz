<?php

namespace App\Http\Controllers;

use App\Models\AdminControl;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AccessController extends Controller
{
    public function index(): Response
    {
        $roles = AdminControl::all();
        $courses = Course::all();
        $user = auth()->user()->load('roles');

        return Inertia::render('Access/Edit', [
            'roles' => $roles,
            'courses' => $courses,
            'user' => $user,
        ]);
    }

    /**
     * Get all roles
     *
     * @return JsonResponse
     */
    public function getRoles(): JsonResponse
    {
        $roles = AdminControl::all();
        return response()->json($roles);
    }

    public function addRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:admin_controls,id',
        ]);

        $user = User::find($request->user_id);
        $role = AdminControl::find($request->role_id);

        // Check if user already has this role
        if ($user->roles()->where('admin_control_id', $role->id)->exists()) {
            return response()->json(['message' => "L'utilisateur a déjà le rôle {$role->name}."], 400);
        }
        // Attach the role to the user
        $user->roles()->attach($role->id);

        // Log the action
        $initiator = $request->user();
        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Role addition');
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('User ID: ' . $user->id);
        Log::info('User Name: ' . $user->first_name . ' ' . $user->last_name);
        Log::info('Role Added: ' . $role->name);
        Log::info('**********END TRANSACTION**********');

        return response()->json(['message' => "Le rôle {$role->name} a été ajouté à l'utilisateur {$user->first_name} {$user->last_name}."]);
    }

    public function removeRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:admin_controls,id',
        ]);

        $user = User::find($request->user_id);
        $role = AdminControl::find($request->role_id);

        // Check if user has this role
        if (!$user->roles()->where('admin_control_id', $role->id)->exists()) {
            return response()->json(['message' => "L'utilisateur n'a pas le rôle {$role->name}."], 400);
        }

        // Detach the role from the user
        $user->roles()->detach($role->id);

        // Log the action
        $initiator = $request->user();
        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Role removal');
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('User ID: ' . $user->id);
        Log::info('User Name: ' . $user->first_name . ' ' . $user->last_name);
        Log::info('Role Removed: ' . $role->name);
        Log::info('**********END TRANSACTION**********');

        return response()->json(['message' => "Le rôle {$role->name} a été retiré de l'utilisateur {$user->first_name} {$user->last_name}."]);
    }
}
