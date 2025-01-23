<?php

namespace App\Http\Controllers;

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

        try {
            // Store the game data in the database
            $soloGame = SoloGame::create($data);

            // Ensure pieces_list_id is a valid array before processing
            $shuffledPieces = $this->fisher_yates_shuffle($data['pieces_list_id'] ?? []);
            if (!empty($shuffledPieces)) {
                $selectedPieceIndex = $this->rng(count($shuffledPieces));
                $selectedPiece = $shuffledPieces[$selectedPieceIndex];
                $soloGame->current_piece_id = $selectedPiece;
                $soloGame->save();
            }

        } catch (\Exception $exception) {
            // Log the error and handle the failure gracefully
            Log::error('Failed to create SoloGame or shuffle pieces: ' . $exception->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to start the solo game.']);
        }

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

//    public function rng(int $range = 0): int
//    {
//        $seed_1 = time();
//        // Verify that it's a prime number. if so, execute a 3 bit shift to the right
//        $sqrt_time = intval(sqrt($seed_1));
//        for ($i = 3; $i <= $sqrt_time; $i += 2) {
//            if ($seed_1 % $i == 0) {
//                $seed_1 >>= 3;
//                break;
//            }
//        }
//        $seed_2 = hrtime()[1] / 100;
//        $seed_2 *= (2**31-1);  // 7eme nombre Mersenne premier
//        $seed_2 += $seed_1;
//        return $seed_2 % ($range != 0 ? $range : $seed_1);
//    }

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
