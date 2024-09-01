<?php

namespace App\Http\Controllers;

use App\Models\AdminKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminKeyController extends Controller
{
    //Validates the input key.
    //Hashes the key.
    //Stores the hashed key in the database.
    public function store(Request $request): JsonResponse
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
            return response()->json([
                'message' => 'Mot de passe incorrect.'
            ], 403);
        }

        // Hash the new admin key
        $hashedKey = Hash::make($request->newKey);
        AdminKey::updateOrCreate([], ['hashed_key' => $hashedKey]);

        return response()->json(['message' => 'La Clé Admin a été mise à jour avec succès.'], 200);
    }

    // Validate an admin key
    //Validates the input key.
    //Checks if the provided key matches any hashed key in the database.
    //Returns a JSON response indicating whether the key is valid or not.
    public function validateKey(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $adminKey = AdminKey::first();

        if ($adminKey && Hash::check($request->key, $adminKey->hashed_key)) {
            return response()->json(['message' => 'Clé Admin vérifiée avec succès.'], 200);
        }

        return response()->json(['message' => 'La Clé Admin est incorrecte.'], 401);
    }
}
