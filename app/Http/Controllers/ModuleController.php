<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Level;
use App\Models\Module;
use App\Services\AccessControlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function store(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour un module.']);
        }

        $validatedData = $request->validate(
            [
                'level_id' => 'required|integer|exists:levels,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'order' => 'nullable|integer',
            ],
            [
                'level_id.required' => 'Le niveau est requis.',
                'level_id.exists' => 'Le niveau sélectionné n\'existe pas.',
                'title.required' => 'Le titre du module est requis.',
            ]
        );

        // Get the level with course information to determine course access and redirect
        $level = Level::with('course')->findOrFail($validatedData['level_id']);

        // Check course-specific access based on the level's course
        if ($level->course->name === 'Formation Musicale et Auditive' || $level->course->name === 'FMA') {
            if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour créer un module pour ce cours.']);
            }
        } elseif ($level->course->name === 'Littérature Musicale' || $level->course->name === 'LitMus') {
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour créer un module pour ce cours.']);
            }
        } else {
            // For other courses, default to litmus admin access
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour créer un module.']);
            }
        }

        // Set a default order if not provided
        if (!isset($validatedData['order'])) {
            // Get the highest order number for this level and add 1
            $maxOrder = Module::where('level_id', $validatedData['level_id'])->max('order') ?? 0;
            $validatedData['order'] = $maxOrder + 1;
        }

        // Add institution_id to the data
        $validatedData['institution_id'] = $initiator->institution_id;

        // Create the module
        $module = Module::create($validatedData);

        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        // Determine log action based on course
        $logAction = match($level->course->name) {
            'Formation Musicale et Auditive', 'FMA' => 'FMA',
            'Histoire de la Musique' => 'Histoire',
            default => 'LitMus'
        };

        $this->logsController->createLog(
            $logAction,
            "Le module <strong>{$module->title}</strong> (Niveau: <strong>{$level->name}</strong>, " .
            "Cours: <strong>{$level->course->name}</strong>, Institution: <strong>{$institutionName}</strong>) " .
            "a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">créé</span>.",
            $initiator->id,
        );

        // Redirect to the appropriate page based on the course
        $redirectRoute = match($level->course->name) {
            'Formation Musicale et Auditive', 'FMA' => 'chord.edit',
            'Histoire de la Musique' => 'history.edit',
            default => 'piece.edit'
        };

        return redirect()
            ->route($redirectRoute)
            ->with('success', 'Module créé avec succès.');
    }

    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour un module.']);
        }

        $validatedData = $request->validate(
            [
                'id' => 'required|integer|exists:modules,id',
                'level_id' => 'required|integer|exists:levels,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
            ],
            [
                'id.required' => 'L\'identifiant du module est requis.',
                'level_id.required' => 'Le niveau est requis.',
                'level_id.exists' => 'Le niveau sélectionné n\'existe pas.',
                'title.required' => 'Le titre du module est requis.',
            ]
        );

        $module = Module::findOrFail($validatedData['id']);
        $level = Level::with('course')->findOrFail($validatedData['level_id']);

        // Check course-specific access
        if ($level->course->name === 'Formation Musicale et Auditive' || $level->course->name === 'FMA') {
            if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier un module pour ce cours.']);
            }
        } elseif ($level->course->name === 'Littérature Musicale' || $level->course->name === 'LitMus') {
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier un module pour ce cours.']);
            }
        } else {
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour modifier un module.']);
            }
        }

        $originalTitle = $module->title;

        // Update the module
        $module->update([
            'level_id' => $validatedData['level_id'],
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
        ]);

        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        // Determine log action based on course
        $logAction = match($level->course->name) {
            'Formation Musicale et Auditive', 'FMA' => 'FMA',
            'Histoire de la Musique' => 'Histoire',
            default => 'LitMus'
        };

        $this->logsController->createLog(
            $logAction,
            "Le module <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalTitle}</span> → <strong>{$module->title}</strong> " .
            "(Niveau: <strong>{$level->name}</strong>, Cours: <strong>{$level->course->name}</strong>, Institution: <strong>{$institutionName}</strong>) " .
            "a été <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
            $initiator->id,
        );

        // Redirect to the appropriate page based on the course
        $redirectRoute = match($level->course->name) {
            'Formation Musicale et Auditive', 'FMA' => 'chord.edit',
            'Histoire de la Musique' => 'history.edit',
            default => 'piece.edit'
        };

        return redirect()
            ->route($redirectRoute)
            ->with('success', 'Module mis à jour avec succès.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module.'], 403);
        }

        $validatedData = $request->validate([
            'id' => 'required|integer|exists:modules,id',
        ]);

        $module = Module::with('level.course')->findOrFail($validatedData['id']);
        $level = $module->level;

        // Check course-specific access
        if ($level->course->name === 'Formation Musicale et Auditive' || $level->course->name === 'FMA') {
            if (!$accessControlService->hasCourseAccess($initiator, 'fma_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module pour ce cours.'], 403);
            }
        } elseif ($level->course->name === 'Littérature Musicale' || $level->course->name === 'LitMus') {
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module pour ce cours.'], 403);
            }
        } else {
            if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
                return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module.'], 403);
            }
        }

        $moduleTitle = $module->title;
        $levelName = $level->name;
        $courseName = $level->course->name;

        // Check if module has associated pieces or chords
        $hasPieces = $module->pieces()->exists();
        $hasChords = $module->chords()->exists();

        if ($hasPieces || $hasChords) {
            $itemType = $hasChords ? 'accords/formules' : 'pièces';
            return response()->json(['error' => "Impossible de supprimer le module car il contient des {$itemType}."], 400);
        }

        $module->delete();

        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        // Determine log action based on course
        $logAction = match($courseName) {
            'Formation Musicale et Auditive', 'FMA' => 'FMA',
            'Histoire de la Musique' => 'Histoire',
            default => 'LitMus'
        };

        $this->logsController->createLog(
            $logAction,
            "Le module <strong>{$moduleTitle}</strong> (Niveau: <strong>{$levelName}</strong>, " .
            "Cours: <strong>{$courseName}</strong>, Institution: <strong>{$institutionName}</strong>) " .
            "a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span>.",
            $initiator->id,
        );

        return response()->json(['message' => 'Module supprimé avec succès.']);
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour l\'ordre des modules.'], 403);
        }
        if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour l\'ordre des modules.'], 403);
        }

        $validatedData = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|integer|exists:modules,id',
            'modules.*.order' => 'required|integer',
        ]);

        $this->updateOrders(Module::class, $validatedData['modules']);

        $this->logsController->createLog(
            "LitMus",
            "L'ordre des modules a été <span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>.",
            $initiator->id,
        );

        return response()->json([
            'success' => true,
            'message' => 'Ordre des modules mis à jour avec succès.'
        ]);
    }

    public function getAllModules(): JsonResponse
    {
        $initiator = auth()->user();

        $modules = Module::with(['level.course'])
            ->where('institution_id', $initiator->institution_id)
            ->orderBy('order')
            ->get();

        return response()->json($modules);
    }

    public function getModulesByLevel(int $levelId): JsonResponse
    {
        $modules = Module::with(['pieces', 'chords'])
            ->where('level_id', $levelId)
            ->orderBy('order')
            ->get();

        return response()->json($modules);
    }
}
