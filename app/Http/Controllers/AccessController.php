<?php

namespace App\Http\Controllers;

use App\Models\AdminControl;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccessController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

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

        $this->logsController->createLog(
            'Permission',
            "Accès <strong>{$role->name}</strong> <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">accordé</span> à <strong>{$user->first_name} {$user->last_name}</strong>.",
            $initiator->id
        );

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
        $this->logsController->createLog(
            'Permission',
            "Accès <strong>{$role->name}</strong> <span class=\"text-red-600 dark:text-red-400 font-semibold bg-red-100 dark:bg-red-900/30 px-1 rounded\">retiré</span> à <strong>{$user->first_name} {$user->last_name}</strong>.",
            $initiator->id
        );

        return response()->json(['message' => "Le rôle {$role->name} a été retiré de l'utilisateur {$user->first_name} {$user->last_name}."]);
    }
}
