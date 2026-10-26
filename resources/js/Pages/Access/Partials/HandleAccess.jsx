import { useState, useEffect } from 'react';
import axios from 'axios';
import { EmptyState, SectionCard, Toast, control, muted } from '@/Components/AdminUi';
import { XIcon } from '@/Components/AppIcons';

const COURSE_ROLE_NAMES = ['fma_admin', 'litmus_admin', 'history_admin'];
const fullName = (user) => [user.last_name, user.first_name].filter(Boolean).join(', ');

// Removable role pill; flashes green right after it was added
function RoleChip({ role, tone, flashing, disabled, onRemove, userName }) {
    const tones = {
        global: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-200',
        course: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-200',
    };
    return (
        <span
            title={role.courseName}
            className={`inline-flex items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-1 text-xs font-medium transition motion-reduce:transition-none ${
                flashing ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200' : tones[tone]
            }`}
        >
            {role.name}
            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                aria-label={`Retirer le rôle ${role.name} de ${userName}`}
                className="flex h-5 w-5 items-center justify-center rounded-full opacity-70 hover:bg-black/10 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
            >
                <XIcon className="h-3 w-3"/>
            </button>
        </span>
    );
}

const NoRole = () => <span className={`text-sm ${muted}`}>Aucun rôle</span>;

