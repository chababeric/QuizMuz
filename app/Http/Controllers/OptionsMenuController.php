<?php

namespace App\Http\Controllers;

use App\Models\Chord;
use App\Models\Module;
use App\Models\Piece;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OptionsMenuController extends Controller
{
    public function show(Request $request): Response
    {
        $level = $request->input('level');
        $courseId = $request->input('courseId');
        $courseName = $request->input('courseName');

        $isLiteratureMusicale = $courseName === "Littérature Musicale";
        $isFormationMusicale = $courseName === "Formation Musicale et Auditive";

        // Fetch pieces or chords based on course type
        if ($isFormationMusicale) {
            $pieces = $this->getChordsByLevel($level);
            $modules = [];
            $nonModulePieces = [];
        } else {
            $pieces = $this->getPiecesByLevel($level);

            if ($isLiteratureMusicale) {
                $modulesData = $this->getModulesWithPieces($level, $pieces);
                $modules = $modulesData['modules'];
                $nonModulePieces = $modulesData['nonModulePieces'];
            } else {
                $modules = [];
                $nonModulePieces = [];
            }
        }

        return Inertia::render('OptionsMenu', [
            'level' => $level,
            'courseId' => $courseId,
            'courseName' => $courseName,
            'pieces' => $pieces,
            'modules' => $modules,
            'nonModulePieces' => $nonModulePieces,
        ]);
    }

    private function getPiecesByLevel(int $level): array
    {
        return Piece::where('level_id', $level)
            ->orderBy('order')
            ->get(['id', 'title', 'composer', 'module_id', 'order'])
            ->toArray();
    }

    private function getChordsByLevel(int $level): array
    {
        return Chord::where('level_id', $level)
            ->orderBy('order')
            ->get(['id', 'chord_name', 'order'])
            ->map(function ($chord) {
                return [
                    'id' => $chord->id,
                    'chord_name' => $chord->chord_name,
                    'order' => $chord->order,
                ];
            })
            ->toArray();
    }

    private function getModulesWithPieces(int $level, array $pieces): array
    {
        // Get modules for this level
        $modules = Module::where('level_id', $level)
            ->orderBy('order')
            ->get(['id', 'title', 'description', 'order']);

        // Group pieces by module_id
        $groupedByModule = [];
        $nonModulePieces = [];

        foreach ($pieces as $piece) {
            if ($piece['module_id']) {
                if (!isset($groupedByModule[$piece['module_id']])) {
                    $groupedByModule[$piece['module_id']] = [
                        'module' => [
                            'id' => $piece['module_id'],
                            'title' => '',
                            'order' => 0,
                            'description' => ''
                        ],
                        'pieces' => []
                    ];
                }
                $groupedByModule[$piece['module_id']]['pieces'][] = $piece;
            } else {
                $nonModulePieces[] = $piece;
            }
        }

        // Update module information with actual data
        foreach ($modules as $module) {
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
        $modulesArray = array_values($groupedByModule);
        usort($modulesArray, function ($a, $b) {
            return $a['module']['order'] <=> $b['module']['order'];
        });

        return [
            'modules' => $modulesArray,
            'nonModulePieces' => $nonModulePieces,
        ];
    }
}
