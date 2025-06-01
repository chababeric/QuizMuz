<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id',
        'title',
        'description',
        'order',
        'institution_id',
    ];

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function pieces(): HasMany
    {
        return $this->hasMany(Piece::class)->orderBy('order');
    }
}
