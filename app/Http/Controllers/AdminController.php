<?php

namespace App\Http\Controllers;

use App\Models\AdminControl;
use App\Models\Level;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
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

    public function updateUsername(Request $request): RedirectResponse
    {
        $initiator = $request->user();
        $request->validate([
            'old_username' => 'required|string',
            'new_username' => 'required|string|unique:users,username|max:18',
        ],
        [
            'new_username.unique' => 'Le nouveau nom d\'utilisateur est déjà pris.',
            'new_username.max' => 'Le nom d\'utilisateur ne doit pas dépasser 16 caractères.',
        ]);
        // Find the user by current username
        $user = User::where('username', $request->old_username)->first();

        if (!$user) {
            return Redirect::back()->withErrors(['old_username' => 'Le nom d\'utilisateur n\'a pas été trouvé.']);
        }

        $user->username = $request->new_username;
        $user->save();

        // Log the action
        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Username update');
        Log::info('INITIATOR ID: ' . $user->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('Usernames Updated: ' . $request->old_username . ' -> ' . $request->new_username);
        Log::info('**********END TRANSACTION**********');

        return Redirect::route('account.edit');
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
