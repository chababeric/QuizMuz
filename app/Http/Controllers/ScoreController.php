<?php

namespace App\Http\Controllers;

use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function getAllScores(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
        ]);

        $scores = Score::with('user')
            ->join('users', 'scores.user_id', '=', 'users.id')
            ->where('users.institution_id', $request->institution_id)
            ->orderBy('score', 'desc')
            ->select('scores.*') // Select scores columns to avoid ambiguity
            ->get();

        return response()->json($scores);
    }

    public function index(): JsonResponse
    {
        $scores = Score::with('user')
            ->orderBy('score', 'desc')
            ->take(10)
            ->get()
            ->makeHidden(['user_id']);

        return response()->json($scores);
    }

    public function show($id): JsonResponse
    {
        $score = Score::findOrFail($id);
        return response()->json($score);
    }

//    public function store(Request $request): JsonResponse
//    {
//        $request->validate([
//            'user_id' => 'required|exists:users,id',
//            'score' => 'required|integer',
//        ]);
//
//        // Find the existing score record for the user or create a new one with score 0
//        $score = Score::firstOrNew(['user_id' => $request->user_id]);
//
//        // Add the new score to the existing score
//        $score->score += $request->score;
//
//        // Save the updated score
//        $score->save();
//
//        return response()->json($score, 200);
//    }

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
        $initiator = auth()->user();

        if (!$initiator || !$initiator->institution_id) {
            return response()->json(['message' => 'User or institution not found.'], 400);
        }

        Score::whereHas('user', function ($query) use ($initiator) {
            $query->where('institution_id', $initiator->institution_id);
        })->update(['score' => 0]);

        $this->logsController->createLog(
            'Scores',
            "Tous les scores ont été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">réinitialisés</span>.",
            $initiator->id
        );

        return response()->json(['message' => 'Les scores ont été réinitialisés avec succès.']);
    }

    public function getUserScore(): JsonResponse
    {
        $user = auth()->user();
        $score = Score::where('user_id', $user->id)->first();
        return response()->json($score);
    }
}
