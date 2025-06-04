<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ModuleController extends Controller
{
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $initiator = auth()->user();

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

        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Module created');
        Log::info('MODULE ID: ' . $module->id);
        Log::info('MODULE Title: ' . $module->title);
        Log::info('MODULE Level: ' . $module->level_id);
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('**********END TRANSACTION**********');

        // Return different responses based on request type
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Module créé avec succès.',
                'module' => $module
            ]);
        }

        return redirect()
            ->route('piece.edit')
            ->with('success', 'Module créé avec succès.');
    }

    public function update(Request $request): RedirectResponse|JsonResponse
    {
        $initiator = auth()->user();

        $validatedData = $request->validate(
            [
                'id' => 'required|integer|exists:modules,id',
                'level_id' => 'required|integer|exists:levels,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'order' => 'nullable|integer',
            ],
            [
                'id.required' => 'L\'identifiant du module est requis.',
                'level_id.required' => 'Le niveau est requis.',
                'level_id.exists' => 'Le niveau sélectionné n\'existe pas.',
                'title.required' => 'Le titre du module est requis.',
            ]
        );

        // Find the module
        $module = Module::findOrFail($validatedData['id']);

        // Update the module
        $module->update([
            'level_id' => $validatedData['level_id'],
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'order' => $validatedData['order'],
        ]);

        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Module updated');
        Log::info('MODULE ID: ' . $module->id);
        Log::info('MODULE Title: ' . $module->title);
        Log::info('MODULE Level: ' . $module->level_id);
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('**********END TRANSACTION**********');

        // Return different responses based on request type
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Module mis à jour avec succès.',
                'module' => $module
            ]);
        }

        return redirect()
            ->route('piece.edit')
            ->with('success', 'Module mis à jour avec succès.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $initiator = auth()->user();

        $validatedData = $request->validate([
            'id' => 'required|integer|exists:modules,id',
        ]);

        $module = Module::findOrFail($validatedData['id']);

        // Log before deleting
        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Module deleted');
        Log::info('MODULE ID: ' . $module->id);
        Log::info('MODULE Title: ' . $module->title);
        Log::info('MODULE Level: ' . $module->level_id);
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('**********END TRANSACTION**********');

        // Delete the module
        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Module supprimé avec succès.'
        ]);
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $initiator = auth()->user();

        $validatedData = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|integer|exists:modules,id',
            'modules.*.order' => 'required|integer',
        ]);

        foreach ($validatedData['modules'] as $moduleData) {
            $module = Module::findOrFail($moduleData['id']);
            $module->update(['order' => $moduleData['order']]);
        }

        Log::info('**********START TRANSACTION**********');
        Log::info('ACTION: Module order updated');
        Log::info('INITIATOR ID: ' . $initiator->id);
        Log::info('INITIATOR First Name: ' . $initiator->first_name);
        Log::info('INITIATOR Last Name: ' . $initiator->last_name);
        Log::info('INITIATOR Username: ' . $initiator->username);
        Log::info('**********END TRANSACTION**********');

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
