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
    public function handle(Request $request, Closure $next, ...$privileges): Response
    {
        if (!$request->user()) {
            return redirect('/login');
        }

        $hasRequiredPrivilege = false;

        foreach ($privileges as $privilege) {
            if ($request->user()->hasPrivilege($privilege)) {
                $hasRequiredPrivilege = true;
                break;
            }
        }

        if (!$hasRequiredPrivilege) {
            return redirect('/')->with('error', 'Vous n\'avez pas les privilèges nécessaires pour accéder à cette page.');
        }

        return $next($request);
    }
}
