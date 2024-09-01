<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Update the last action time of the authenticated user.
     * Author: Eric El-Chabab
     */
    protected function authenticated($user): void
    {
        $user->last_action_time = now();
        $user->save();
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): Response
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Eric : Explicitly call the authenticated method
        $this->authenticated(Auth::user());

//        return redirect()->intended(route('mainmenu', absolute: false));
        $user = Auth::user();
        $isAdmin = $user->administrator()->exists();

        return Inertia::render('Welcome', [
            'auth' => [
                'user' => $user,
                'isAdmin' => $isAdmin,
            ],
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
