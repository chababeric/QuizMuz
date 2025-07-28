<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'institution_id'];

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function levels(): HasMany
    {
        return $this->hasMany(Level::class);
    }

    public function admins(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user_roles')
            ->withPivot('admin_control_id')
            ->withTimestamps();
    }
}
