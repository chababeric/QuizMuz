<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserStats
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            // Increment nb_practice when the user is practicing and nb_game_solo when the user is playing a solo game
            if ($request->path() === 'practice') {
                $user->nb_practice++;
            }
            else if ($request->path() === 'quizsolo') {
                $user->nb_game_solo++;
            }
            $user->save();
        }
        return $next($request);
    }

    public function incrementTotalPiecesPlayed(Request $request): JsonResponse
    {
        $user = User::find($request->userId);
        if ($user) {
            $user->increment('total_pieces_played');
            return response()->json(['message' => 'Total pieces played incremented successfully'], 200);
        } else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }

    public function getTotalStats(): JsonResponse
    {
        $totalPractice = User::sum('nb_practice');
        $totalSoloGames = User::sum('nb_game_solo');
        $totalUsers = User::count();
        $totalPiecesPlayed = User::sum('total_pieces_played');

        return response()->json([
            'totalPractice' => $totalPractice,
            'totalSoloGames' => $totalSoloGames,
            'totalUsers' => $totalUsers,
            'totalPiecesPlayed' => $totalPiecesPlayed
        ]);
    }

    public function setDifficulty(Request $request): JsonResponse
    {
        $request->validate([
            'userId' => 'required|integer',
            'difficulty' => 'required|integer'
        ]);

        $user = User::find($request->userId);
        if ($user) {
            $user->last_difficulty = $request->difficulty;
            $user->save();
            return response()->json(['message' => 'Difficulté mise à jour avec succès'], 200);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }
}
