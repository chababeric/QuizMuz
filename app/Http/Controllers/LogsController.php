<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LogsController extends Controller
{
    public function index(): Response
    {
        // Fetch the logs page by page, newest first
        $logs = Log::with('user:id,first_name,last_name')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Logs/Edit', [
            'logs' => $logs
        ]);
    }

    public function createLog(string $action, string $description, ?int $userId = null): Log
    {
        // If no user ID is provided, use the currently authenticated user
        $userId = $userId ?? Auth::id();

        // Create and return the log entry
        return Log::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
        ]);
    }
}
