<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chord extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id',
        'chord_name',
        'file_name',
        'order',
    ];

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }
}
