<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\Module;
use App\Models\Piece;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeController extends Controller
{
    public function index(Request $request): Response
    {
        $level = $request->input('level');
        $courseId = $request->input('courseId');
        $courseName = $request->input('courseName');

        // Variables to hold the data
        $pieces = [];
        $modules = [];
        $nonModulePieces = [];
        $lastUpdated = null;

        if ($courseName === "Formation Musicale et Auditive") {
            // For FMA course, fetch chords
            $pieces = Chord::where('level_id', $level)
                ->orderBy('order')
                ->get();

            // Get last updated
            $lastUpdated = $pieces->sortByDesc('updated_at')->first()?->updated_at;

        } elseif ($courseName === "Littérature Musicale") {
            // For LitMus course, fetch pieces and organize by modules
            $allPieces = Piece::where('level_id', $level)
                ->orderBy('order')
                ->get();

            // Get last updated
            $lastUpdated = $allPieces->sortByDesc('updated_at')->first()?->updated_at;

            // Group pieces by module_id
            $groupedByModule = [];
            $nonModulePieces = $allPieces->filter(function ($piece) {
                return $piece->module_id === null;
            })->values()->toArray();

            // Group pieces with modules
            $piecesWithModules = $allPieces->filter(function ($piece) {
                return $piece->module_id !== null;
            });

            foreach ($piecesWithModules as $piece) {
                if (!isset($groupedByModule[$piece->module_id])) {
                    $groupedByModule[$piece->module_id] = [
                        'module' => [
                            'id' => $piece->module_id,
                            'title' => '',
                            'order' => 0,
                            'description' => ''
                        ],
                        'pieces' => []
                    ];
                }
                $groupedByModule[$piece->module_id]['pieces'][] = $piece->toArray();
            }

            // Fetch module data
            $moduleData = Module::where('level_id', $level)
                ->orderBy('order')
                ->get();

            // Update module information
            foreach ($moduleData as $module) {
                if (isset($groupedByModule[$module->id])) {
                    $groupedByModule[$module->id]['module'] = [
                        'id' => $module->id,
                        'title' => $module->title,
                        'order' => $module->order,
                        'description' => $module->description
                    ];
                }
            }

            // Convert to array and sort by module order
            $modules = collect(array_values($groupedByModule))
                ->sortBy('module.order')
                ->values()
                ->toArray();

            // Combine all pieces for general use
            $pieces = collect(array_merge(
                collect($modules)->flatMap(function ($module) {
                    return $module['pieces'];
                })->toArray(),
                $nonModulePieces
            ))->sortBy('order')->values()->toArray();

        } else {
            // For other courses, fetch pieces
            $pieces = Piece::where('level_id', $level)
                ->orderBy('order')
                ->get()
                ->toArray();

            // Get last updated
            $lastUpdated = Piece::where('level_id', $level)
                ->orderBy('updated_at', 'desc')
                ->first()
                ?->updated_at;
        }

        return Inertia::render('Practice', [
            'level' => $level,
            'courseId' => $courseId,
            'courseName' => $courseName,
            'lastUpdated' => $lastUpdated ? $lastUpdated->toISOString() : null,
            'piecesList' => $pieces,
            'modulesList' => $modules,
            'nonModulePiecesList' => $nonModulePieces,
            'initialLoading' => false
        ]);
    }
}