export default function HandleAccess({ className = '', roles, courses }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [updatingUser, setUpdatingUser] = useState(null);
    const [groupedUsers, setGroupedUsers] = useState({});
    const [courseAdmins, setCourseAdmins] = useState({});
    const [flashingRole, setFlashingRole] = useState(null);

    // Fetch all users when component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Process users to group them by institution and sort alphabetically
    useEffect(() => {
        if (users.length > 0) {
            const grouped = {};

            // Sort users alphabetically by family name, then first name
            const sortedUsers = [...users].sort((a, b) =>
                (a.last_name ?? '').localeCompare(b.last_name ?? '', 'fr', { sensitivity: 'base' })
                || (a.first_name ?? '').localeCompare(b.first_name ?? '', 'fr', { sensitivity: 'base' })
            );

            // Group sorted users by institution
            sortedUsers.forEach(user => {
                const institution = user.institution_name || 'Sans institution';

                if (!grouped[institution]) {
                    grouped[institution] = [];
                }

                grouped[institution].push(user);
            });

            setGroupedUsers(grouped);
        }
    }, [users]);

    // Fetch course admins for all courses when users are loaded
    useEffect(() => {
        if (users.length > 0 && courses.length > 0) {
            courses.forEach(course => {
                fetchCourseAdmins(course.id);
            });
        }
    }, [users, courses]);

    // Flash animation effect for newly added roles
    useEffect(() => {
        if (flashingRole) {
            const timer = setTimeout(() => {
                setFlashingRole(null);
            }, 2000); // 2 seconds flash
            return () => clearTimeout(timer);
        }
    }, [flashingRole]);

    // Fetch all users
    const fetchUsers = () => {
        setLoading(true);
        axios.get(route('allUsers'))
            .then(response => {
                // Add roles property to each user if it doesn't exist
                const usersWithRoles = response.data.map(user => ({
                    ...user,
                    roles: user.roles || []
                }));
                setUsers(usersWithRoles);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                setError('Erreur lors de la récupération des utilisateurs.');
                setLoading(false);
            });
    };

    // Fetch course admins
    const fetchCourseAdmins = (courseId) => {
        axios.get(route('course-admins.get', { courseId }))
            .then(response => {
                setCourseAdmins(prev => ({
                    ...prev,
                    [courseId]: response.data
                }));
            })
            .catch(error => {
                console.error('Error fetching course admins:', error);
                setError('Erreur lors de la récupération des administrateurs du cours.');
            });
    };

    // Update user role
    const updateUserRole = (userId, roleId, action) => {
        setUpdatingUser(userId);
        setMessage('');
        setError('');

        const endpoint = action === 'add' ? 'users.addRole' : 'users.removeRole';

        axios.post(route(endpoint), {
            user_id: userId,
            role_id: roleId
        })
            .then(response => {
                setMessage(response.data.message);

                // Update the user's roles in the local state instead of fetching all users again
                setUsers(prevUsers => {
                    return prevUsers.map(user => {
                        if (user.id === userId) {
                            // Find the role that was added/removed
                            const role = roles.find(r => r.id === roleId);

                            if (action === 'add') {
                                // Only add if the role doesn't already exist
                                if (!user.roles.some(r => r.id === roleId)) {
                                    // Set flashing role to highlight the newly added role
                                    setFlashingRole(`${userId}-${roleId}`);
                                    return {
                                        ...user,
                                        roles: [...user.roles, role]
                                    };
                                }
                            } else {
                                // Remove the role
                                return {
                                    ...user,
                                    roles: user.roles.filter(r => r.id !== roleId)
                                };
                            }
                        }
                        return user;
                    });
                });

                setUpdatingUser(null); // Clear updating state
            })
            .catch(error => {
                console.error('Error updating user role:', error);
                setError(error.response?.data?.message || 'Erreur lors de la mise à jour du rôle.');
                setUpdatingUser(null); // Clear updating state
            });
    };

    // Add course admin
    const addCourseAdmin = (userId, roleId, courseId) => {
        setUpdatingUser(userId);
        setMessage('');
        setError('');

        axios.post(route('course-admins.add'), {
            user_id: userId,
            course_id: courseId,
            admin_control_id: roleId // Using admin_control_id as per CourseAdminController
        })
            .then(response => {
                setMessage(response.data.message);
                fetchCourseAdmins(courseId);
                setFlashingRole(`course-${userId}-${roleId}-${courseId}`);
                setUpdatingUser(null);
            })
            .catch(error => {
                console.error('Error adding course admin:', error);
                setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'administrateur du cours.');
                setUpdatingUser(null);
            });
    };

    // Remove course admin
    const removeCourseAdmin = (userId, roleId, courseId) => {
        setUpdatingUser(userId);
        setMessage('');
        setError('');

        axios.post(route('course-admins.remove'), {
            user_id: userId,
            course_id: courseId,
            admin_control_id: roleId
        })
            .then(response => {
                setMessage(response.data.message);
                fetchCourseAdmins(courseId);
                setUpdatingUser(null);
            })
            .catch(error => {
                console.error('Error removing course admin:', error);
                setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'administrateur du cours.');
                setUpdatingUser(null);
            });
    };

    // Check if user has a specific role
    const hasRole = (user, roleSystemName) => {
        return user.roles.some(role => role.system_name === roleSystemName);
    };

    // Check if user is a course admin for a specific course and role
    const isCourseAdmin = (user, courseId, roleId) => {
        if (!courseAdmins[courseId]) return false;

        return courseAdmins[courseId].some(admin =>
            admin.id === user.id && admin.pivot.admin_control_id === roleId
        );
    };

    // Map admin role system names to their appropriate courses
    const getAppropriateCoursesForRole = (roleSystemName) => {
        switch (roleSystemName) {
            case 'fma_admin':
                return courses.filter(course => course.name === "Formation Musicale et Auditive");
            case 'litmus_admin':
                return courses.filter(course => course.name === "Littérature Musicale");
            case 'history_admin':
                return courses.filter(course => course.name === "Histoire de la Musique");
            default:
                return [];
        }
    };

    // Get available roles for a user as a flat list (both global and course-specific)
    const getAvailableRolesFlat = (user) => {
        // Array to store all available roles
        const availableRoles = [];

        // Add global roles (excluding course-specific admin roles)
        roles.forEach(role => {
            if (!['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name)) {
                if (!user.roles.some(r => r.id === role.id)) {
                    availableRoles.push({
                        value: `global-${role.id}`,
                        label: role.name
                    });
                }
            }
        });

        // Add course-specific roles only for their appropriate courses
        roles.filter(role =>
            ['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name)
        ).forEach(role => {
            // Get only the appropriate courses for this role
            const appropriateCourses = getAppropriateCoursesForRole(role.system_name);

            appropriateCourses.forEach(course => {
                if (!isCourseAdmin(user, course.id, role.id)) {
                    availableRoles.push({
                        value: `course-${role.id}-${course.id}`,
                        label: `${role.name}`
                    });
                }
            });
        });

        return availableRoles;
    };

    // Global roles, course roles (with their course) and the roles that can still be added
    const getUserRoles = (user) => {
        const globalRoles = user.roles.filter(role => !COURSE_ROLE_NAMES.includes(role.system_name));
        const courseRoles = [];

        courses.forEach(course => {
            if (courseAdmins[course.id]) {
                roles
                    .filter(role => COURSE_ROLE_NAMES.includes(role.system_name) && isCourseAdmin(user, course.id, role.id))
                    .forEach(role => courseRoles.push({ ...role, courseId: course.id, courseName: course.name }));
            }
        });

        return { globalRoles, courseRoles, availableRoles: getAvailableRolesFlat(user) };
    };

    const renderGlobalRoles = (user, globalRoles) => globalRoles.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
            {globalRoles.map(role => (
                <RoleChip
                    key={role.id}
                    role={role}
                    tone="global"
                    userName={fullName(user)}
                    flashing={flashingRole === `${user.id}-${role.id}`}
                    disabled={updatingUser === user.id}
                    onRemove={() => updateUserRole(user.id, role.id, 'remove')}
                />
            ))}
        </div>
    ) : <NoRole/>;

    const renderCourseRoles = (user, courseRoles) => courseRoles.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
            {courseRoles.map(role => (
                <RoleChip
                    key={`${role.id}-${role.courseId}`}
                    role={role}
                    tone="course"
                    userName={fullName(user)}
                    flashing={flashingRole === `course-${user.id}-${role.id}-${role.courseId}`}
                    disabled={updatingUser === user.id}
                    onRemove={() => removeCourseAdmin(user.id, role.id, role.courseId)}
                />
            ))}
        </div>
    ) : <NoRole/>;

    // Flat dropdown for both role types
    const renderRoleSelect = (user, availableRoles) => (
        <select
            aria-label={`Ajouter un rôle à ${fullName(user)}`}
            className={`${control} w-full`}
            onChange={(e) => {
                if (e.target.value) {
                    const [type, roleId, courseId] = e.target.value.split('-');

                    if (type === 'global') {
                        updateUserRole(user.id, parseInt(roleId), 'add');
                    } else if (type === 'course') {
                        addCourseAdmin(user.id, parseInt(roleId), parseInt(courseId));
                    }

                    e.target.value = ''; // Reset dropdown after selection
                }
            }}
            disabled={updatingUser === user.id || availableRoles.length === 0}
        >
            <option value="">{availableRoles.length === 0 ? 'Tous les rôles attribués' : 'Ajouter un rôle…'}</option>
            {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                    {role.label}
                </option>
            ))}
        </select>
    );

    // Render table for desktop view
    const renderDesktopTable = (institutionUsers) => (
        <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
                <thead className={`bg-gray-50 text-xs uppercase tracking-wide dark:bg-gray-900/40 ${muted}`}>
                    <tr>
                        <th scope="col" className="py-3 pl-5 pr-4 font-semibold">Nom</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Rôles globaux</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Rôles de cours</th>
                        <th scope="col" className="w-56 py-3 pl-4 pr-5 font-semibold">Ajouter un rôle</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                    {institutionUsers.map(user => {
                        const { globalRoles, courseRoles, availableRoles } = getUserRoles(user);

                        return (
                            <tr key={user.id} className={updatingUser === user.id ? 'opacity-60' : ''}>
                                <td className="whitespace-nowrap py-3 pl-5 pr-4">
                                    <p className="font-medium text-gray-900 dark:text-white">{fullName(user)}</p>
                                    <p className={`text-xs ${muted}`}>{user.username}</p>
                                </td>
                                <td className="px-4 py-3">{renderGlobalRoles(user, globalRoles)}</td>
                                <td className="px-4 py-3">{renderCourseRoles(user, courseRoles)}</td>
                                <td className="py-3 pl-4 pr-5">{renderRoleSelect(user, availableRoles)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Render mobile cards view
    const renderMobileCards = (institutionUsers) => (
        <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-700/70">
            {institutionUsers.map(user => {
                const { globalRoles, courseRoles, availableRoles } = getUserRoles(user);

                return (
                    <li key={user.id} className={`flex flex-col gap-3 px-5 py-4 ${updatingUser === user.id ? 'opacity-60' : ''}`}>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{fullName(user)}</p>
                            <p className={`text-xs ${muted}`}>{user.username}</p>
                        </div>
                        <div>
                            <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${muted}`}>Rôles globaux</p>
                            {renderGlobalRoles(user, globalRoles)}
                        </div>
                        <div>
                            <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${muted}`}>Rôles de cours</p>
                            {renderCourseRoles(user, courseRoles)}
                        </div>
                        {renderRoleSelect(user, availableRoles)}
                    </li>
                );
            })}
        </ul>
    );

    const institutions = Object.keys(groupedUsers);

    return (
        <div className={`flex flex-col gap-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des accès utilisateurs</h2>
                <p className={`mt-1 text-sm ${muted}`}>
                    Gérez les rôles et les accès des utilisateurs.
                </p>
            </header>

            {loading ? (
                <SectionCard id="access-loading" title="Utilisateurs">
                    <EmptyState>Chargement des utilisateurs...</EmptyState>
                </SectionCard>
            ) : institutions.length === 0 ? (
                <SectionCard id="access-empty" title="Utilisateurs">
                    <EmptyState>Aucun utilisateur.</EmptyState>
                </SectionCard>
            ) : (
                institutions.map((institution, index) => (
                    <SectionCard
                        key={institution}
                        id={`institution-${index}`}
                        title={institution}
                        description={`${groupedUsers[institution].length} utilisateur${groupedUsers[institution].length > 1 ? 's' : ''}`}
                    >
                        {/* Desktop view */}
                        {renderDesktopTable(groupedUsers[institution])}

                        {/* Mobile view */}
                        {renderMobileCards(groupedUsers[institution])}
                    </SectionCard>
                ))
            )}

            <Toast successMessage={message} errorMessage={error} setSuccessMessage={setMessage} setErrorMessage={setError}/>
        </div>
    );
}
