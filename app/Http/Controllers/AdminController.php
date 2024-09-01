<?php

namespace App\Http\Controllers;

use App\Models\AdminControl;
use App\Models\Level;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('AdminControl');
    }

    public function getAllUsers(): JsonResponse
    {
        // Eager load the institution relationship
        $users = User::with('institution')->get();

        foreach ($users as $user) {
            $user->is_admin = $user->administrator()->exists();
            // Access the institution name directly
            $user->institution_name = $user->institution ? $user->institution->name : null;
        }

        return response()->json($users);
    }

    public function updateUsername(Request $request): JsonResponse
    {
        $request->validate([
            'current_username' => 'required|string',
            'new_username' => 'required|string|unique:users,username|max:18',
        ]);

        // Find the user by current username
        $user = User::where('username', $request->current_username)->first();

        if (!$user) {
            return response()->json(['message' => 'Le nom d\'utilisateur actuel n\'est pas trouvé.'], 404);
        }

        $user->username = $request->new_username;
        $user->save();

        return response()->json(['message' => 'Le nom d\'utilisateur a été mis à jour avec succès.'], 200);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_username' => 'required|string',
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        $user = User::where('username', $request->current_username)->first();

        if (!$user) {
            return response()->json(['message' => 'Le nom d\'utilisateur n\'est pas trouvé.'], 404);
        }
        else {
            // Check if new password and confirm password are the same
            if ($request->new_password !== $request->confirm_password) {
                return response()->json(['message' => 'Les mots de passe ne correspondent pas.'], 400);
            }
            else {
                $user->password = bcrypt($request->new_password);
                $user->save();

                return response()->json(['message' => 'Le mot de passe a été mis à jour avec succès.'], 200);
            }
        }
    }

    public function makeAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer',
            'name' => 'required|string',
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['message' => $request->name . ' n\'a pas été trouvé.'], 404);
        } else {
            // Insert the user ID into the admin_controls table
            $adminControl = new AdminControl();
            $adminControl->user_id = $request->user_id;
            $adminControl->save();

            return response()->json(['message' => $request->name . ' a été promu·e avec succès.'], 200);
        }
    }

    public function removeAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer',
            'name' => 'required|string',
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['message' => $request->name . ' n\'a pas été trouvé.'], 404);
        } else {
            // Delete the user ID from the admin_controls table
            $adminControl = AdminControl::where('user_id', $request->user_id)->first();
            $adminControl->delete();

            return response()->json(['message' => $request->name . ' a été rétrogradé.e avec succès.'], 200);
        }
    }

    public function removeLevel(Request $request): JsonResponse
    {
        $request->validate([
            'level_id' => 'required|integer',
            'name' => 'required|string',
        ]);

        $level = Level::find($request->level_id);

        if (!$level) {
            return response()->json(['message' => 'Le niveau \'' . $request->name . '\' n\'a pas été trouvé.'], 404);
        } else {
            // Delete the level ID from the levels table
            $level->delete();

            return response()->json(['message' => 'Le niveau \'' . $request->name . '\' a été supprimé avec succès.'], 200);
        }
    }

    public function addLevel(Request $request): JsonResponse
    {
        $request->validate([
            'nom' => 'required|digits:3|unique:levels,name',
        ]);

        $level = new Level();
        $level->name = $request->nom;
        $level->save();

        return response()->json(['message' => 'Le niveau \'' . $request->nom . '\' a été ajouté avec succès.'], 200);
    }

    public function deleteUser(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer',
            'name' => 'required|string',
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['message' => 'L\'utilisateur n\'a pas été trouvé.'], 404);
        } else {
            // Delete the user ID from the users table
            $user->delete();

            return response()->json(['message' => 'Le compte de ' . $request->name . ' a été supprimé avec succès.'], 200);
        }
    }
}
