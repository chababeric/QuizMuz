import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head } from '@inertiajs/react';
import {useEffect, useState} from "react";
import LevelManagement from "@/Pages/GeneralSettings/Partials/LevelManagement.jsx";
// import AdminManagement from "@/Pages/GeneralSettings/Partials/AdminManagement.jsx";
import InstitutionManagement from "@/Pages/GeneralSettings/Partials/InstitutionManagement.jsx";
import ScoresReset from "@/Pages/GeneralSettings/Partials/ScoresReset.jsx";
import CourseManagement from "@/Pages/GeneralSettings/Partials/CourseManagement.jsx";
import { Toast, control, label, panel } from "@/Components/AdminUi";
import { EyeIcon } from "@/Components/AppIcons";

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

    const isOwnInstitution = selectedInstitutionId === auth.user.institution_id;
    const messageProps = { successMessage, setSuccessMessage, errorMessage, setErrorMessage };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Général</h2>}
        >
            <Head title="Admin - Général" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Institution Select */}
                <section aria-label="Institution affichée" className={`${panel} flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between`}>
                    <div className="w-full md:max-w-sm">
                        <label htmlFor="institution" className={label}>Institution affichée</label>
                        <select
                            id="institution"
                            name="institution"
                            value={selectedInstitutionId}
                            className={`${control} mt-1.5 w-full`}
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const selectedInst = institutions.find(inst => inst.id === selectedId);
                                setSelectedInstitutionId(selectedId);
                                setSelectedInstitution(selectedInst ? selectedInst.name : institution);
                            }}
                        >
                            {/* Default option: user's institution */}
                            <option value={auth.user.institution_id}>
                                {institution} (votre institution)
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

                    {!isOwnInstitution && (
                        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:max-w-md dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                            <EyeIcon className="mt-0.5 h-4 w-4"/>
                            Consultation seulement : les cours, niveaux et scores se modifient uniquement pour votre institution ({institution}).
                        </p>
                    )}
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <InstitutionManagement
                        institutions={institutions}
                        getInstitutions={getInstitutions}
                        {...messageProps}
                    />

                    <CourseManagement
                        authInstitution={institution}
                        courses={courses}
                        getCourses={getCourses}
                        {...messageProps}
                        selectedInstitution={selectedInstitution}
                    />
                </div>

                <LevelManagement
                    auth={auth}
                    levels={levels}
                    getLevels={getLevels}
                    {...messageProps}
                    courses={courses}
                    selectedInstitution={selectedInstitution}
                    selectedInstitutionId={selectedInstitutionId}
                />

                {/*<AdminManagement*/}
                {/*    auth={auth}*/}
                {/*    users={sortedUsers}*/}
                {/*    getUsers={getUsers}*/}
                {/*    successMessage={successMessage}*/}
                {/*    setSuccessMessage={setSuccessMessage}*/}
                {/*    errorMessage={errorMessage}*/}
                {/*    setErrorMessage={setErrorMessage}*/}
                {/*    selectedInstitution={selectedInstitution}*/}
                {/*    selectedInstitutionId={selectedInstitutionId}*/}
                {/*/>*/}

                <ScoresReset
                    auth={auth}
                    scores={scores}
                    getScores={getScores}
                    courses={courses}
                    {...messageProps}
                    selectedInstitution={selectedInstitution}
                    selectedInstitutionId={selectedInstitutionId}
                />
            </div>

            <Toast {...messageProps}/>
        </AuthenticatedLayout>
    );
}
