<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\FmaGame;
use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuizFMAController extends BaseQuizController
{
    public function index(): Response
    {
        return Inertia::render('QuizFMA');
    }

    public function show(Request $request): Response
    {
        $data = $request->validate([
            'chords_list_id' => 'required|array|min:1',
            'chords_list_id.*' => 'integer',
            'difficulty' => 'required|integer',
            'level_id' => 'required|integer',
            'courseId' => 'required|integer',
            'game_key' => 'required|string',
        ]);

        $userId = Auth::id();
        $data['user_id'] = $userId;
        $gameKey = $data['game_key'];

        $fmaGame = null;
        if ($gameKey) {
            $fmaGame = FmaGame::where('user_id', $userId)
                ->where('game_key', $gameKey)
                ->first();
        }

        if (!$fmaGame) {
            $this->ensureSingleGame($userId, 'fma');

            $fmaGame = FmaGame::create(array_merge($data, [
                'game_key' => $gameKey,
            ]));

            $randomChord = $this->generateRandomChord($data['chords_list_id']);
            if ($randomChord) {
                $fmaGame->current_chord_id = $randomChord['current_chord_id'];
                $fmaGame->correct_answer = $randomChord['correct_answer'];
                $fmaGame->save();
            }
        }

        $chordsData = $this->getChordsData(
            $data['difficulty'],
            $data['chords_list_id']
        );

        return Inertia::render('QuizFMA', [
            'difficulty' => $data['difficulty'],
            'level_id' => $data['level_id'],
            'courseId' => $data['courseId'],
            'selectListData' => $chordsData,
            'current_chord_mp3' => $fmaGame && $fmaGame->current_chord_id ? (Chord::find($fmaGame->current_chord_id)->file_name ?? '') : '',
            'current_score' => Score::where('user_id', $userId)->first()->score ?? 0,
        ]);
    }

    public function getChordsData(string $difficulty, array $chordsList = []): array
    {
        if ($difficulty === '1') {
            return Chord::whereIn('id', $chordsList)->pluck('chord_name')->toArray();
        }
        return [];
    }

    public function generateRandomChord(array $chordsList): ?array
    {
        $shuffledChords = $this->fisher_yates_shuffle($chordsList);

        if (!empty($shuffledChords)) {
            $selectedChordIndex = $this->rng(count($shuffledChords));
            $currentChordId = $shuffledChords[$selectedChordIndex];
            $chord = Chord::find($currentChordId);

            if ($chord) {
                return [
                    'current_chord_id' => $currentChordId,
                    'current_chord_mp3' => $chord->file_name,
                    'correct_answer' => $chord->chord_name,
                    'shuffled_chords' => $shuffledChords,
                ];
            }
        }
        return null;
    }

    public function updateLastActionTime(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->last_action_time = now();
            $user->save();

            return response()->json(['message' => 'Last action time updated successfully']);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    public function grade(Request $request): array
    {
        $validated = $request->validate([
            'selectedAnswer' => 'required|string',
        ]);
        $this->updateLastActionTime();
        $selectedAnswer = $validated['selectedAnswer'];
        $userId = auth()->id();

        $fmaGame = FmaGame::where('user_id', $userId)->first();
        if (!$fmaGame) {
            return ['status' => 'error', 'message' => 'Game not found'];
        }

        $correctAnswer = $fmaGame->correct_answer;
        $difficulty = $fmaGame->difficulty;

        $pointsPerCorrectAnswer = match ($difficulty) {
            1 => 2,
            3 => 5,
            default => 0,
        };
        $isCorrect = $this->comparator($selectedAnswer, $correctAnswer);

        $score = $this->updateScore($userId, $pointsPerCorrectAnswer);

        return [
            'status' => $isCorrect ? 'correct' : 'incorrect',
            'score' => $score,
        ];
    }

    public function getNext(Request $request): array
    {
        return $this->getNextChord($request);
    }

    public function getNextChord(Request $request): array
    {
        $validated = $request->validate([
            'playChordOnce' => 'required|boolean',
        ]);

        $playChordOnce = $validated['playChordOnce'];
        $userId = auth()->id();

        $fmaGame = FmaGame::where('user_id', $userId)->first();
        if (!$fmaGame) {
            return ['status' => 'error', 'message' => 'Game not found'];
        }

        $currentChordId = $fmaGame->current_chord_id;

        // Remove the chord for the list if it has been played and playPieceOnce is true
        if ($playChordOnce) {
            $chordsList = $fmaGame->chords_list_id ?? [];
            $chordIndex = array_search($currentChordId, $chordsList);
            if ($chordIndex !== false) {
                unset($chordsList[$chordIndex]);
                $fmaGame->chords_list_id = array_values($chordsList);
                $fmaGame->save();
            }

            $randomChord = $this->generateRandomChord($fmaGame->chords_list_id);
            if ($randomChord) {
                $fmaGame->current_chord_id = $randomChord['current_chord_id'];
                $fmaGame->correct_answer = $randomChord['correct_answer'];
                $fmaGame->save();

            }
        }
        else {
            $randomChord = $this->generateRandomChord($fmaGame->chords_list_id ?? []);
            if ($randomChord) {
                $fmaGame->current_chord_id = $randomChord['current_chord_id'];
                $fmaGame->correct_answer = $randomChord['correct_answer'];
                $fmaGame->save();
            }
        }
        return [
            'current_chord_mp3' => $randomChord['current_chord_mp3'] ?? '',
        ];
    }
}
