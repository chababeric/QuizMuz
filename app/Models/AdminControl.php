<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AdminControl extends Model
{
    use HasFactory;

    // The attributes that are mass assignable
    protected $fillable = [
        'name',
        'system_name',
        'description',
        'privileges',
    ];

    protected $casts = [
        'privileges' => 'array',
    ];

    // Define relationship to users (many-to-many)
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withTimestamps();
    }

    // Helper method to check if role has a specific privilege
    public function hasPrivilege(string $privilege): bool
    {
        return in_array($privilege, $this->privileges);
    }
}
