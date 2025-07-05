<?php

namespace App\Http\Controllers;

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
        $users = User::with(['institution', 'roles'])->get();

        foreach ($users as $user) {
            $user->is_admin = $user->isAdmin();
            // Access the institution name directly
            $user->institution_name = $user->institution ? $user->institution->name : null;
        }

        return response()->json($users);
    }

    public function getUsersFromInstitution(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
        ]);

        $users = User::where('institution_id', $request->institution_id)->get();

        foreach ($users as $user) {
            $user->is_admin = $user->isAdmin();
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

    public function findUser(Request $request): RedirectResponse
    {
        Log::info('findUser method called with request: ' . json_encode($request->all()));

        $request->validate([
            'usernameToDelete' => 'required|string',
        ]);

        $initiator = auth()->user();
        Log::info('User initiating request: ' . $initiator->username);

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            Log::info('Access denied: User does not have SuperAdmin privilege');
            return redirect()->back()->withErrors(['usernameToDelete' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer des utilisateurs.']);
        }

        $userToDelete = User::where('username', $request->usernameToDelete)->first();

        if (!$userToDelete) {
            Log::info('User not found: ' . $request->usernameToDelete);
            return redirect()->back()->withErrors(['usernameToDelete' => 'L\'utilisateur n\'a pas été trouvé.']);
        }

        Log::info('User found: ' . $userToDelete->username);
        // Store the user in the session and redirect back
        session()->flash('userToDelete', $userToDelete);
        return redirect()->back();
    }

    public function deleteUser(Request $request): RedirectResponse
    {
        $request->validate([
            'usernameToDelete' => 'required|string',
            'password' => 'required|string',
        ]);

        $initiator = $request->user();
        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return Redirect::back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer des utilisateurs.']);
        }

        if (!password_verify($request->password, $initiator->password)) {
            return Redirect::back()->withErrors(['password' => 'Le mot de passe est incorrect.']);
        }
        else {
            $user = User::where('username', $request->usernameToDelete)->first();

            if (!$user) {
                return Redirect::back()->withErrors(['usernameToDelete' => 'L\'utilisateur n\'a pas été trouvé.']);
            } else {
                // Delete the user ID from the users table
                $user->delete();

                // Log the action
                Log::info('**********START TRANSACTION**********');
                Log::info('ACTION: User deletion');
                Log::info('INITIATOR ID: ' . $user->id);
                Log::info('INITIATOR First Name: ' . $initiator->first_name);
                Log::info('INITIATOR Last Name: ' . $initiator->last_name);
                Log::info('INITIATOR Username: ' . $initiator->username);
                Log::info('User Deleted: ' . $request->usernameToDelete);
                Log::info('**********END TRANSACTION**********');

                return Redirect::route('account.edit');
            }
        }
    }
}
