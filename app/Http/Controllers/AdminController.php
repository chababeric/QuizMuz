<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

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

        $users = User::with(['institution', 'roles'])
            ->where('institution_id', $request->institution_id)
            ->get();

        foreach ($users as $user) {
            $user->is_admin = $user->isAdmin();
            // Access the institution name directly
            $user->institution_name = $user->institution ? $user->institution->name : null;
        }

        return response()->json($users);
    }

    public function updateUsername(Request $request): RedirectResponse
    {
        $initiator = auth()->user();

        $request->validate([
            'old_username' => 'required|string',
            'new_username' => 'required|string|unique:users,username|max:18|regex:/^\S*$/',
        ],
        [
            'new_username.unique' => 'Le nouveau nom d\'utilisateur est déjà pris.',
            'new_username.max' => 'Le nom d\'utilisateur ne doit pas dépasser 16 caractères.',
            'new_username.regex' => 'Le nom d\'utilisateur ne doit pas contenir d\'espaces.',
        ]);

        if (!$initiator->isAdmin()) {
            $this->logsController->createLog(
                'Compte',
                "Tentative de mise à jour du nom d'utilisateur <span class=\"line-through text-gray-500 dark:text-gray-400\">{$request->old_username}</span> → <strong>{$request->new_username}</strong> par un utilisateur sans privilèges.",
                $initiator->id
            );
            return Redirect::back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour le nom d\'utilisateur.']);
        }

        // Find the user by current username
        $user = User::where('username', $request->old_username)->first();

        if (!$user) {
            return Redirect::back()->withErrors(['old_username' => 'Le nom d\'utilisateur n\'a pas été trouvé.']);
        }

        $user->username = $request->new_username;
        $user->save();

        // Log the action
        $this->logsController->createLog(
            'Compte',
            "Le nom d'utilisateur <span class=\"line-through text-gray-500 dark:text-gray-400\">{$request->old_username}</span> → <strong>{$request->new_username}</strong> a été <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
            $initiator->id
        );

        return Redirect::route('account.edit');
    }

    public function findUser(Request $request): RedirectResponse
    {
        $request->validate([
            'usernameToDelete' => 'required|string',
        ]);

        $initiator = auth()->user();

        if (!$initiator->hasPrivilege('SuperAdmin')) {
            return redirect()->back()->withErrors(['usernameToDelete' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer des utilisateurs.']);
        }

        $userToDelete = User::where('username', $request->usernameToDelete)->first();

        if (!$userToDelete) {
            return redirect()->back()->withErrors(['usernameToDelete' => 'L\'utilisateur n\'a pas été trouvé.']);
        }

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
            $this->logsController->createLog(
                'Compte',
                "Tentative de suppression de l'utilisateur <strong>{$request->usernameToDelete}</strong> par un utilisateur sans privilèges.",
                $initiator->id
            );
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
                $this->logsController->createLog(
                    'Compte',
                    "L'utilisateur <strong>{$user->username}</strong> a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span>.",
                    $initiator->id
                );

                return Redirect::route('account.edit');
            }
        }
    }
}
