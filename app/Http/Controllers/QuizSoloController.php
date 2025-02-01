<?php

namespace App\Http\Controllers;

use App\Models\Piece;
use App\Models\Score;
use App\Models\SoloGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class QuizSoloController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('QuizSolo');
    }

    public function show(Request $request): Response
    {
        $piecesData = [];
        $parameters_to_display = [];

        // Validate the request data
        $data = $request->validate([
            'pieces_list_id' => 'required|array|min:1',
            'pieces_list_id.*' => 'integer',
            'difficulty' => 'required|integer',
            'level_id' => 'required|integer',
            'courseId' => 'required|integer',
            'game_key' => 'required|string',
        ]);

        $userId = Auth::id();
        $data['user_id'] = $userId;
        $gameKey = $data['game_key'];

        // Check if a game exists with the provided key
        $soloGame = null;
        if ($gameKey) {
            $soloGame = SoloGame::where('user_id', $userId)
                ->where('game_key', $gameKey)
                ->first();
        }

        if (!$soloGame) {
            $this->ensureSingleSoloGame($userId);

            $soloGame = SoloGame::create(array_merge($data, [
                'game_key' => $data['game_key']
            ]));

            // Generate a random piece for the new game
            $randomPiece = $this->generateRandomPiece($data['pieces_list_id']);
            if ($randomPiece) {
                $soloGame->current_piece_id = $randomPiece['current_piece_id'];
                $soloGame->correct_answers = $randomPiece['correct_answers'];
                $soloGame->save();
            }
        }

        $piecesData = $this->getPiecesData($data['difficulty'], $data['level_id'], $data['pieces_list_id']);
        $parameters_to_display = $this->getParametersToDisplay($data['difficulty'], $soloGame);

        return Inertia::render('QuizSolo', [
            'difficulty' => $data['difficulty'],
            'level' => $data['level_id'],
            'courseId' => $data['courseId'],
            'selectListData' => $piecesData,
            'current_piece_mp3' => $soloGame->current_piece_id ? (Piece::find($soloGame->current_piece_id)->file_name ?? '') : '',
            'current_score' => Score::where('user_id', $userId)->first()->score ?? 0,
            'parameters_to_display' => $parameters_to_display,
            'game_key' => $soloGame->game_key,
        ]);
    }

    public function getParametersToDisplay(string $difficulty, SoloGame $soloGame = null): array
    {
        if ($difficulty === '1') {
            return array_keys(array_filter($soloGame->correct_answers ?? [], fn($value) => $value !== null));
        } elseif ($difficulty === '2') {
            return ['period', 'genre', 'composer', 'title', 'element', 'no_mvt', 'mvt', 'form'];
        }
        return [];
    }

    public function getPiecesData(string $difficulty, int $levelId, array $piecesList = []): array
    {
        if ($difficulty === '1') {
            return $this->getEasyPiecesData($piecesList);
        } elseif ($difficulty === '2') {
            return $this->getMediumPiecesData($levelId);
        }
        return [];
    }


    public function generateRandomPiece(array $piecesList): ?array
    {
        $shuffledPieces = $this->fisher_yates_shuffle($piecesList);

        if (!empty($shuffledPieces)) {
            $selectedPieceIndex = $this->rng(count($shuffledPieces));
            $currentPieceId = $shuffledPieces[$selectedPieceIndex];
            $piece = Piece::find($currentPieceId);

            if ($piece) {
                return [
                    'current_piece_id' => $currentPieceId,
                    'current_piece_mp3' => $piece->file_name,
                    'correct_answers' => $this->getCorrectAnswers($currentPieceId),
                    'shuffled_pieces' => $shuffledPieces,
                ];
            }
        }

        return null;
    }

    public function ensureSingleSoloGame(int $userId): void
    {
        // Fetch all solo games for the user
        $existingGames = SoloGame::where('user_id', $userId)->get();
        // If more than one game exists, delete them all
        if ($existingGames->count() > 0) {
            SoloGame::where('user_id', $userId)->delete();
        }
    }

    public function getEasyPiecesData(array $pieces_id): array
    {
        $pieces = Piece::whereIn('id', $pieces_id)->get();
        $piecesData = [];
        foreach ($pieces as $piece) {
            $piecesData[] = [
                'period' => $piece->period,
                'genre' => $piece->genre,
                'composer' => $piece->composer,
                'title' => $piece->title,
                'element' => $piece->element,
                'no_mvt' => $piece->no_mvt,
                'mvt' => $piece->mvt,
                'form' => $piece->form,
            ];
        }

        return $piecesData;
    }

    public function getMediumPiecesData(int $levelId): array
    {
        $pieces = Piece::where('level_id', $levelId)->get();
        $piecesData = [];
        foreach ($pieces as $piece) {
            $piecesData[] = [
                'period' => $piece->period,
                'genre' => $piece->genre,
                'composer' => $piece->composer,
                'title' => $piece->title,
                'element' => $piece->element,
                'no_mvt' => $piece->no_mvt,
                'mvt' => $piece->mvt,
                'form' => $piece->form,
            ];
        }

        return $piecesData;
    }

    public function getCorrectAnswers(int $pieceId): array
    {
        $correctAnswers = [];
        $piece = Piece::find($pieceId);
        if ($piece) {
            $correctAnswers = [
                'period' => $piece->period,
                'genre' => $piece->genre,
                'composer' => $piece->composer,
                'title' => $piece->title,
                'element' => $piece->element,
                'no_mvt' => $piece->no_mvt,
                'mvt' => $piece->mvt,
                'form' => $piece->form,
            ];
        }

        return $correctAnswers;
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

    public function rng(int $range = 0): int
    {
        return $range > 0 ? random_int(0, $range - 1) : 0;
    }

    public function fisher_yates_shuffle(array $array): array
    {
        $size = sizeof($array) - 1;

        for ($i = $size; $i >= 0; $i--) {
            $j = $this->rng($size);
            $temp = $array[$i];
            $array[$i] = $array[$j];
            $array[$j] = $temp;
        }

        return $array;
    }

    public function comparator(mixed $first_argument, mixed $second_argument, bool $strict = false): bool
    {
        // Handle strict comparison (e.g., value and type)
        if ($strict) {
            return $first_argument === $second_argument;
        }

        // Loose comparison handling
        return $first_argument == $second_argument;
    }

    public function grade(Request $request): array
    {
        $parameters_to_display = [];

        $validated = $request->validate([
            'selectedAnswers' => 'required|array',
            'playPieceOnce' => 'required|boolean',
        ]);

        $selectedAnswers = $validated['selectedAnswers'];
        $playPieceOnce = $validated['playPieceOnce'];
        $userId = auth()->id();

        $soloGame = SoloGame::where('user_id', $userId)->first();
        if (!$soloGame) {
            return [
                'error' => 'No active solo game found for the user.',
                'correctAnswersCount' => 0,
                'totalAnswersCount' => count($selectedAnswers),
                'score' => 0,
            ];
        }

        $correctAnswers = $soloGame->correct_answers ?? [];
        $difficulty = $soloGame->difficulty;
        $currentPieceId = $soloGame->current_piece_id;

        $pointsPerCorrectAnswer = match ($difficulty) {
            1 => 2,
            2 => 3,
            3 => 5,
            default => 0,
        };

        $correctAnswersCount = 0;

        foreach ($selectedAnswers as $key => $value) {
            if (isset($correctAnswers[$key]) && $this->comparator($value, $correctAnswers[$key])) {
                $correctAnswersCount++;
            }
        }

        $totalPoints = $correctAnswersCount * $pointsPerCorrectAnswer;

        if ($playPieceOnce) {
            $piecesList = $soloGame->pieces_list_id ?? [];
            if ($currentPieceId && ($key = array_search($currentPieceId, $piecesList)) !== false) {
                unset($piecesList[$key]);
                $piecesList = array_values($piecesList);
            }

            $randomPiece = $this->generateRandomPiece($piecesList);
            if ($randomPiece) {
                $soloGame->current_piece_id = $randomPiece['current_piece_id'];
                $soloGame->correct_answers = $randomPiece['correct_answers'];
                $soloGame->pieces_list_id = $randomPiece['shuffled_pieces'];
                $soloGame->save();
            }
        }
        $parameters_to_display = $this->getParametersToDisplay($difficulty, $soloGame);

        $scoreModel = Score::firstOrNew(['user_id' => $userId]);
        $scoreModel->score = ($scoreModel->score ?? 0) + $totalPoints;
        $scoreModel->save();

        return [
            'correctAnswersCount' => $correctAnswersCount,
            'totalAnswersCount' => count(array_filter($correctAnswers, fn($value) => $value !== null)),
            'score' => $scoreModel->score,
            'current_piece_mp3' => $randomPiece['current_piece_mp3'] ?? '',
            'parameters_to_display' => $parameters_to_display,
        ];
    }
}
