<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user exists and has either SuperAdmin or Teacher privilege
        if (!$request->user() ||
            (!$request->user()->hasPrivilege('SuperAdmin') &&
                !$request->user()->hasPrivilege('Teacher'))) {
            return redirect('/');
        }

        return $next($request);
    }
}
