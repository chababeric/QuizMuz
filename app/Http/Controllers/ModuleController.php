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

        if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
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

        $level = Level::with('course')->findOrFail($module->level_id);
        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        $this->logsController->createLog(
            "LitMus",
            "Le module <strong>{$module->title}</strong> (Niveau: <strong>{$level->name}</strong>, " .
            "Cours: <strong>{$level->course->name}</strong>, Institution: <strong>{$institutionName}</strong>) " .
            "a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">créé</span>.",
            $initiator->id,
        );

        return redirect()
            ->route('piece.edit')
            ->with('success', 'Module créé avec succès.');
    }

    public function update(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return redirect()->back()->withErrors(['error' => 'Vous n\'avez pas les privilèges nécessaires pour mettre à jour un module.']);
        }

        if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
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

        // Find the module and load its level relationship before updating
        $module = Module::with('level')->findOrFail($validatedData['id']);

        // Store original values before updating
        $originalTitle = $module->title;
        $originalDescription = $module->description ?? '';
        $originalLevelId = $module->level_id;
        $originalLevel = $module->level;

        // Update the module
        $module->update([
            'level_id' => $validatedData['level_id'],
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
        ]);

        // Reload the module with the new level relationship
        $module->load('level');

        // Create log message with before/after comparison
        $titleChanged = $originalTitle !== $module->title;
        $levelChanged = $originalLevelId !== $module->level_id;
        $descriptionChanged = $originalDescription !== ($module->description ?? '');

        $logMessage = "Module ";

        // Show title change if it occurred
        if ($titleChanged) {
            $logMessage .= "<span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalTitle}</span> → <strong>{$module->title}</strong> ";
        } else {
            $logMessage .= "<strong>{$module->title}</strong> ";
        }

        // Show level change if it occurred
        if ($levelChanged) {
            $logMessage .= "(Niveau: <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalLevel->name}</span> → <strong>{$module->level->name}</strong>) ";
        } else {
            $logMessage .= "(Niveau: <strong>{$module->level->name}</strong>) ";
        }

        // Show description change if it occurred and if descriptions aren't empty
        if ($descriptionChanged && ($originalDescription || $module->description)) {
            $originalDescShort = mb_substr($originalDescription, 0, 30) . (mb_strlen($originalDescription) > 30 ? '...' : '');
            $newDescShort = mb_substr($module->description ?? '', 0, 30) . (mb_strlen($module->description ?? '') > 30 ? '...' : '');

            if ($originalDescription && $module->description) {
                $logMessage .= "Description: <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalDescShort}</span> → <strong>{$newDescShort}</strong> ";
            } elseif ($originalDescription) {
                $logMessage .= "Description: <span class=\"line-through text-gray-500 dark:text-gray-400\">{$originalDescShort}</span> → <strong>(supprimée)</strong> ";
            } else {
                $logMessage .= "Description: <strong>{$newDescShort}</strong> (ajoutée) ";
            }
        }

        $logMessage .= "<span class=\"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold px-1 rounded\">mis à jour</span>";

        $this->logsController->createLog(
            "LitMus",
            $logMessage,
            $initiator->id,
        );

        return redirect()
            ->route('piece.edit')
            ->with('success', 'Module mis à jour avec succès.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $initiator = auth()->user();
        $accessControlService = app(AccessControlService::class);

        if (!$initiator->isAdmin()) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module.'], 403);
        }
        if (!$accessControlService->hasCourseAccess($initiator, 'litmus_admin') && !$initiator->hasPrivilege('SuperAdmin')) {
            return response()->json(['error' => 'Vous n\'avez pas les privilèges nécessaires pour supprimer un module.'], 403);
        }

        $validatedData = $request->validate([
            'id' => 'required|integer|exists:modules,id',
        ]);

        $module = Module::findOrFail($validatedData['id']);

        // Delete the module
        $module->delete();

        $institutionName = Institution::findOrFail($initiator->institution_id)->name;

        $this->logsController->createLog(
            "LitMus",
            "Le module <strong>{$module->title}</strong> (Niveau: <strong>{$module->level->name}</strong>) a été " .
            "<span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimé</span> de l'institution <strong>{$institutionName}</strong>.",
            $initiator->id,
        );

        return response()->json([
            'success' => true,
            'message' => 'Module supprimé avec succès.'
        ]);
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

        foreach ($validatedData['modules'] as $moduleData) {
            $module = Module::findOrFail($moduleData['id']);
            $module->update(['order' => $moduleData['order']]);
        }

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
        $modules = Module::with('pieces')
            ->where('level_id', $levelId)
            ->orderBy('order')
            ->get();

        return response()->json($modules);
    }
}
