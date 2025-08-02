<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoloGame extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'level_id',
        'difficulty',
        'pieces_list_id',
        'current_piece_id',
        'correct_answers',
        'game_key',
    ];

    protected $casts = [
        'pieces_list_id' => 'array',
        'correct_answers' => 'array',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function currentPiece(): BelongsTo
    {
        return $this->belongsTo(Piece::class, 'current_piece_id');
    }
}
