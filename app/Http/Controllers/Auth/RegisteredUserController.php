<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminControl;
use App\Models\AdminKey;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
//use function Laravel\Prompts\password;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:64',
            'last_name' => 'required|string|max:64',
            'institution' => 'required|int|exists:institutions,id',
            'username' => [
                'required',
                'string',
                'max:16',
                'unique:' . User::class,
                'regex:/^[a-zA-Z0-9_-]+$/',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'admin_password' => 'required|string',
        ], [
            'username.regex' => 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres, des tirets et des underscores.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères.',
            'institution.exists' => 'Sélectionnez une institution valide.',
        ]);

        $adminKey = AdminKey::first();
        $hashedAdminPassword = $adminKey->hashed_key;
        if (!Hash::check($request->admin_password, $hashedAdminPassword)) {
            return redirect()->back()->withErrors(['admin_password' => 'La Clé Admin est incorrecte.']);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'institution_id' => $request->institution,
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);

        $user->last_action_time = now();
        $user->save();

        $studentRole = AdminControl::where('system_name', 'student')->first();
        if ($studentRole) {
            $user->roles()->attach($studentRole->id);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('welcome', absolute: false));
    }
}
