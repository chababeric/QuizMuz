<?php

namespace App\Services;

use App\Models\AdminControl;
use App\Models\User;

class AccessControlService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getUserAccessControls(User $user): array
    {
        $permissions = [
            'canAccessDashboard' => false,
            'canAccessGeneral' => false,
            'canAccessAccount' => false,
            'canAccessAccess' => false,
            'canAccessFMA' => false,
            'canAccessLitmus' => false,
            'canAccessHistory' => false,
        ];

        // If user has SuperAdmin privilege, grant all permissions immediately
        if ($user->hasPrivilege('SuperAdmin')) {
            return array_fill_keys(array_keys($permissions), true);
        }

        // Check if user has roles
        if ($user->roles && $user->roles->count() > 0) {
            // Check for dashboard access (SuperAdmin or Teacher)
            $permissions['canAccessDashboard'] = $user->roles->some(function ($role) {
                return $role->privileges && (
                    in_array('SuperAdmin', $role->privileges) ||
                    in_array('Teacher', $role->privileges)
                );
            });

            // Check for general and access management (SuperAdmin only)
            $permissions['canAccessGeneral'] = $permissions['canAccessAccess'] = $user->roles->some(function ($role) {
                return $role->privileges && in_array('SuperAdmin', $role->privileges);
            });

            // Check for account management (SuperAdmin, Teacher, or StudentAdmin)
            $permissions['canAccessAccount'] = $user->roles->some(function ($role) {
                return $role->privileges && (
                    in_array('SuperAdmin', $role->privileges) ||
                    in_array('Teacher', $role->privileges) ||
                    in_array('StudentAdmin', $role->privileges)
                );
            });
        }

        $permissions['canAccessFMA'] = $this->hasCourseAccess($user, 'fma_admin');
        $permissions['canAccessLitmus'] = $this->hasCourseAccess($user, 'litmus_admin');
        $permissions['canAccessHistory'] = $this->hasCourseAccess($user, 'history_admin');

        return $permissions;
    }

    public function hasCourseAccess(User $user, string $access_name): bool
    {
        // Check if user has fma_admin role for any course
        $adminRole = AdminControl::where('system_name', $access_name)->first();

        if (!$adminRole) {
            return false;
        }

        return $user->adminCourses()
            ->wherePivotIn('admin_control_id', [$adminRole->id])
            ->exists();
    }
}
