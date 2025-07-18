<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LogsController;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', Password::defaults(), 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        if (!$initiator->isAdmin()) {
            return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à modifier le mot de passe d\'un utilisateur.']);
        }

        $user = User::where('username', $request->username)->first();

        if (!$user) {
            return back()->withErrors(['username' => 'Le nom d\'utilisateur n\'a pas été trouvé.']);
        }
        else
        {
            if($request->password !== $request->password_confirmation)
            {
                return back()->withErrors(['password' => 'Les mots de passe ne correspondent pas.']);
            }
            else
            {
                $user->password = Hash::make($request->password);
                $user->save();

                $this->logsController->createLog(
                    'Compte',
                    "Le mot de passe de l'utilisateur <strong>{$user->username}</strong> a été <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
                    $initiator->id
                );
            }
        }

        return back();
    }
}
