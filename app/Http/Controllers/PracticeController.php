<?php

namespace App\Http\Controllers;

use App\Http\Middleware\UserStats;
use App\Models\Chord;
use App\Models\Level;
use App\Models\Module;
use App\Models\Piece;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeController extends Controller
{
    // Only what the Practice page shows (plus module_id for grouping); the full rows carry answers and timestamps it never reads
    private const PIECE_COLUMNS = ['id', 'module_id', 'title', 'composer', 'no_mvt', 'mvt', 'file_name'];
    private const CHORD_COLUMNS = ['id', 'module_id', 'chord_name', 'file_name'];

    public function index(Request $request): Response
    {
        $initiator = auth()->user();
        $level = $request->input('level');
        $courseId = $request->input('courseId');
        $courseName = $request->input('courseName');

        // Variables to hold the data
        $pieces = [];
        $modules = [];
        $nonModulePieces = [];
        $lastUpdated = null;

        if ($courseName === "Formation Musicale et Auditive") {
            $allChords = Chord::where('level_id', $level)
                ->orderBy('order')
                ->get(self::CHORD_COLUMNS);

            $lastUpdated = Chord::where('level_id', $level)->max('updated_at');

            // Normalize module_id to int and split
            $groupedByModule = [];
            $nonModuleChords = [];
            foreach ($allChords as $chord) {
                $mid = $chord->module_id === null ? null : (int)$chord->module_id;
                if ($mid === null) {
                    $nonModuleChords[] = $chord->toArray();
                    continue;
                }
                if (!isset($groupedByModule[$mid])) {
                    $groupedByModule[$mid] = [
                        'module' => [
                            'id' => $mid,
                            'title' => '',
                            'order' => 0,
                            'description' => ''
                        ],
                        'chords' => []
                    ];
                }
                $groupedByModule[$mid]['chords'][] = $chord->toArray();
            }

            // Fetch only modules of this level and index by int id
            $moduleData = Module::where('level_id', $level)
                ->orderBy('order')
                ->get();
            foreach ($moduleData as $module) {
                $mid = (int)$module->id;
                if (isset($groupedByModule[$mid])) {
                    $groupedByModule[$mid]['module'] = [
                        'id' => $mid,
                        'title' => $module->title,
                        'order' => (int)$module->order,
                        'description' => $module->description
                    ];
                }
            }

            // Keep only buckets that have chords (like the pieces path)
            $modules = collect(array_values($groupedByModule))
                ->filter(fn ($bucket) => !empty($bucket['chords']))
                ->sortBy('module.order')
                ->values()
                ->toArray();

            // No flat list here: the page rebuilds it from modulesList and nonModulePiecesList
            $nonModulePieces = $nonModuleChords;
        } elseif ($courseName === "Littérature Musicale") {
            // For LitMus course, fetch pieces and organize by modules
            $allPieces = Piece::where('level_id', $level)
                ->orderBy('order')
                ->get(self::PIECE_COLUMNS);

            // Get last updated
            $lastUpdated = Piece::where('level_id', $level)->max('updated_at');

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

            // No flat list here: the page rebuilds it from modulesList and nonModulePiecesList
        } else {
            // For other courses, fetch pieces
            $pieces = Piece::where('level_id', $level)
                ->orderBy('order')
                ->get(self::PIECE_COLUMNS)
                ->toArray();

            // Get last updated
            $lastUpdated = Piece::where('level_id', $level)->max('updated_at');
        }

        $userStats = new UserStats();
        $userStats->incrementUserStats($initiator->id, $courseId, 'practice');

        return Inertia::render('Practice', [
            'level' => $level,
            'levelName' => Level::find($level)?->name,
            'courseId' => $courseId,
            'courseName' => $courseName,
            'lastUpdated' => $lastUpdated ? Carbon::parse($lastUpdated)->toISOString() : null,
            'piecesList' => $pieces,
            'modulesList' => $modules,
            'nonModulePiecesList' => $nonModulePieces,
            'initialLoading' => false
        ]);
    }
}
