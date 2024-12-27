<?php

namespace App\Http\Controllers;

use App\Models\Piece;
use App\Models\PieceReserve;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PieceController extends Controller
{
    /**
     * Get all pieces from a specific level
     *
     * @param int $level_id
     * @return JsonResponse
     */
    public function getPiecesByLevel(int $level_id): JsonResponse
    {
        $pieces = Piece::with('level')->where('level_id', $level_id)->get();
        return response()->json($pieces);
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
        $pieces = Piece::with('level')->where('institution_id', $initiator->institution_id)->get();

        return response()->json($pieces);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $piece = Piece::findOrFail($id);
        $piece->update($request->all());

        return response()->json(['message' => 'Les modifications ont été enregistrées avec succès.']);
    }

    public function destroy($id): JsonResponse
    {
        $piece = PieceReserve::findOrFail($id);
        $piece->delete();

        return response()->json(['message' => 'La pièce a été supprimée avec succès.']);
    }

    public function moveToReserve($id): JsonResponse
    {
        // Find the piece
        $piece = Piece::findOrFail($id);

        // Create a new piece reserve entry
        $piecesReserve = new PieceReserve([
            'level_id' => $piece->level_id,
            'period' => $piece->period,
            'genre' => $piece->genre,
            'composer' => $piece->composer,
            'title' => $piece->title,
            'element' => $piece->element,
            'no_mvt' => $piece->no_mvt,
            'mvt' => $piece->mvt,
            'form' => $piece->form,
            'file_name' => $piece->file_name,
            'order' => $piece->order,
            'institution_id' => $piece->institution_id,
        ]);

        $piecesReserve->save();

        // Delete the piece from the original table
        $piece->delete();

        return response()->json(['message' => $piece->title . ' de ' . $piece->composer . ' a été déplacé en réserve.']);
    }

    public function moveToPieces($id): JsonResponse
    {
        // Find the piece
        $pieceReserve = PieceReserve::findOrFail($id);

        // Create a new piece entry
        $piece = new Piece([
            'level_id' => $pieceReserve->level_id,
            'period' => $pieceReserve->period,
            'genre' => $pieceReserve->genre,
            'composer' => $pieceReserve->composer,
            'title' => $pieceReserve->title,
            'element' => $pieceReserve->element,
            'no_mvt' => $pieceReserve->no_mvt,
            'mvt' => $pieceReserve->mvt,
            'form' => $pieceReserve->form,
            'file_name' => $pieceReserve->file_name,
            'order' => $pieceReserve->order,
            'institution_id' => $pieceReserve->institution_id,
        ]);

        $piece->save();

        // Delete the piece from the original table
        $pieceReserve->delete();

        return response()->json(['message' => $pieceReserve->title . ' de ' . $pieceReserve->composer . ' est de retour dans la liste des pièces.']);
    }

    public function store(Request $request): RedirectResponse
    {
        $initiator = auth()->user();
        $validatedData = $request->validate(
            [
                'course' => 'required|string',
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
                'audioFile' => 'nullable'
            ],
            [
                'course.required' => 'Le cours est requis.',
                'level.required' => 'Le niveau est requis.',
                'composer.required' => 'Le compositeur est requis.',
                'title.required' => 'Le titre est requis.',
                'fileName.required' => 'Le nom du fichier audio est requis.',
                'fileName.regex' => 'Le nom du fichier doit se terminer par .mp3.'
            ]
        );

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

        // Find the highest order for the given level
        $highestOrder = Piece::where('level_id', $validatedData['level'])->max('order');
        $newOrder = $highestOrder !== null ? $highestOrder + 1 : 1;

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
        ]);

        // Save the new piece to the database
        $piece->save();

//        return response()->json(['message' => 'La pièce a été ajoutée avec succès.']);
        return redirect()->route('piece.edit');
    }

    public function getPiecesInReserve(): JsonResponse
    {
        $pieces = PieceReserve::with('level')->get();
        return response()->json($pieces);
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $pieces = $request->input('pieces');

        foreach ($pieces as $pieceData) {
            $piece = Piece::findOrFail($pieceData['id']);
            $piece->order = $pieceData['order'];
            $piece->save();
        }

        return response()->json(['message' => 'L\'ordre des pièces a été mis à jour avec succès.']);
    }

    public function getPiecesInfo(): JsonResponse
    {
        $pieces = Piece::with('level')->get();
        return response()->json($pieces);
    }
}
