<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Level;
use App\Models\Module;
use App\Models\Piece;
use App\Models\PieceReserve;
use App\Services\AccessControlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PieceController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    /**
     * Get all pieces from a specific level
     *
     * @param int $level_id
     * @return JsonResponse
     */
    public function getPiecesByLevel(int $level_id): JsonResponse
    {
//        $pieces = Piece::with('level')->where('level_id', $level_id)->get();
//        return response()->json($pieces);
        // Get the level to check if it belongs to LitMus course
        $level = Level::with('course')->find($level_id);

        if ($level && $level->course->name === 'LitMus') {
            // For LitMus course, get pieces grouped by modules
            $modules = Module::with(['pieces' => function ($query) {
                $query->orderBy('order');
            }])->where('level_id', $level_id)->orderBy('order')->get();

            // Format the response to include modules and their pieces
            $result = [];
            foreach ($modules as $module) {
                $result[] = [
                    'module' => $module->only(['id', 'title', 'description']),
                    'pieces' => $module->pieces->toArray()
                ];
            }

            return response()->json($result);
        } else {
            // For other courses, return pieces directly without module grouping
            $pieces = \App\Models\Piece::with('level')->where('level_id', $level_id)->get();
            return response()->json($pieces);
        }
    }

    /**
     * Get the pieces by their ids
     */
    public function getPiecesById(Request $request): JsonResponse
    {
        $ids = $request->query('id');
        $pieces = Piece::with('level')->whereIn('id', $ids)->get();
        return response()->json($pieces);
    }

    /**
     * Get all the pieces
     */
    public function getAllPieces(): JsonResponse
    {
//        $pieces = Piece::all();
        $initiator = auth()->user();

        $pieces = Piece::with(['level.course'])
        ->where('institution_id', $initiator->institution_id)
            ->get();

        return response()->json($pieces);
    }

    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $access_name = $request->input('courseName') === 'Histoire de la Musique' ? 'history_admin' : 'litmus_admin';
        Log::info("The course name is: " . $request->input('courseName') . " and access name is: " . $access_name);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une pièce.']);
        }
        if (!$accessControlService->hasCourseAccess($initiator, $access_name) && !$initiator->hasPrivilege('SuperAdmin')) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier une pièce.']);
        }

        $validatedData = $request->validate(
            [
                'id' => 'required|integer',
                'course' => 'required|integer',
                'level' => 'required|integer',
                'period' => 'nullable|string',
                'genre' => 'nullable|string',
                'composer' => 'required|string',
                'title' => 'required|string',
                'element' => 'nullable|string',
                'no_mvt' => 'nullable|string',
                'mvt' => 'nullable|string',
                'form' => 'nullable|string',
                'file_name' => ['required', 'string', 'regex:/.*\.mp3$/'],
                'audioFile' => 'nullable',
                'module_id' => 'nullable|integer|exists:modules,id',
            ],
            [
                'course.required' => 'Le cours est requis.',
                'level.required' => 'Le niveau est requis.',
                'composer.required' => 'Le compositeur est requis.',
                'title.required' => 'Le titre est requis.',
                'file_name.required' => 'Le nom du fichier audio est requis.',
                'file_name.regex' => 'Le nom du fichier doit se terminer par .mp3.',
                'module_id.exists' => 'Le module sélectionné n\'existe pas.'
            ]
        );

        // Find the piece by id
        $piece = Piece::findOrFail($validatedData['id']);

        $originalTitle = $piece->title;
        $originalComposer = $piece->composer;

        // Update the piece with the validated data
        $piece->update([
//            'course' => $validatedData['course'],
            'level_id' => $validatedData['level'],
            'period' => $validatedData['period'],
            'genre' => $validatedData['genre'],
            'composer' => $validatedData['composer'],
            'title' => $validatedData['title'],
            'element' => $validatedData['element'],
            'no_mvt' => $validatedData['no_mvt'],
            'mvt' => $validatedData['mvt'],
            'form' => $validatedData['form'],
            'file_name' => $validatedData['file_name'],
            'module_id' => $validatedData['module_id'] ?? null,
        ]);

        // If a new audio file is uploaded, replace the old one
