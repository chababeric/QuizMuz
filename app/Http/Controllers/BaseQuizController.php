<?php

namespace App\Http\Controllers;

use App\Models\FmaGame;
use App\Models\Score;
use App\Models\SoloGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class BaseQuizController extends Controller
{
    /**
     * Update the user's last action time.
     */
    abstract public function updateLastActionTime(): JsonResponse;

    /**
     * Generate a random number within a range.
     */
    protected function rng(int $range = 0): int
    {
        return $range > 0 ? random_int(0, $range - 1) : 0;
    }

    /**
     * Fisher-Yates shuffle algorithm implementation.
     */
    protected function fisher_yates_shuffle(array $array): array
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

    /**
     * Compare two strings for similarity.
     */
    protected function comparator(mixed $first_argument, mixed $second_argument, bool $exactMatch = false): bool
    {
        if (!is_string($first_argument) || !is_string($second_argument)) {
            return false;
        }

        $normalize = function ($text) {
            $text = transliterator_transliterate('Any-Latin; Latin-ASCII', $text);
            return strtolower($text);
        };

        $first_argument = $normalize($first_argument);
        $second_argument = $normalize($second_argument);

        if ($exactMatch) {
            return $first_argument === $second_argument;
        }

        similar_text($first_argument, $second_argument, $percent);
        return $percent >= 70; // Return true if the similarity is 70% or more
    }


    /**
     * Update the user's score.
     */
    protected function updateScore(int $userId, int $points, int $courseId): int
    {
        $score = Score::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if ($score) {
            $score->score += $points;
            $score->save();
        } else {
            $score = Score::create([
                'user_id' => $userId,
                'course_id' => $courseId,
                'score' => $points,
            ]);
        }

        return $score->score;
    }

    protected function ensureSingleGame($userId, $gameType): void
    {
        if ($gameType === 'solo') {
            SoloGame::where('user_id', $userId)->delete();
        } elseif ($gameType === 'fma') {
            FmaGame::where('user_id', $userId)->delete();
        }
    }

    /**
     * Abstract method for game-specific grading logic.
     */
    abstract public function grade(Request $request): array;

    /**
     * Abstract method for getting the next item to quiz on.
     */
    abstract public function getNext(Request $request): array;
}
