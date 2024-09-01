<?php

namespace App\Http\Controllers;

use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    public function getAllScores(): JsonResponse
    {
        $scores = Score::with('user')
            ->join('users', 'scores.user_id', '=', 'users.id')
            ->orderBy('users.username', 'asc')
            ->select('scores.*') // Select scores columns to avoid ambiguity
            ->get();

        return response()->json($scores);
    }

    public function index(): JsonResponse
    {
        $scores = Score::with('user')
            ->orderBy('score', 'desc')
            ->take(10)
            ->get();

        return response()->json($scores);
    }

    public function show($id): JsonResponse
    {
        $score = Score::findOrFail($id);
        return response()->json($score);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'score' => 'required|integer',
        ]);

        // Find the existing score record for the user or create a new one with score 0
        $score = Score::firstOrNew(['user_id' => $request->user_id]);

        // Add the new score to the existing score
        $score->score += $request->score;

        // Save the updated score
        $score->save();

        return response()->json($score, 200);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'score' => 'required|integer',
        ]);

        $score = Score::findOrFail($id);
        $score->update($request->all());
        return response()->json($score);
    }

    public function destroy($id): JsonResponse
    {
        $score = Score::findOrFail($id);
        $score->delete();
        return response()->json(null, 204);
    }

    public function resetScores(): JsonResponse
    {
        Score::truncate();
        return response()->json(['message' => 'Les scores ont été réinitialisés avec succès.']);
    }

    public function getUserScore(): JsonResponse
    {
        $user = auth()->user();
        $score = Score::where('user_id', $user->id)->first();
        return response()->json($score);
    }
}
