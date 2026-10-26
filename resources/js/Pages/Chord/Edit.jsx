import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useState, useEffect } from "react";
import {Head} from "@inertiajs/react";
import axios from 'axios';
import AddNewChord from "@/Pages/Chord/Partials/AddNewChord.jsx";
import UpdateChord from "@/Pages/Chord/Partials/UpdateChord.jsx";
import AddModule from "@/Pages/Piece/Partials/AddModule.jsx";
import UpdateModule from "@/Pages/Piece/Partials/UpdateModule.jsx";
import ModuleList from "@/Pages/Piece/Partials/ModuleList.jsx";


export default function Edit({ auth, user }) {
    const [chords, setChords] = useState([]);
    const [sortedLevels, setSortedLevels] = useState([]);

    useEffect(() => {
        getAllChords();
        getFMALevels();
    }, []);

    const getAllChords = () => {
        axios.get(route('allChords'))
            .then((response) => {
                // Sort the chordsList by order
                const sortedChords = response.data.sort((a, b) => a.order - b.order);
                setChords(sortedChords);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const getFMALevels = () => {
        axios.get(route('fmaLevels'))
            .then(response => {
                const levels = response.data;
                const sorted = levels.sort((a, b) => a.name.localeCompare(b.name));
                setSortedLevels(sorted);
            })
            .catch(error => {
                console.error('Error fetching FMA levels:', error);
            });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">FMA</h2>}
        >
            <Head title="Admin - FMA" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <AddNewChord
                            className="max-w-xl dark:bg-gray-800"
                            levelsList={sortedLevels}
                            getAllChords={getAllChords}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdateChord
                            chordsList={chords}
                            setChordsList={setChords}
                            levelsList={sortedLevels}
                        />
                    </div>

                    {/* Module sections, same layout as the LitMus page */}
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                        <ModuleList courseName="Formation Musicale et Auditive"/>
                        <AddModule courseName="Formation Musicale et Auditive"/>
                        <UpdateModule courseName="Formation Musicale et Auditive"/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
