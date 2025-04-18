<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Level;
use App\Models\SoloGame;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LevelController extends Controller
{
    public function index($courseId): Response
    {
        $levels = Level::where('course_id', $courseId)->get();
        $courseName = Course::where('id', $courseId)->first()->name;

        $user = auth()->user();
        $solo_game = SoloGame::where('user_id', $user->id)->first();

        if ($solo_game) {
            $solo_game->delete();
        }
        return Inertia::render('MainMenu', ['levels' => $levels, 'courseId' => $courseId, 'courseName' => $courseName]);
    }

    public function getAllLevels(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
        ]);
        $levels = Level::with('course')->where('institution_id', $request->institution_id)->get();

        return response()->json($levels);
    }

    public function toggleLevelAccess(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'level_id' => 'required|exists:levels,id',
            'name' => 'required|string',
            'selectedInstitutionName' => 'required|string',
        ]);

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->selectedInstitutionName != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de modifier l\'accès d\'un niveau d\'une autre institution.'], 403);
        } else {
            $level = Level::find($request->level_id);
            $newStatus = !$level->is_enabled;
            $level->is_enabled = $newStatus;
            $level->save();

            $message = $newStatus ? 'Le niveau ' . $request->name . ' a été activé avec succès.' : 'Le niveau ' . $request->name . ' a été désactivé avec succès.';

            Log::info('**********START TRANSACTION**********');
            Log::info('ACTION: Level access toggling');
            Log::info('INITIATOR ID: ' . $initiator->id);
            Log::info('INITIATOR First Name: ' . $initiator->first_name);
            Log::info('INITIATOR Last Name: ' . $initiator->last_name);
            Log::info('INITIATOR Username: ' . $initiator->username);
            Log::info('Level Toggled: ' . $request->name);
            Log::info('**********END TRANSACTION**********');

            return response()->json(['message' => $message]);
        }
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

    public function addLevel(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'name' => 'required|digits:3',
            'course_id' => 'required|exists:courses,id',
            'institution_name' => 'required|string',
        ], [
            'name.required' => 'Le nom du niveau est requis.',
            'name.digits' => 'Le nom du niveau doit être un nombre de 3 chiffres.',
            'course_id.required' => 'Le cours est requis.',
            'course_id.exists' => 'Le cours sélectionné n\'existe pas.',
        ]);

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->institution_name != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de créer un niveau pour une autre institution.'], 403);
        }

        Level::create([
            'name' => $request->name,
            'course_id' => $request->course_id,
            'institution_id' => $institution,
        ]);

        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Level creation');
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('Level Created: ' . $request->name . ' for course ' . $request->course_id . ' in institution ' . $institution_name);
        Log::info('**********END TRANSACTION**********');

        return response()->json(['message' => 'Le niveau \'' . $request->name . '\' a été ajouté avec succès.'], 200);
    }

    public function deleteLevel(Request $request): JsonResponse
    {
        $initiator = $request->user();

        $request->validate([
            'level_id' => 'required|integer',
            'name' => 'required|string',
            'institution_name' => 'required|string',
        ]);

        $institution = auth()->user()->institution_id;
        $institution_name = Institution::where('id', $institution)->first()->name;

        if ($request->institution_name != $institution_name) {
            return response()->json(['message' => 'Vous n\'avez pas l\'autorisation de supprimer un niveau d\'une autre institution.'], 403);
        }

        $level = Level::find($request->level_id);

        if (!$level) {
            return response()->json(['message' => 'Le niveau \'' . $request->name . '\' n\'a pas été trouvé.'], 404);
        } else {
            $level->delete();

            Log::info('**********START TRANSACTION**********');
            Log::info('ACTION: Level deletion');
            Log::info('INITIATOR ID: ' . $initiator->id);
            Log::info('INITIATOR First Name: ' . $initiator->first_name);
            Log::info('INITIATOR Last Name: ' . $initiator->last_name);
            Log::info('INITIATOR Username: ' . $initiator->username);
            Log::info('Level Deleted: ' . $request->name . ' in institution ' . $institution_name);
            Log::info('**********END TRANSACTION**********');

            return response()->json(['message' => 'Le niveau \'' . $request->name . '\' a été supprimé avec succès.'], 200);
        }
    }

    public function getLevelsFromCourse(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|integer',
        ]);

        $levels = Level::where('course_id', $request->course_id)->get();

        return response()->json($levels);
    }
}
