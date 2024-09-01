<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Level extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // Define the relationship with the Piece model
    public function pieces(): HasMany
    {
        return $this->hasMany(Piece::class, 'level_id');
    }
}
