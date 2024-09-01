<?php

use App\Http\Controllers\PieceController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    Route::get('/pieces/level/{level_id}', [PieceController::class, 'getPiecesByLevel']);
});

Route::get('/pieces', [PieceController::class, 'getPiecesById']);
