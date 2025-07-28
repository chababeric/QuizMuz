import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head } from '@inertiajs/react';
import {useEffect, useState} from "react";
import LevelManagement from "@/Pages/GeneralSettings/Partials/LevelManagement.jsx";
// import AdminManagement from "@/Pages/GeneralSettings/Partials/AdminManagement.jsx";
import InstitutionManagement from "@/Pages/GeneralSettings/Partials/InstitutionManagement.jsx";
import ScoresReset from "@/Pages/GeneralSettings/Partials/ScoresReset.jsx";
import CourseManagement from "@/Pages/GeneralSettings/Partials/CourseManagement.jsx";

export default function Edit({ auth, institution }) {
    const [institutions, setInstitutions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [levels, setLevels] = useState([]);
    // const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    // const [sortedUsers, setSortedUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState(institution);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState(auth.user.institution_id);

    const getLevels = () => {
        axios.get(route('allLevels'), {
            params: {
                institution_id: selectedInstitutionId
            }
        })
        .then(response => {
            const levels = response.data;
            const sorted = levels.sort((a, b) => a.name.localeCompare(b.name));
            setLevels(sorted);
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
    };

    const getCourses = () => {
        axios.get(route('allCourses'), {
            params: {
                institution_id: selectedInstitutionId
            }
        })
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    };

    // const getUsers = () => {
    //     axios.get(route('usersFromInstitution'), {
    //         params: {
    //             institution_id: selectedInstitutionId
    //         }
    //     })
    //         .then(response => {
    //             setUsers(response.data);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching users:', error);
    //         });
    // };

    const getScores = () => {
        axios.get(route('allScores'), {
            params: {
                institution_id: selectedInstitutionId
            }
        })
            .then(response => {
                setScores(response.data);
            })
            .catch(error => {
                console.error('Error fetching scores:', error);
            });
    };

    useEffect(() => {
        // getUsers();
        getLevels();
        getCourses();
        getInstitutions();
        getScores();
    }, [selectedInstitution]);

    // useEffect(() => {
    //     // Sort users alphabetically by last name
    //     const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
    //     setSortedUsers(sorted);
    // }, [users]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Général</h2>}
        >
            <Head title="Admin - Général" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Institution Select */}
                    <div className="mb-6">
                        <label htmlFor="institution" className="block text-xl font-medium text-black dark:text-white">
                            Choisir une institution
                        </label>
                        <select
                            id="institution"
                            name="institution"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base rounded-md dark:text-white dark:bg-gray-800"
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const selectedInst = institutions.find(inst => inst.id === selectedId);
                                setSelectedInstitutionId(selectedId);
                                setSelectedInstitution(selectedInst ? selectedInst.name : institution);
                            }}
                        >
                            {/* Default option: user's institution */}
                            <option value={auth.user.institution_id}>
                                {institution}
                            </option>

                            {/* Filter out user's institution from the list */}
                            {institutions
                                .filter(inst => inst.id !== auth.user.institution_id)
                                .map(institution => (
                                    <option key={institution.id} value={institution.id}>
                                        {institution.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Gestion des institutions</h1>
                        <InstitutionManagement
                            institutions={institutions}
                            getInstitutions={getInstitutions}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Gestion des cours - {selectedInstitution}</h1>
                        <CourseManagement
                            authInstitution={institution}
                            courses={courses}
                            getCourses={getCourses}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            setSuccessMessage={setSuccessMessage}
                            setErrorMessage={setErrorMessage}
                            selectedInstitution={selectedInstitution}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Gestion des niveaux - {selectedInstitution}</h1>
                        <LevelManagement
                            auth={auth}
                            levels={levels}
                            getLevels={getLevels}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            setSuccessMessage={setSuccessMessage}
                            setErrorMessage={setErrorMessage}
                            courses={courses}
                            selectedInstitution={selectedInstitution}
                            selectedInstitutionId={selectedInstitutionId}
                        />
                    </div>

                    {/*<div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">*/}
                    {/*    <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Gestion des administrateurs - {selectedInstitution}</h1>*/}
                    {/*    <AdminManagement*/}
                    {/*        auth={auth}*/}
                    {/*        users={sortedUsers}*/}
                    {/*        getUsers={getUsers}*/}
                    {/*        successMessage={successMessage}*/}
                    {/*        setSuccessMessage={setSuccessMessage}*/}
                    {/*        errorMessage={errorMessage}*/}
                    {/*        setErrorMessage={setErrorMessage}*/}
                    {/*        selectedInstitution={selectedInstitution}*/}
                    {/*        selectedInstitutionId={selectedInstitutionId}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <ScoresReset
                            auth={auth}
                            scores={scores}
                            getScores={getScores}
                            successMessage={successMessage}
                            setSuccessMessage={setSuccessMessage}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                            selectedInstitution={selectedInstitution}
                            selectedInstitutionId={selectedInstitutionId}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
