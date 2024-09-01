import React, { useState, useEffect } from 'react';
import axios from "axios";
import deleteIcon from "../../icons/delete.svg";
import Table from "@/Components/Table.jsx";
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function AddLevel({ updateLastActionTime }) {
    const [levels, setLevels] = useState([]);
    const [addLevelClicked, setAddLevelClicked] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchLevels = async () => {
        try {
            const response = await fetch('/api/levels');
            const data = await response.json();
            const levelsWithIcons = data.map(level => ({
                ...level,
                icon: deleteIcon,
                altIcon: 'delete'
            }));
            setLevels(levelsWithIcons);
        } catch (error) {
            console.error('There was an error fetching the levels!', error);
        }
    };

    useEffect(() => {
        fetchLevels().then(r => {});
    }, []);

    const removeLevel = async (level) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le niveau '${level.name}' ?`)) {
            return;
        }

        try {
            const response = await axios.post('/admin/remove-level', {
                level_id: level.id,
                name: level.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Remove the level from the list
            setLevels(prevLevels => prevLevels.filter(lvl => lvl.id !== level.id));

        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    };

    const addLevel = async () => {
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/add-level', {
                nom: newLevelName
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Clear the input field and refetch levels
            setNewLevelName('');
            setAddLevelClicked(false);
            await fetchLevels();
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setNewLevelName('');
            setSuccessMessage('');
        }
    };

    return (
        <div className="flex flex-col w-full items-center">
            <h1 className='text-4xl hover:cursor-default font-bold'>Gestion des niveaux</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <Table
                data={levels}
                columnNames={['Nom']}
                columnKeys={['name']}
                action={removeLevel}
                icon={level => level.icon}
                altIcon={level => level.altIcon}
                actionColumn={true}
            />

            <div className="mt-8">
                {!addLevelClicked &&
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16 flex items-center justify-center"
                        onClick={() => setAddLevelClicked(!addLevelClicked)}
                    >
                        Ajouter un niveau
                    </button>
                }

                {addLevelClicked &&
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            className="border border-gray-400 p-2 rounded w-96 mb-4"
                            placeholder="Nom du niveau"
                            value={newLevelName}
                            onChange={(e) => setNewLevelName(e.target.value)}
                        />
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16"
                            onClick={addLevel}
                        >
                            Ajouter
                        </button>
                    </div>
                }
            </div>
        </div>
    );
}
