<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'institution_id',
        'username',
        'password',
        'admin_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user is an administrator
     *
     * @return HasOne if the user is an administrator
     */
    public function administrator(): HasOne
    {
        return $this->hasOne(AdminControl::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(AdminControl::class, 'user_roles')
            ->withTimestamps();
    }

    // Check if user has a specific privilege
    public function hasPrivilege(string $privilege): bool
    {
        foreach ($this->roles as $role) {
            if (in_array($privilege, $role->privileges)) {
                return true;
            }
        }
        return false;
    }

    public function isAdmin(): bool
    {
        // Check for global admin privileges
        if ($this->hasPrivilege('SuperAdmin') ||
            $this->hasPrivilege('Teacher') ||
            $this->hasPrivilege('StudentAdmin')) {
            return true;
        }
        return false;
    }


    public function adminCourses()
    {
        return $this->belongsToMany(Course::class, 'course_user_roles')
            ->withPivot('admin_control_id')
            ->withTimestamps();
    }

    public function hasCourseRole(int $courseId, string $roleName): bool
    {
        return $this->adminCourses()
            ->wherePivot('course_id', $courseId)
            ->wherePivotIn('admin_control_id', function($query) use ($roleName) {
                $query->select('id')
                    ->from('admin_controls')
                    ->where('system_name', $roleName);
            })
            ->exists();
    }

    public function isCourseAdmin(int $courseId): bool
    {
        // A user is a course admin if they have any of the course-specific admin roles
        // or if they are a SuperAdmin/Teacher
        if ($this->hasPrivilege('SuperAdmin') || $this->hasPrivilege('Teacher')) {
            return true;
        }

        return $this->adminCourses()
            ->wherePivot('course_id', $courseId)
            ->wherePivotIn('admin_control_id', function($query) {
                $query->select('id')
                    ->from('admin_controls')
                    ->whereIn('system_name', ['fma_admin', 'litmus_admin', 'history_admin']);
            })
            ->exists();
    }

    /**
     * Get specific course admin role for a user
     */
    public function getCourseAdminRole(int $courseId)
    {
        return $this->adminCourses()
            ->wherePivot('course_id', $courseId)
            ->wherePivotIn('admin_control_id', function($query) {
                $query->select('id')
                    ->from('admin_controls')
                    ->whereIn('system_name', ['fma_admin', 'litmus_admin', 'history_admin']);
            })
            ->first()
            ->pivot
            ->admin_control_id;
    }
}
