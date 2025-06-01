<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Piece extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id',
        'module_id',
        'period',
        'genre',
        'composer',
        'title',
        'element',
        'no_mvt',
        'mvt',
        'form',
        'file_name',
        'order',
        'institution_id',
    ];

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
