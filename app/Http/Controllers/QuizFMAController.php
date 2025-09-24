<?php

namespace App\Http\Controllers;

use App\Http\Middleware\UserStats;
use App\Models\Chord;
use App\Models\Course;
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
        $course_id = Course::where('name', $request->input('course_name'))->value('id');

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
                'course_id' => $course_id,
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

        $userStats = new UserStats();
        $userStats->incrementUserStats($userId, $data['courseId'], 'quiz');

        $currentScore = Score::where('user_id', $userId)
            ->where('course_id', $course_id)
            ->first()->score ?? 0;

        return Inertia::render('QuizFMA', [
            'difficulty' => $data['difficulty'],
            'level_id' => $data['level_id'],
            'courseId' => $data['courseId'],
            'selectListData' => $chordsData,
            'current_chord_mp3' => $fmaGame && $fmaGame->current_chord_id ? (Chord::find($fmaGame->current_chord_id)->file_name ?? '') : '',
            'current_score' => $currentScore,
        ]);
    }

    public function getChordsData(string $difficulty, array $chordsList = []): array
    {
        if ($difficulty === '1') {
            $chordNames = Chord::whereIn('id', $chordsList)->pluck('chord_name')->toArray();
            return array_unique($chordNames);
        } elseif ($difficulty === '3') {
            $chord = Chord::find(FmaGame::where('user_id', Auth::id())->first()->current_chord_id ?? 0);
            if ($chord) {
                $chordParts = explode(' - ', $chord->chord_name);
                return [
                    'chordCount' => count($chordParts),
                    'formula' => $chord->chord_name
                ];
            }
            return ['chordCount' => 0, 'formula' => ''];
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
        }
        return response()->json(['status' => 'success']);
    }

    public function grade(Request $request): array
    {
        $validated = $request->validate([
            'selectedAnswer' => 'string|nullable',
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
        $courseId = $fmaGame->course_id;

        $pointsPerCorrectAnswer = match ($difficulty) {
            1 => 2,
            3 => 5,
            default => 0,
        };
        $isCorrect = $this->comparator($selectedAnswer, $correctAnswer, true);

        // Only update score if the answer is correct
        $score = $isCorrect
            ? $this->updateScore($userId, $pointsPerCorrectAnswer, $courseId)
            : Score::where('user_id', $userId)->where('course_id', $courseId)->first()->score ?? 0;


        return [
            'status' => $isCorrect ? 'correct' : 'incorrect',
            'correctAnswer' => $correctAnswer,
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

        $this->updateLastActionTime();
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

        // Get the updated chord data for hard difficulty
        $chordsData = [];
        if ($fmaGame && $fmaGame->difficulty == 3) {
            $chord = Chord::find($fmaGame->current_chord_id);
            if ($chord) {
                $chordParts = explode(' - ', $chord->chord_name);
                $chordsData = [
                    'chordCount' => count($chordParts),
                    'formula' => $chord->chord_name
                ];
            }
        }

        return [
            'current_chord_mp3' => $randomChord['current_chord_mp3'] ?? '',
            'chordsData' => $chordsData
        ];
    }
}
