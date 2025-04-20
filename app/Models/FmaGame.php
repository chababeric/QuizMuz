<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FmaGame extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'level_id',
        'difficulty',
        'chords_list_id',
        'current_chord_id',
        'correct_answer',
        'game_key',
    ];

    protected $casts = [
        'chords_list_id' => 'array',
        'correct_answer' => 'string',
    ];
}
