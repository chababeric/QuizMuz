<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\Level;
use App\Services\AccessControlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChordController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function getAllChords(): JsonResponse
    {
        $initiator = auth()->user();

        $chords = Chord::with(['level.course'])
            ->where('institution_id', $initiator->institution_id)
            ->whereNotNull('level_id')
            ->get();
        return response()->json($chords);
    }

    public function getChordsByLevel(int $level_id): JsonResponse
    {
        $chords = Chord::with('level')->where('level_id', $level_id)->get();
        return response()->json($chords);
    }

    public function store(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une formule ou un accord.']);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une formule ou un accord.']);
        }

        $request->validate([
            'level' => 'required|exists:levels,id',
            'chord_name' => 'required|string|max:255',
            'audioFile' => 'required|file|mimes:mp3',
        ],
        [
            'level.required' => 'Le niveau est requis.',
            'chord_name.required' => 'La formule ou l\'accord est requis.',
            'audioFile.required' => 'The audio file field is required.',
        ]);

        $audioFile = $request->file('audioFile');
        $level = Level::find($request->level);

        $lastChord = Chord::where('level_id', $request->level)
            ->where('file_name', 'LIKE', 'FMA' . $level->name . '_%')
            ->orderByRaw('CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(file_name, "_", -1), ".", 1) AS UNSIGNED) DESC')
            ->first();

        $lastNumber = $lastChord ? (int)explode('_', pathinfo($lastChord->file_name, PATHINFO_FILENAME))[1] : 0;
        $fileName = 'FMA' . $level->name . '_' . ($lastNumber + 1) . '.mp3';
        $filePath = $audioFile->storeAs('public/fma_chords', $fileName);
        Storage::url($filePath);

        $highestOrder = Chord::where('level_id', $request->level)
            ->max('order') ?? 0;
        $newOrder = $highestOrder + 1;

        $chord = new Chord([
            'level_id' => $request->level,
            'chord_name' => $request->chord_name,
            'file_name' => $fileName,
            'order' => $newOrder,
            'institution_id' => $initiator->institution_id,
        ]);

        $chord->save();

        $this->logsController->createLog(
            'FMA',
            "Formule / Accord <strong>{$chord->chord_name}</strong> (Niveau <strong>{$level->name}</strong>) <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">ajouté</span>.",
            $initiator->id
        );

        return redirect()->route('chord.edit');
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $chords = $request->input('chords');

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des formules ou accords.'], 403);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des formules ou accords.'], 403);
        }

        foreach ($chords as $chordData) {
            $chord = Chord::findOrFail($chordData['id']);
            $chord->order = $chordData['order'];
            $chord->save();
        }
        return response()->json(['message' => 'L\'ordre a été mis à jour avec succès.']);
    }

    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une formule ou un accord.']);
        }
        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une formule ou un accord.']);
        }

        $request->validate([
            'id' => 'required|exists:chords,id',
            'level' => 'required|exists:levels,id',
            'chord_name' => 'required|string|max:255',
        ],
        [
            'id.required' => 'L\'identifiant de l\'accord est requis.',
            'level.required' => 'Le niveau est requis.',
            'chord_name.required' => 'La formule ou l\'accord est requis.',
        ]);

        $chord = Chord::findOrFail($request->id);
        $originalChordName = $chord->chord_name;
        $originalLevel = Level::findOrFail($chord->level_id);

        $level = Level::findOrFail($request->level);
        $chord->update([
            'level_id' => $request->level,
            'chord_name' => $request->chord_name,
        ]);

        $this->logsController->createLog(
            'FMA',
            "Formule / Accord <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalChordName}</span> → <strong>{$chord->chord_name}</strong> (Niveau: <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalLevel->name}</span> → <strong>{$level->name}</strong>) <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
            $initiator->id
        );

        return redirect()->route('chord.edit')->with('success', 'Formule / Accord mis à jour avec succès.');
    }

public function destroy(int $id): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une formule ou un accord.'], 403);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une formule ou un accord.'], 403);
        }

        $chord = Chord::findOrFail($id);
        $level = $chord->level;
        $chord->delete();

        $this->logsController->createLog(
            'FMA',
            "Formule / Accord <strong>{$chord->chord_name}</strong> (Niveau <strong>{$level->name}</strong>) <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span>.",
            $initiator->id
        );
        return response()->json(['message' => 'Formule / Accord supprimé avec succès.']);
    }
}
