<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\Level;
use App\Models\Module;
use App\Services\AccessControlService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
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
        // Get the level to check if it belongs to FMA course
        $level = Level::with('course')->find($level_id);

        if ($level && $level->course->name === 'FMA') {
            // For FMA course, get chords grouped by modules
            $modules = Module::with(['chords' => function ($query) {
                $query->orderBy('order');
            }])->where('level_id', $level_id)->orderBy('order')->get();

            // Format the response to include modules and their chords
            $result = [];
            foreach ($modules as $module) {
                $result[] = [
                    'module' => $module->only(['id', 'title', 'description']),
                    'chords' => $module->chords->toArray()
                ];
            }

            return response()->json($result);
        } else {
            // For other courses, return chords directly without module grouping
            $chords = Chord::with('level')->where('level_id', $level_id)->get();
            return response()->json($chords);
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            $this->logsController->createLog(
                'FMA',
                "Tentative d'ajout de formule ou d'accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une formule ou un accord.']);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            $this->logsController->createLog(
                'FMA',
                "Tentative d'ajout de formule ou d'accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une formule ou un accord.']);
        }

        $request->validate([
            'level' => 'required|exists:levels,id',
            'module' => 'nullable|exists:modules,id',
            'chord_name' => 'required|string|max:255',
            'audioFile' => 'required|file|mimes:mp3',
        ],
        [
            'level.required' => 'Le niveau est requis.',
            'module.exists' => 'Le module sélectionné n\'existe pas.',
            'chord_name.required' => 'La formule ou l\'accord est requis.',
            'audioFile.required' => 'The audio file field is required.',
        ]);

        try {
            $audioFile = $request->file('audioFile');
            $level = Level::findOrFail($request->level);

            try {
                $lastChord = Chord::where('level_id', $request->level)
                    ->where('file_name', 'LIKE', 'FMA' . $level->name . '_%')
                    ->orderByRaw('CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(file_name, "_", -1), ".", 1) AS UNSIGNED) DESC')
                    ->first();

                $lastNumber = 0;
                if ($lastChord) {
                    $fileNameParts = explode('_', pathinfo($lastChord->file_name, PATHINFO_FILENAME));
                    $lastNumber = isset($fileNameParts[1]) ? (int)$fileNameParts[1] : 0;
                }

                $fileName = 'FMA' . $level->name . '_' . ($lastNumber + 1) . '.mp3';
            } catch (Exception $e) {
                $fileName = 'FMA' . $level->name . '_' . time() . '.mp3';

                $this->logsController->createLog(
                    'FMA',
                    "Avertissement lors de la génération du nom de fichier pour l'accord: " . $e->getMessage() . ". Nom de fichier de secours utilisé.",
                    $initiator->id
                );
            }

            try {
                $filePath = $audioFile->storeAs('public/fma_chords', $fileName);
                if (!$filePath) {
                    throw new Exception('Échec du stockage du fichier audio.');
                }
                Storage::url($filePath);
            } catch (Exception $e) {
                $this->logsController->createLog(
                    'FMA',
                    "Erreur lors du stockage du fichier audio pour l'accord '{$request->chord_name}': " . $e->getMessage(),
                    $initiator->id
                );

                return redirect()->back()->withErrors(['error' => 'Erreur lors du téléchargement du fichier audio. Veuillez réessayer.']);
            }

            try {
                $highestOrder = Chord::where('level_id', $request->level)
                    ->where('module_id', $request->module ?? null)
                    ->max('order') ?? 0;
                $newOrder = $highestOrder + 1;
            } catch (Exception $e) {
                $newOrder = time();

                $this->logsController->createLog(
                    'FMA',
                    "Avertissement lors du calcul de l'ordre pour l'accord: " . $e->getMessage() . ". Ordre de secours utilisé.",
                    $initiator->id
                );
            }

            // Create and save chord
            $chord = new Chord([
                'level_id' => $request->level,
                'module_id' => $request->module,
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

        } catch (ModelNotFoundException $e) {
            $this->logsController->createLog(
                'FMA',
                "Erreur lors de l'ajout de l'accord - Niveau non trouvé (ID: {$request->level}): " . $e->getMessage(),
                $initiator->id
            );

            return redirect()->back()->withErrors(['error' => 'Le niveau sélectionné n\'existe pas.']);

        } catch (QueryException $e) {
            $this->logsController->createLog(
                'FMA',
                "Erreur de base de données lors de l'ajout de l'accord '{$request->chord_name}': " . $e->getMessage(),
                $initiator->id
            );

            // Clean up uploaded file if it exists
            if (isset($filePath) && Storage::exists($filePath)) {
                Storage::delete($filePath);
            }

            return redirect()->back()->withErrors(['error' => 'Erreur lors de l\'enregistrement en base de données. Veuillez réessayer.']);

        } catch (Exception $e) {
            $this->logsController->createLog(
                'FMA',
                "Erreur inattendue lors de l'ajout de l'accord '{$request->chord_name}': " . $e->getMessage(),
                $initiator->id
            );

            // Clean up uploaded file if it exists
            if (isset($filePath) && Storage::exists($filePath)) {
                Storage::delete($filePath);
            }

            return redirect()->back()->withErrors(['error' => 'Une erreur inattendue est survenue. Veuillez réessayer.']);
        }
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $chords = $request->input('chords');

        if (!$initiator->isAdmin()) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de modification de l'ordre des formules ou accords par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des formules ou accords.'], 403);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de modification de l'ordre des formules ou accords par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des formules ou accords.'], 403);
        }

        $this->updateOrders(Chord::class, $chords);
        return response()->json(['message' => 'L\'ordre a été mis à jour avec succès.']);
    }

    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de modification d'une formule ou d'un accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une formule ou un accord.']);
        }
        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de modification d'une formule ou d'un accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une formule ou un accord.']);
        }

        $request->validate([
            'id' => 'required|exists:chords,id',
            'level' => 'required|exists:levels,id',
            'module' => 'nullable|exists:modules,id',
            'chord_name' => 'required|string|max:255',
        ],
        [
            'id.required' => 'L\'identifiant de l\'accord est requis.',
            'level.required' => 'Le niveau est requis.',
            'module.exists' => 'Le module sélectionné n\'existe pas.',
            'chord_name.required' => 'La formule ou l\'accord est requis.',
        ]);

        try {
            $chord = Chord::findOrFail($request->id);
            $originalChordName = $chord->chord_name;
            $originalLevel = Level::findOrFail($chord->level_id);
            $originalModule = $chord->module;

            $level = Level::findOrFail($request->level);
            $newModule = $request->module ? Module::find($request->module) : null;

            $chord->update([
                'level_id' => $request->level,
                'module_id' => $request->module,
                'chord_name' => $request->chord_name,
            ]);

            $this->logsController->createLog(
                'FMA',
                "Formule / Accord <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalChordName}</span> → <strong>{$chord->chord_name}</strong> (Niveau: <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalLevel->name}</span> → <strong>{$level->name}</strong>) <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
                $initiator->id
            );

            return redirect()->route('chord.edit')->with('success', 'Formule / Accord mis à jour avec succès.');

        } catch (Exception $e) {
            $this->logsController->createLog(
                'FMA',
                "Erreur lors de la modification de la formule/accord (ID: {$request->id}): " . $e->getMessage(),
                $initiator->id
            );

            return redirect()->back()->withErrors(['error' => 'Une erreur est survenue lors de la modification de la formule/accord.']);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de suppression d'une formule ou d'un accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une formule ou un accord.'], 403);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            $this->logsController->createLog(
                'FMA',
                "Tentative de suppression d'une formule ou d'un accord par un utilisateur sans privilèges administratifs.",
                $initiator->id
            );
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une formule ou un accord.'], 403);
        }

        try {
            $chord = Chord::findOrFail($id);
            $chordName = $chord->chord_name;
            $levelName = $chord->level->name;

            if ($chord->file_name) {
                $filePath = 'public/fma_chords/' . $chord->file_name;
                if (Storage::exists($filePath)) {
                    Storage::delete($filePath);
                }
            }

            $chord->delete();

            $this->logsController->createLog(
                'FMA',
                "Formule / Accord <strong>{$chordName}</strong> (Niveau <strong>{$levelName}</strong>) <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span>.",
                $initiator->id
            );

            return response()->json(['message' => 'Formule / Accord supprimé avec succès.']);
        } catch (Exception $e) {
            $this->logsController->createLog(
                'FMA',
                "Erreur lors de la suppression de la formule/accord (ID: {$id}): " . $e->getMessage(),
                $initiator->id
            );

            return response()->json(['error' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }
}
