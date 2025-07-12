<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    protected LogsController $logsController;

    public function __construct(LogsController $logsController)
    {
        $this->logsController = $logsController;
    }

    public function index(): JsonResponse
    {
        $institutions = Institution::all();
        return response()->json($institutions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        $institution = new Institution();
        $initiator = auth()->user();
        $institution->name = $request->name;
        $institution->save();

        // Log the creation of the institution
        $this->logsController->createLog(
            'Institution',
            "L'institution <strong>{$request->name}</strong> a été <span class=\"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-1 rounded\">créée</span>.",
            $initiator->id,
        );

        return response()->json(['message' => 'L\'institution \'' . $request->name . '\' a été ajoutée avec succès.'], 200);
    }

    public function removeInstitution(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
            'name' => 'required|string',
        ]);

        $initiator = auth()->user();
        $institutions = Institution::findOrFail($request->institution_id);
        $institutions->delete();

        $this->logsController->createLog(
            'Institution',
            "L'institution <strong>{$request->name}</strong> a été <span class=\"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-1 rounded\">supprimée</span>.",
            $initiator->id,
        );

        return response()->json(['message' => 'L\'institution \'' . $request->name . '\' a été supprimée avec succès.'], 200);
    }
}
