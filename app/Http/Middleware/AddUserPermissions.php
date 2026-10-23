<?php

namespace App\Http\Middleware;

use App\Services\AccessControlService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddUserPermissions
{
    protected AccessControlService $accessControlService;

    public function __construct(AccessControlService $accessControlService)
    {
        $this->accessControlService = $accessControlService;
    }

    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $user = auth()->user()->loadMissing('roles');
            $permissions = $this->accessControlService->getUserAccessControls($user);

            // Share permissions with all Inertia responses
            Inertia::share('permissions', $permissions);
        }

        return $next($request);
    }
}
