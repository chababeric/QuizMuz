<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $initiator = $request->user();
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', Password::defaults(), 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

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

                Log::info('**********START TRANSACTION**********');
                Log::info('ACTION: Password update');
                Log::info('INITIATOR ID: ' . $user->id);
                Log::info('INITIATOR First Name: ' . $initiator->first_name);
                Log::info('INITIATOR Last Name: ' . $initiator->last_name);
                Log::info('INITIATOR Username: ' . $initiator->username);
                Log::info('User affected: ' . $request->username);
                Log::info('**********END TRANSACTION**********');
            }
        }

        return back();
    }
}
