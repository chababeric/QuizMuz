import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useState, useEffect } from "react";
import {Head} from "@inertiajs/react";
import AddNewChord from "@/Pages/Chords/Partials/AddNewChord.jsx";

export default function Edit({ auth, user }) {
    const [chords, setChords] = useState([]);
    const [sortedLevels, setSortedLevels] = useState([]);

    useEffect(() => {
        getAllChords();
        getFMALevels();
        updateLastActionTime();
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">FMA</h2>}
        >
            <Head title="Admin - FMA" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <AddNewChord
                            className="max-w-xl dark:bg-gray-800"
                            levelsList={sortedLevels}
                            updateLastActionTime={updateLastActionTime}
                            getAllChords={getAllChords}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
