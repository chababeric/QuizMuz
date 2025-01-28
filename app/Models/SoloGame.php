<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoloGame extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'level_id',
        'difficulty',
        'pieces_list_id',
        'current_piece_id',
        'correct_answers',
    ];

    protected $casts = [
        'pieces_list_id' => 'array',
        'correct_answers' => 'array',
    ];
}
