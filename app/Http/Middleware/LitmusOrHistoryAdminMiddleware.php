<?php

namespace App\Http\Middleware;

use App\Services\AccessControlService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LitmusOrHistoryAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        // SuperAdmin can access everything
        if ($user->hasPrivilege('SuperAdmin')) {
            return $next($request);
        }

        // For Teacher and StudentAdmin, check if they also have litmus access
        if (($user->hasPrivilege('Teacher') || $user->hasPrivilege('StudentAdmin'))) {
            // Use the AccessControlService to check for litmus access
            $accessControlService = app(AccessControlService::class);
            if ($accessControlService->hasCourseAccess($user, 'litmus_admin') ||
                $accessControlService->hasCourseAccess($user, 'history_admin')) {
                return $next($request);
            }
        }

        return redirect('/')->with('error', 'Vous n\'avez pas les droits nécessaires pour faire cette opération.');
    }
}
