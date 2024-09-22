<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Level;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class LevelController extends Controller
{
    public function index($courseId): Response
    {
        $levels = Level::where('course_id', $courseId)->get();
        $courseName = Course::where('id', $courseId)->first()->name;

        if ($courseId == 1) {
            return Inertia::render('MainMenu', ['levels' => $levels, 'courseId' => $courseId, 'courseName' => $courseName]);
        }
        elseif ($courseId == 2) {
            return Inertia::render('MenuHIST');
        }
        else if ($courseId == 3) {
            return Inertia::render('MainMenu', ['levels' => $levels, 'courseId' => $courseId, 'courseName' => $courseName]);
        }
        else {
            return Inertia::render('Welcome');
        }
    }

    public function getAllLevels(): JsonResponse
    {
        $levels = Level::with('course')->get();

        return response()->json($levels);
    }

    public function toggleLevelAccess(Request $request): JsonResponse
    {
        $request->validate([
            'level_id' => 'required|exists:levels,id',
            'name' => 'required|string',
        ]);

        $level = Level::find($request->level_id);
        $newStatus = !$level->is_enabled;
        $level->is_enabled = $newStatus;
        $level->save();

        $message = $newStatus ? 'Le niveau ' . $request->name . ' a été activé avec succès.' : 'Le niveau ' . $request->name . ' a été désactivé avec succès.';

        return response()->json(['message' => $message]);
    }

    public function updateLastLevel(Request $request): JsonResponse
    {
        $request->validate([
            'level' => 'required|exists:levels,id',
            'userId' => 'required|exists:users,id',
        ]);

        $user = User::find($request->userId);

        if ($user) {
            $user->last_level = $request->level;
            $user->save();
            return response()->json(['message' => 'Niveau mis à jour avec succès'], 200);
        }
        else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }
}
