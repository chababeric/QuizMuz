<?php

namespace App\Http\Controllers;

use App\Models\SoloGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuizSoloController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('QuizSolo');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'pieces_list_id' => 'required|array|min:1',
            'pieces_list_id.*' => 'integer',
            'difficulty' => 'required|integer',
//            'current_piece_id' => 'required|array',
//            'correct_answers' => 'required|array',
            'level' => 'required|integer',
            'courseId' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id();

        $soloGame = SoloGame::create($data);

        return redirect()->route('quizsolo', [
            'pieces' => $soloGame->pieces_list_id,
            'difficulty' => $soloGame->difficulty,
            'level' => $data['level'],
            'courseId' => $data['courseId'],
        ]);
    }

    public function updateLastActionTime(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->last_action_time = now();
            $user->save();

            return response()->json(['message' => 'Last action time updated successfully']);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }
}
