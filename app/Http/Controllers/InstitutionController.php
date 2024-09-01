<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
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
        $institution->name = $request->name;
        $institution->save();

        return response()->json(['message' => 'L\'institution \'' . $request->name . '\' a été ajoutée avec succès.'], 200);
    }

    public function removeInstitution(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id',
            'name' => 'required|string',
        ]);

        $institutions = Institution::findOrFail($request->institution_id);
        $institutions->delete();

        return response()->json(['message' => 'L\'institution \'' . $request->name . '\' a été supprimée avec succès.'], 200);
    }
}
