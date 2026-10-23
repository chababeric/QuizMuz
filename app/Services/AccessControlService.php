<?php

namespace App\Services;

use App\Models\AdminControl;
use App\Models\User;

class AccessControlService
{
    /**
     * @var array<int, string[]> Course admin role system names, keyed by user id
     */
    protected array $courseAccessNames = [];

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
            'canAccessLogs' => false,
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
        // Check if user has the given admin role (e.g. fma_admin) for any course
        return in_array($access_name, $this->getCourseAccessNames($user), true);
    }

    /**
     * System names of the course admin roles the user holds, fetched once per request.
     */
    protected function getCourseAccessNames(User $user): array
    {
        return $this->courseAccessNames[$user->id] ??= AdminControl::query()
            ->join('course_user_roles', 'course_user_roles.admin_control_id', '=', 'admin_controls.id')
            ->where('course_user_roles.user_id', $user->id)
            ->distinct()
            ->pluck('admin_controls.system_name')
            ->all();
    }
}
