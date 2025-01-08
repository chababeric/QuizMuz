<?php

namespace App\Http\Controllers;

use App\Models\AdminKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;

class AdminKeyController extends Controller
{
    //Validates the input key.
    //Hashes the key.
    //Stores the hashed key in the database.
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'newKey' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[\W_])(?=\S+$).*$/'
            ],
            'userPassword' => 'required|string',
        ], [
            'newKey.regex' => 'La clé Admin doit contenir au moins un caractère spécial.',
            'newKey.min' => 'La clé Admin doit contenir au moins 8 caractères.',
        ]);

        $user = Auth::user();
        // Verify the user's password
        if (!Hash::check($request->userPassword, $user->password)) {
            return Redirect::back()->withErrors(['userPassword' => 'Le mot de passe est incorrect.']);
        }

        // Hash the new admin key
        $hashedKey = Hash::make($request->newKey);
        AdminKey::updateOrCreate([], ['hashed_key' => $hashedKey]);

        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Update Admin Key');
        Log::info('INITIATOR ID: ' . $user->id);
        Log::info('INITIATOR First Name: ' . $user->first_name);
        Log::info('INITIATOR Last Name: ' . $user->last_name);
        Log::info('INITIATOR Username: ' . $user->username);
        Log::info('New Key: ' . $request->newKey);
        Log::info('**********END TRANSACTION**********');

        return Redirect::route('account.edit');
    }

    // Validate an admin key
    //Validates the input key.
    //Checks if the provided key matches any hashed key in the database.
    //Returns a JSON response indicating whether the key is valid or not.
    public function validateKey(Request $request): RedirectResponse
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $adminKey = AdminKey::first();

        if ($adminKey && Hash::check($request->key, $adminKey->hashed_key)) {
            return Redirect::route('account.edit');
        }

        return Redirect::back()->withErrors(['key' => 'La clé admin est incorrecte.']);
    }
}
