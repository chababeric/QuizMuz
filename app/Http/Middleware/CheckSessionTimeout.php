<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CheckSessionTimeout
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $lastActionTime = $user->last_action_time;

            if ($lastActionTime) {
                // Parse last_action_time as Carbon instance
                $lastActionTime = Carbon::parse($lastActionTime);

                // Calculate the difference in minutes
                $diffInMinutes = $lastActionTime->diffInMinutes(Carbon::now());

                if ($diffInMinutes > 20) {
                    Auth::logout();
                    Session::flush();
                    return redirect()->route('login')->withErrors(['message' => 'Your session has expired due to inactivity. Please log in again.']);
                }
            }
        }

        return $next($request);
    }
}