//        if ($request->hasFile('audioFile')) {
//            $audioFile = $request->file('audioFile');
//            $fileName = $validatedData['fileName'];
//
//            // Delete the old file if it exists
//            $existingFilePath = 'public/litmus_pieces/' . $fileName;
//            if (Storage::exists($existingFilePath)) {
//                Storage::delete($existingFilePath);
//            }
//
//            // Save the new file
//            $audioFile->storeAs('public/litmus_pieces', $fileName);
//        }
        $level = Level::with('course')->find($validatedData['level']);
        $courseName = $level->course->name;

        $courseType = '';
        $logAction = '';

        if ($courseName === 'Histoire de la Musique') {
            $courseType = 'Histoire';
            $logAction = 'Histoire';
        } else {
            $courseType = 'Littérature Musicale';
            $logAction = 'LitMus';
        }

        $titleChanged = $originalTitle !== $piece->title;
        $composerChanged = $originalComposer !== $piece->composer;

        $logMessage = "La pièce ";

        if ($titleChanged) {
            $logMessage .= "<span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalTitle}</span> → <strong>{$piece->title}</strong>";
        } else {
            $logMessage .= "<strong>{$piece->title}</strong>";
        }

        $logMessage .= " de ";

        if ($composerChanged) {
            $logMessage .= "<span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalComposer}</span> → <strong>{$piece->composer}</strong>";
        } else {
            $logMessage .= "<strong>{$piece->composer}</strong>";
        }

        $logMessage .= " (Cours: <strong>{$courseType}</strong>, Niveau: <strong>{$level->name}</strong>) " .
            "a été <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mise à jour</span>.";

        $this->logsController->createLog(
            $logAction,
            $logMessage,
            $initiator->id
        );

        if ($level && $level->course->name === 'Histoire de la Musique') {
            return redirect()
                ->route('history.edit')
                ->with('success', 'Pièce mise à jour avec succès.');
        } else {
            return redirect()
                ->route('piece.edit')
                ->with('success', 'Pièce mise à jour avec succès.');
        }
    }

    public function destroy(Request $request ,$id): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $access_name = $request->input('courseName') === 'Histoire de la Musique' ? 'history_admin' : 'litmus_admin';

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une pièce.'], 403);
        }
        if (!$accessControlService->hasCourseAccess($initiator, $access_name) && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer une pièce.'], 403);
        }

//        $piece = PieceReserve::findOrFail($id);
        $piece = Piece::findOrFail($id);

        if ($piece->file_name) {
            $filePath = 'public/litmus_pieces/' . $piece->file_name;
            if (Storage::exists($filePath)) {
                Storage::delete($filePath);
            }
        }

        $piece->delete();

        $this->logsController->createLog(
            'LitMus',
            "La pièce '{$piece->title}' de '{$piece->composer}' a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimée</span>.",
            $initiator->id
        );

        return response()->json(['message' => 'La pièce a été supprimée avec succès.']);
    }

//    public function moveToReserve($id): JsonResponse
//    {
//        // Find the piece
//        $piece = Piece::findOrFail($id);
//        $initiator = auth()->user();
//
//        // Create a new piece reserve entry
//        $piecesReserve = new PieceReserve([
//            'level_id' => $piece->level_id,
//            'period' => $piece->period,
//            'genre' => $piece->genre,
//            'composer' => $piece->composer,
//            'title' => $piece->title,
//            'element' => $piece->element,
//            'no_mvt' => $piece->no_mvt,
//            'mvt' => $piece->mvt,
//            'form' => $piece->form,
//            'file_name' => $piece->file_name,
//            'order' => $piece->order,
//            'institution_id' => $piece->institution_id,
//        ]);
//
//        $piecesReserve->save();
//
//        // Delete the piece from the original table
//        $piece->delete();
//
//        Log::info('**********START TRANSACTION**********');
//        Log::info('ACTION: Piece moved to reserve');
//        Log::info('PIECE ID: ' . $piece->id);
//        Log::info('PIECE Title: ' . $piece->title);
//        Log::info('PIECE Composer: ' . $piece->composer);
//        Log::info('PIECE Level: ' . $piece->level_id);
//        Log::info('INITIATOR ID: ' . $initiator->id);
//        Log::info('INITIATOR First Name: ' . $initiator->first_name);
//        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
//        Log::info('INITIATOR Username: ' . $initiator->username);
//        Log::info('**********END TRANSACTION**********');
//
//        return response()->json(['message' => $piece->title . ' de ' . $piece->composer . ' a été déplacé en réserve.']);
//    }

