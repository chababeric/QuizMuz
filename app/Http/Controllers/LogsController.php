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
        // Fetch all the logs and sort them by created_at in descending order
        $logs = Log::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

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
