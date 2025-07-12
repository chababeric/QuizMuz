<?php

namespace App\Http\Controllers;

use App\Models\AdminKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;

class AdminKeyController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

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

        $this->logsController->createLog(
            'Clé Admin',
            "Clé Admin <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mise à jour</span> par <strong>{$user->first_name} {$user->last_name}</strong>.",
            $user->id,
        );

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
