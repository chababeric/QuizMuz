import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head } from '@inertiajs/react';
import {useEffect, useState} from "react";
import LevelManagement from "@/Pages/GeneralSettings/Partials/LevelManagement.jsx";
import AdminManagement from "@/Pages/GeneralSettings/Partials/AdminManagement.jsx";

export default function Edit({ auth }) {
    const [courses, setCourses] = useState([]);
    const [levels, setLevels] = useState([]);
    const [users, setUsers] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const getLevels = () => {
        axios.get('/api/levels')
        .then(response => {
            setLevels(response.data);
        })
        .catch(error => {
            console.error('Error fetching levels:', error);
        });
    };

    useEffect(() => {
        axios.get(route('allCourses'))
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });

        axios.get('/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });

        getLevels();
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);
    }, [users]);

    const updateLastActionTime = () => {
        axios.post('/update-last-action-time')
            .then(response => {})
            .catch(error => {
                console.error('Error updating last action time:', error);
            });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Général</h2>}
        >
            <Head title="Admin - Général" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des niveaux</h1>
                        <LevelManagement
                            levels={levels}
                            setLevels={setLevels}
                            getLevels={getLevels}
                            updateLastActionTime={updateLastActionTime}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            setSuccessMessage={setSuccessMessage}
                            setErrorMessage={setErrorMessage}
                            courses={courses}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des admins</h1>
                        <AdminManagement
                            users={sortedUsers}
                            setUsers={setUsers}
                            updateLastActionTime={updateLastActionTime}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des niveaux</h1>
                        {/*<DeleteUserForm className="max-w-xl" />*/}
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des institutions</h1>
                        {/*<DeleteUserForm className="max-w-xl" />*/}
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Réinitialisation des scores</h1>
                        {/*<DeleteUserForm className="max-w-xl" />*/}
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des cours</h1>
                        {/*<DeleteUserForm className="max-w-xl" />*/}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
