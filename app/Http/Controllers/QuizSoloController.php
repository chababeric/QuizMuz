<?php

namespace App\Http\Controllers;

use App\Models\Piece;
use App\Models\Score;
use App\Models\SoloGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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
        $soloGame = null;
        $piecesData = [];
        $current_piece_mp3 = '';
        $parameters_to_display = [];
        $data = $request->validate([
            'pieces_list_id' => 'required|array|min:1',
            'pieces_list_id.*' => 'integer',
            'difficulty' => 'required|integer',
            'level_id' => 'required|integer',
            'courseId' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id();
        $score = Score::where('user_id', $data['user_id'])->first()->score ?? 0;

        $this->ensureSingleSoloGame($data['user_id']);

        try {
            // Store the game data in the database
            $soloGame = SoloGame::create($data);

//             Ensure pieces_list_id is a valid array before processing
            $shuffledPieces = $this->fisher_yates_shuffle($data['pieces_list_id'] ?? []);
            if (!empty($shuffledPieces)) {
                $selectedPieceIndex = $this->rng(count($shuffledPieces));
                $current_piece_id = $shuffledPieces[$selectedPieceIndex];
                $current_piece_mp3 = Piece::find($current_piece_id)->file_name;
                $soloGame->current_piece_id = $current_piece_id;
                $soloGame->correct_answers = $this->getCorrectAnswers($current_piece_id);
//                $soloGame->pieces_list_id = $shuffledPieces;
                $soloGame->save();
            }
        } catch (\Exception $exception) {
            Log::error('Failed to create SoloGame or shuffle pieces: ' . $exception->getMessage());
        }

        if ($data['difficulty'] === '1') {
            // The pieces data for the easy difficulty
            $piecesData = $this->getEasyPiecesData($data['pieces_list_id']);
            // The parameters to display are the parameters of the current piece that aren't null
            $parameters_to_display = array_keys(array_filter($soloGame->correct_answers, function ($value) {
                return $value !== null;
            }));
        } else if ($data['difficulty'] === '2') {
            // The pieces data for the medium difficulty
            $piecesData = $this->getMediumPiecesData($data['level_id']);
            // The parameters to display are all the parameters of the current piece
            $parameters_to_display = ['period', 'genre', 'composer', 'title', 'element', 'no_mvt', 'mvt', 'form'];
        }

        // Process or modify data as needed
        $processedData = [
            'difficulty' => $data['difficulty'],
            'level' => $data['level_id'],
            'courseId' => $data['courseId'],
            'selectListData' => $piecesData,
            'current_piece_mp3' => $current_piece_mp3,
            'score' => $score,
            'parameters_to_display' => $parameters_to_display,
        ];

        // Pass the processed data to the component
        return Inertia::render('QuizSolo', $processedData);
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

    // Returns the data for the SelectLists for easy difficulty
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
}
