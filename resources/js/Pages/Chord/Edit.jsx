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

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <AddNewChord
                    levelsList={sortedLevels}
                    getAllChords={getAllChords}
                />

                <UpdateChord
                    chordsList={chords}
                    setChordsList={setChords}
                    levelsList={sortedLevels}
                />

                {/* Module sections, same layout as the LitMus page */}
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                    <ModuleList courseName="Formation Musicale et Auditive"/>
                    <AddModule courseName="Formation Musicale et Auditive"/>
                    <UpdateModule courseName="Formation Musicale et Auditive"/>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
