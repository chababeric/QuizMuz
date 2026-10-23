<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateLastActionTime
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Only write once per minute; the session timeout is 20 minutes, so this precision is enough
            if (!$user->last_action_time || Carbon::parse($user->last_action_time)->lt(now()->subMinute())) {
                $user->last_action_time = now();
                $user->save();
            }
        }
        return $next($request);
    }
}
