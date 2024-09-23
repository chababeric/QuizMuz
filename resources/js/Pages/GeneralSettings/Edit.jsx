import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head } from '@inertiajs/react';
import {useEffect, useState} from "react";
import LevelManagement from "@/Pages/GeneralSettings/Partials/LevelManagement.jsx";
import AdminManagement from "@/Pages/GeneralSettings/Partials/AdminManagement.jsx";
import InstitutionManagement from "@/Pages/GeneralSettings/Partials/InstitutionManagement.jsx";
import ScoresReset from "@/Pages/GeneralSettings/Partials/ScoresReset.jsx";

export default function Edit({ auth }) {
    const [institutions, setInstitutions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [levels, setLevels] = useState([]);
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const getLevels = () => {
        axios.get(route('allLevels'))
        .then(response => {
            setLevels(response.data);
        })
        .catch(error => {
            console.error('Error fetching levels:', error);
        });
    };

    const getInstitutions = () => {
        axios.get(route('allInstitutions'))
        .then(response => {
            setInstitutions(response.data);
        })
        .catch(error => {
            console.error('Error fetching institutions:', error);
        });
    }

    const getCourses = () => {
        axios.get(route('allCourses'))
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }

    const getUsers = () => {
        axios.get(route('allUsers'))
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }
    const getScores = () => {
        axios.get(route('allScores'))
            .then(response => {
                setScores(response.data);
            })
            .catch(error => {
                console.error('Error fetching scores:', error);
            });
    }

    useEffect(() => {
        getUsers();
        getLevels();
        getCourses();
        getInstitutions();
        getScores();
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);
    }, [users]);

    const updateLastActionTime = () => {
        axios.post(route('updateLastActionTime'))
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
                            getUsers={getUsers}
                            updateLastActionTime={updateLastActionTime}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gestion des institutions</h1>
                        <InstitutionManagement
                            institutions={institutions}
                            getInstitutions={getInstitutions}
                            updateLastActionTime={updateLastActionTime}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <ScoresReset
                            scores={scores}
                            getScores={getScores}
                            updateLastActionTime={updateLastActionTime}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                        />
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
