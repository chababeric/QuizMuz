import { useState, useEffect } from 'react';
import axios from 'axios';

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

            // Sort users alphabetically by full name
            const sortedUsers = [...users].sort((a, b) => {
                const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });

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

    // Render table for desktop view with dropdown menus
    const renderDesktopTable = (institutionUsers) => {
        return (
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nom d'utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Rôles Globaux
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Rôles de Cours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ajouter un rôle
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {institutionUsers.map(user => {
                        // Filter global roles (excluding course-specific admin roles)
                        const userGlobalRoles = user.roles.filter(role =>
                            !['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name)
                        );

                        // Create an array to hold all course roles across all courses
                        const userCourseRoles = [];

                        // For each course, get the user's admin roles
                        courses.forEach(course => {
                            if (courseAdmins[course.id]) {
                                const courseRoles = roles.filter(role =>
                                    ['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name) &&
                                    isCourseAdmin(user, course.id, role.id)
                                );

                                // Add course info to each role
                                courseRoles.forEach(role => {
                                    userCourseRoles.push({
                                        ...role,
                                        courseId: course.id,
                                        courseName: course.name
                                    });
                                });
                            }
                        });

                        // Get available roles for this user
                        const availableRoles = getAvailableRolesFlat(user);

                        return (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {user.first_name} {user.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {user.username}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                    {userGlobalRoles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {userGlobalRoles.map(role => (
                                                <div
                                                    key={role.id}
                                                    className={`mb-1 px-2 py-1 rounded text-xs text-white flex items-center ${
                                                        flashingRole === `${user.id}-${role.id}`
                                                            ? 'bg-green-500 animate-pulse'
                                                            : 'bg-blue-600'
                                                    }`}
                                                >
                                                    <span>{role.name}</span>
                                                    <button
                                                        onClick={() => updateUserRole(user.id, role.id, 'remove')}
                                                        className="ml-2 text-white hover:text-red-200"
                                                        disabled={updatingUser === user.id}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">Aucun rôle</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                    {userCourseRoles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {userCourseRoles.map(role => (
                                                <div
                                                    key={`${role.id}-${role.courseId}`}
                                                    className={`mb-1 px-2 py-1 rounded text-xs text-white flex items-center ${
                                                        flashingRole === `course-${user.id}-${role.id}-${role.courseId}`
                                                            ? 'bg-green-500 animate-pulse'
                                                            : 'bg-purple-600'
                                                    }`}
                                                >
                                                    <span>{role.name}</span>
                                                    <button
                                                        onClick={() => removeCourseAdmin(user.id, role.id, role.courseId)}
                                                        className="ml-2 text-white hover:text-red-200"
                                                        disabled={updatingUser === user.id}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">Aucun rôle</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    <div className="relative inline-block w-full">
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                            disabled={updatingUser === user.id}
                                        >
                                            <option value="">Sélection</option>
                                            {availableRoles.map(role => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render mobile cards view
    const renderMobileCards = (institutionUsers) => {
        return (
            <div className="md:hidden space-y-4">
                {institutionUsers.map(user => {
                    // Filter global roles (excluding course-specific admin roles)
                    const userGlobalRoles = user.roles.filter(role =>
                        !['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name)
                    );

                    // Create an array to hold all course roles across all courses
                    const userCourseRoles = [];

                    // For each course, get the user's admin roles
                    courses.forEach(course => {
                        if (courseAdmins[course.id]) {
                            const courseRoles = roles.filter(role =>
                                ['fma_admin', 'litmus_admin', 'history_admin'].includes(role.system_name) &&
                                isCourseAdmin(user, course.id, role.id)
                            );

                            // Add course info to each role
                            courseRoles.forEach(role => {
                                userCourseRoles.push({
                                    ...role,
                                    courseId: course.id,
                                    courseName: course.name
                                });
                            });
                        }
                    });

                    // Get available roles for this user
                    const availableRoles = getAvailableRolesFlat(user);

                    return (
                        <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {user.first_name} {user.last_name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                            </div>

                            {/* Global Roles Section */}
                            <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôles Globaux:</h4>
                                {userGlobalRoles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {userGlobalRoles.map(role => (
                                            <div
                                                key={role.id}
                                                className={`mb-1 px-2 py-1 rounded text-xs text-white flex items-center ${
                                                    flashingRole === `${user.id}-${role.id}`
                                                        ? 'bg-green-500 animate-pulse'
                                                        : 'bg-blue-600'
                                                }`}
                                            >
                                                <span>{role.name}</span>
                                                <button
                                                    onClick={() => updateUserRole(user.id, role.id, 'remove')}
                                                    className="ml-2 text-white hover:text-red-200"
                                                    disabled={updatingUser === user.id}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Aucun rôle</span>
                                )}
                            </div>

                            {/* Course Roles Section */}
                            <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôles de Cours:</h4>
                                {userCourseRoles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {userCourseRoles.map(role => (
                                            <div
                                                key={`${role.id}-${role.courseId}`}
                                                className={`mb-1 px-2 py-1 rounded text-xs text-white flex items-center ${
                                                    flashingRole === `course-${user.id}-${role.id}-${role.courseId}`
                                                        ? 'bg-green-500 animate-pulse'
                                                        : 'bg-purple-600'
                                                }`}
                                            >
                                                <span>{role.name}</span>
                                                <button
                                                    onClick={() => removeCourseAdmin(user.id, role.id, role.courseId)}
                                                    className="ml-2 text-white hover:text-red-200"
                                                    disabled={updatingUser === user.id}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Aucun rôle</span>
                                )}
                            </div>

                            {/* Simple flat dropdown for both role types */}
                            <div className="relative inline-block w-full">
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                    disabled={updatingUser === user.id}
                                >
                                    <option value="">Sélection</option>
                                    {availableRoles.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Gestion des accès utilisateurs</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Gérez les rôles et les accès des utilisateurs.
                </p>
            </header>

            {message && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="mt-6">
                {loading ? (
                    <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
                ) : (
                    <div className="space-y-8">
                        {Object.keys(groupedUsers).map(institution => (
                            <div key={institution}>
                                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
                                    {institution} ({groupedUsers[institution].length} utilisateurs)
                                </h3>
                                {/* Desktop view */}
                                {renderDesktopTable(groupedUsers[institution])}

                                {/* Mobile view */}
                                {renderMobileCards(groupedUsers[institution])}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
