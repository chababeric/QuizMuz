<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return redirect('/login');
        }

        $hasRequiredPrivilege = false;

        foreach ($roles as $role) {
            if ($request->user()->hasPrivilege($role)) {
                $hasRequiredPrivilege = true;
                break;
            }
        }

        if (!$hasRequiredPrivilege) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les privilèges nécessaires pour accéder à cette page.');
        }

        return $next($request);
    }
}
