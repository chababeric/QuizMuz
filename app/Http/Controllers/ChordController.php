<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use Illuminate\Http\JsonResponse;

class ChordController extends Controller
{
    public function getChordsByLevel(int $level_id): JsonResponse
    {
        $chords = Chord::with('level')->where('level_id', $level_id)->get();
        return response()->json($chords);
    }

}
