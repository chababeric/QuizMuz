<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminControl extends Model
{
    use HasFactory;

    // The attributes that are mass assignable
    protected $fillable = [
        'user_id',
    ];

    // Defining the relationship to the User model
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
