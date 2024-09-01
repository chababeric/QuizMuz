<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Http\Middleware\UserStats;

class UserStatsController extends Controller
{
    public function getTotalStats(): JsonResponse
    {
        $userStats = new UserStats();
        return $userStats->getTotalStats();
    }
}