//    public function moveToPieces($id): JsonResponse
//    {
//        // Find the piece
//        $pieceReserve = PieceReserve::findOrFail($id);
//        $initiator = auth()->user();
//
//        // Create a new piece entry
//        $piece = new Piece([
//            'level_id' => $pieceReserve->level_id,
//            'period' => $pieceReserve->period,
//            'genre' => $pieceReserve->genre,
//            'composer' => $pieceReserve->composer,
//            'title' => $pieceReserve->title,
//            'element' => $pieceReserve->element,
//            'no_mvt' => $pieceReserve->no_mvt,
//            'mvt' => $pieceReserve->mvt,
//            'form' => $pieceReserve->form,
//            'file_name' => $pieceReserve->file_name,
//            'order' => $pieceReserve->order,
//            'institution_id' => $pieceReserve->institution_id,
//        ]);
//
//        $piece->save();
//
//        // Delete the piece from the original table
//        $pieceReserve->delete();
//
//        Log::info('**********START TRANSACTION**********');
//        Log::info('ACTION: Piece moved to pieces');
//        Log::info('PIECE ID: ' . $pieceReserve->id);
//        Log::info('PIECE Title: ' . $pieceReserve->title);
//        Log::info('PIECE Composer: ' . $pieceReserve->composer);
//        Log::info('PIECE Level: ' . $pieceReserve->level_id);
//        Log::info('INITIATOR ID: ' . $initiator->id);
//        Log::info('INITIATOR First Name: ' . $initiator->first_name);
//        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
//        Log::info('INITIATOR Username: ' . $initiator->username);
//        Log::info('**********END TRANSACTION**********');
//
//        return response()->json(['message' => $pieceReserve->title . ' de ' . $pieceReserve->composer . ' est de retour dans la liste des pièces.']);
//    }

    public function store(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $validatedData = $request->validate(
            [
                'courseName' => 'required|string',
                'level' => 'required|string',
                'period' => 'nullable|string',
                'genre' => 'nullable|string',
                'composer' => 'required|string',
                'title' => 'required|string',
                'element' => 'nullable|string',
                'no_mvt' => 'nullable|string',
                'mvt' => 'nullable|string',
                'form' => 'nullable|string',
                'fileName' => ['required', 'string', 'regex:/.*\.mp3$/'],
                'audioFile' => 'nullable',
                'module_id' => 'nullable|integer|exists:modules,id',
            ],
            [
                'courseName.required' => 'Le cours est requis.',
                'level.required' => 'Le niveau est requis.',
                'composer.required' => 'Le compositeur est requis.',
                'title.required' => 'Le titre est requis.',
                'fileName.required' => 'Le nom du fichier audio est requis.',
                'fileName.regex' => 'Le nom du fichier doit se terminer par .mp3.',
                'module_id.exists' => 'Le module sélectionné n\'existe pas.'
            ]
        );

        $access_name = $validatedData['courseName'] === 'Histoire de la Musique' ? 'history_admin' : 'litmus_admin';
        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une pièce.']);
        }
        if (!$accessControlService->hasCourseAccess($initiator, $access_name) && !$initiator->hasPrivilege('SuperAdmin')) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour ajouter une pièce.']);
        }

        // Check if audioFile is present and not null
        if ($request->hasFile('audioFile')) {
            $request->validate([
                'audioFile' => 'file|mimes:mp3', // validate file type and size
            ]);

            $audioFile = $request->file('audioFile');
            $fileName = $request->input('fileName');
            $filePath = $audioFile->storeAs('public/litmus_pieces', $fileName);
            /*$publicPath =*/ Storage::url($filePath);
//            return response()->json(['message' => 'MP3 added successfully', 'file_path' => $publicPath]);
        }

        $newOrder = 1;
        if ($validatedData['module_id']) {
            // Get the module to determine its order
            $module = Module::findOrFail($validatedData['module_id']);

            // Find the highest order within this specific module
            $highestOrderInModule = Piece::where('level_id', $validatedData['level'])
                ->where('module_id', $validatedData['module_id'])
                ->max('order');

            if ($highestOrderInModule !== null) {
                $newOrder = $highestOrderInModule + 1;

                Piece::where('level_id', $validatedData['level'])
                    ->where('order', '>=', $newOrder)
                    ->where(function($query) use ($validatedData) {
                        // Exclude pieces from the current module since we want to add at the end of this module
                        $query->where('module_id', '!=', $validatedData['module_id'])
                            ->orWhereNull('module_id');
                    })
                    ->increment('order');
            } else {
                // If this is the first piece in the module, find where to insert it
                // Get all modules with higher order than the current module
                $higherOrderModules = Module::where('level_id', $validatedData['level'])
                    ->where('order', '>', $module->order)
                    ->pluck('id');

                // Find the minimum order of pieces in higher-order modules
                $minOrderInHigherModules = Piece::where('level_id', $validatedData['level'])
                    ->whereIn('module_id', $higherOrderModules)
                    ->min('order');

                if ($minOrderInHigherModules !== null) {
                    $newOrder = $minOrderInHigherModules;

                    // Increment the order of all pieces in higher-order modules
                    Piece::where('level_id', $validatedData['level'])
                        ->whereIn('module_id', $higherOrderModules)
                        ->increment('order');

                    // Also increment pieces without modules that have order >= newOrder
                    Piece::where('level_id', $validatedData['level'])
                        ->whereNull('module_id')
                        ->where('order', '>=', $newOrder)
                        ->increment('order');
                } else {
                    // No pieces in higher modules, check pieces without modules
                    $minOrderWithoutModule = Piece::where('level_id', $validatedData['level'])
                        ->whereNull('module_id')
                        ->min('order');

                    if ($minOrderWithoutModule !== null) {
                        $newOrder = $minOrderWithoutModule;

                        // Increment the order of all pieces without modules
                        Piece::where('level_id', $validatedData['level'])
                            ->whereNull('module_id')
                            ->increment('order');
                    } else {
                        // No pieces at all, start with 1
                        $newOrder = 1;
                    }
                }
            }
        } else {
            // Piece without module - should go after all module pieces
            $highestOrder = Piece::where('level_id', $validatedData['level'])->max('order');
            $newOrder = $highestOrder !== null ? $highestOrder + 1 : 1;
        }

        // Create a new piece record in the pieces table
        $piece = new Piece([
            'level_id' => $validatedData['level'],
            'period' => $validatedData['period'],
            'genre' => $validatedData['genre'],
            'composer' => $validatedData['composer'],
            'title' => $validatedData['title'],
            'element' => $validatedData['element'],
            'no_mvt' => $validatedData['no_mvt'],
            'mvt' => $validatedData['mvt'],
            'form' => $validatedData['form'],
            'file_name' => $validatedData['fileName'],
            'order' => $newOrder,
            'institution_id' => $initiator->institution_id,
            'module_id' => $validatedData['module_id'] ?? null,
        ]);

        // Save the new piece to the database
        $piece->save();
        $level = Level::with('course')->find($validatedData['level']);
        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        // Determine course type for logging
        $courseType = '';
        $logAction = '';

        if ($level->course->name === 'Histoire de la Musique') {
            $courseType = 'Histoire';
            $logAction = 'Histoire';
        } else {
            $courseType = 'Littérature Musicale';
            $logAction = 'LitMus';
        }

        // Create log entry with more details
        $this->logsController->createLog(
            $logAction,
            "La pièce <strong>{$piece->title}</strong> de <strong>{$piece->composer}</strong> " .
            "(Cours: <strong>{$courseType}</strong>, Niveau: <strong>{$level->name}</strong>, Institution: <strong>{$institutionName}</strong>) " .
            "a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">créée</span>.",
            $initiator->id
        );

        // Return different responses based on course type
        if ($level->course->name === 'Histoire de la Musique') {
            return redirect()
                ->route('history.edit')
                ->with('success', 'Pièce ajoutée avec succès.');
        } else {
            return redirect()
                ->route('piece.edit')
                ->with('success', 'Pièce ajoutée avec succès.');
        }
    }

    public function getPiecesInReserve(): JsonResponse
    {
        $pieces = PieceReserve::with('level')->get();
        return response()->json($pieces);
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);
        $courseName = $request->input('courseName');
        $access_name = $courseName === 'Histoire de la Musique' ? 'history_admin' : 'litmus_admin';

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des pièces.'], 403);
        }
        if (!$accessControlService->hasCourseAccess($initiator, $access_name) && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier l\'ordre des pièces.'], 403);
        }

        $pieces = $request->input('pieces');

        foreach ($pieces as $pieceData) {
            $piece = Piece::findOrFail($pieceData['id']);
            $piece->order = $pieceData['order'];
            $piece->save();
        }

        return response()->json(['message' => 'L\'ordre des pièces a été mis à jour avec succès.']);
    }

//    public function getPiecesInfo(): JsonResponse
//    {
//        $pieces = Piece::with('level')->get();
//        return response()->json($pieces);
//    }

    public function getPiecesByLevelNoModule(int $level_id): JsonResponse
    {
        $pieces = Piece::with('level')
            ->where('level_id', $level_id)
            ->whereNull('module_id')
            ->orderBy('order')
            ->get();

        return response()->json($pieces);
    }
}
