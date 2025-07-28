<?php

use App\Http\Middleware\CheckSessionTimeout;
use App\Http\Middleware\FmaAdminMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HistoryAdminMiddleware;
use App\Http\Middleware\LitmusAdminMiddleware;
use App\Http\Middleware\LitmusOrHistoryAdminMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\UpdateLastActionTime;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'litmus' => LitmusAdminMiddleware::class,
            'access' => RoleMiddleware::class,
            'history' => HistoryAdminMiddleware::class,
            'litmus_history' => LitmusOrHistoryAdminMiddleware::class,
            'check_timeout' => CheckSessionTimeout::class,
            'update_user_action_time' => UpdateLastActionTime::class,
            'fma' => FmaAdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
