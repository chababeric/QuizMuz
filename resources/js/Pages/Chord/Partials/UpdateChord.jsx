import React, {useEffect, useRef, useState} from 'react';
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import InputLabel from "@/Components/InputLabel.jsx";
import settingsIcon from '../../../../icons/settings-black.svg';
import settingsWhiteIcon from '../../../../icons/settings.svg';
import Modal from "@/Components/Modal.jsx";
import axios from "axios";
import TextInput from "@/Components/TextInput.jsx";
import {useForm} from '@inertiajs/react';
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import DangerButton from "@/Components/DangerButton.jsx";
import {Transition} from "@headlessui/react";

export default function UpdateChord({ className = '', chordsList, setChordsList, updateLastActionTime, levelsList }) {
    const [selectedFilterLevel, setSelectedFilterLevel] = useState('');
    const [filterDisplay, setFilterDisplay] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const currentChord = useRef(chordsList[0] || null);
    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        id: '',
        level: '',
        chord_name: '',
    });

    const openDeleteModal = (chord) => {
        currentChord.current = chord;
        setIsDeleteModalOpen(true);
    }

    const openEditModal = (chord) => {
        currentChord.current = chord;
        setData({
            id: chord.id || '',
            level: chord.level.id || '',
            chord_name: chord.chord_name || '',
        });
        setIsEditModalOpen(true);
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        // Extract the level from the droppableId (e.g., 'level-LevelName')
        const sourceLevelName = source.droppableId.split('-')[1];
        const destinationLevelName = destination.droppableId.split('-')[1];

        // Ensure the source and destination levels are the same
        if (sourceLevelName !== destinationLevelName) return;

        // Clone the list of chords
        const updatedChordsList = [...chordsList];

        // Group chords by level
        const groupedChords = groupAndSortChords(updatedChordsList);

        // Get the array of chords for the specific level
        const levelChords = groupedChords[sourceLevelName];

        // Rearrange items only within the specific level
        const [movedItem] = levelChords.splice(source.index, 1);
        levelChords.splice(destination.index, 0, movedItem);

        // Update the order of the items in the specific level
        // Update the grouped chords with the new level arrangement
        groupedChords[sourceLevelName] = levelChords.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        // Flatten the grouped chords back to a single array
        const flattenedUpdatedChords = Object.values(groupedChords).flat();

        // Update state with the new list
        setChordsList(flattenedUpdatedChords);

        // Update the order in the database for the specific level
        axios
            .post('/admin/update-chord-order', { chords: flattenedUpdatedChords })
            .then((response) => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch((error) => {
                setErrorMessage("Échec de la mise à jour de l'ordre");
                setSuccessMessage('');
            });
    };

    const submitModifications = (e) => {
        e.preventDefault();
        updateLastActionTime();

        patch(route('admin.update-chord'), {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                setSuccessMessage('Accord modifié avec succès');
                setErrorMessage('');
                axios.get(route('allChords'))
                    .then((response) => {
                        // Sort the chordsList by order
                        const sortedChords = response.data.sort((a, b) => a.order - b.order);
                        setChordsList(sortedChords);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            },
            onError: () => {
                setErrorMessage("Échec de la modification");
                setSuccessMessage('');
            }
        });
    };

    const handleDelete = (id) => {
        updateLastActionTime();
        axios.delete(`/chords/${id}`)
            .then(response => {
                setIsDeleteModalOpen(false);
                setSuccessMessage(response.data.message || "Formule / Accord supprimé avec succès");
                setErrorMessage('');
                axios.get(route('allChords'))
                    .then((response) => {
                        // Sort the chordsList by order
                        const sortedChords = response.data.sort((a, b) => a.order - b.order);
                        setChordsList(sortedChords);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch(error => {
                setErrorMessage("Échec de la suppression");
                setSuccessMessage('');
            });
    };

    const groupAndSortChords = (chords) => {
        // Group chords by level
        const groupedChords = chords.reduce((groups, chord) => {
            const level = chord.level.name; // You can use level.id instead if needed
            if (!groups[level]) {
                groups[level] = [];
            }
            groups[level].push(chord);
            return groups;
        }, {});

        // Sort each group by order
        Object.keys(groupedChords).forEach(level => {
            groupedChords[level].sort((a, b) => a.order - b.order);
        });

        return groupedChords;
    };

    const filteredChords = chordsList.filter(chord => {
        // If a level filter is selected, only include chords from that level
        if (selectedFilterLevel) {
            return chord.level.id.toString() === selectedFilterLevel.toString();
        }
        return true; // Otherwise, include all chords
    });

    const groupedChords = groupAndSortChords(filteredChords);

    return (
        <section className={className}>
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Modifier un accord</h2>

                <button
                    className="text-white"
                    onClick={() => setFilterDisplay(!filterDisplay)}
                >
                    <img
                        src={window.matchMedia('(prefers-color-scheme: dark)').matches ? settingsWhiteIcon : settingsIcon}
                        alt="Settings"
                        className="h-7 w-7"
                    />
                </button>
            </header>

            <Transition
                show={filterDisplay}
                enter="transition duration-300 ease-out"
                enterFrom="transform scale-y-0 opacity-0"
                enterTo="transform scale-y-100 opacity-100"
                leave="transition duration-300 ease-in"
                leaveFrom="transform scale-y-100 opacity-100"
                leaveTo="transform scale-y-0 opacity-0"
            >
                <div className="origin-top mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="level" value="Niveau" className="dark:text-white" />
                        <select
                            id="level"
                            className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                            value={selectedFilterLevel}
                            onChange={(e) => setSelectedFilterLevel(e.target.value)}
                        >
                            <option value="">
                                Choisir un niveau
                            </option>
                            {levelsList.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Transition>

            <MessageDisplay successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <Modal show={isDeleteModalOpen} close={() => setIsDeleteModalOpen(false)}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supprimer un accord</h2>

                    <p className="text-gray-800 dark:text-gray-200">
                        Êtes-vous sûr de vouloir supprimer l'accord <span className="font-semibold">{currentChord.current?.chord_name}</span> du
                        niveau <span className="font-semibold">{currentChord.current?.level.name}</span> ?
                    </p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            type="button"
                        >
                            Annuler
                        </button>

                        <DangerButton disabled={processing} onClick={() => handleDelete(currentChord.current?.id)}>
                            Supprimer
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={isEditModalOpen} close={() => setIsEditModalOpen(false)}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modifier un accord</h2>

                    <form onSubmit={submitModifications} className={`processing ? 'opacity-50' : '' space-y-2`}>
                        <div className="max-h-96 overflow-y-auto hide-scrollbar">
                            <div>
                                <InputLabel htmlFor="level" value="Niveau" className="dark:text-white"/>
                                <select
                                    id="level"
                                    className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.level}
                                    onChange={(e) => setData('level', e.target.value)}
                                >
                                    <option value={currentChord.current?.level?.id || ''}>
                                        {levelsList.find(level => level.id === parseInt(currentChord.current?.level?.id))?.name || 'Sélectionner un niveau'}
                                    </option>
                                    {levelsList.filter(level => level.id !== parseInt(currentChord.current?.level?.id)).map((level) => (
                                        <option key={level.id} value={level.id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="chord_name" value="Nom de l'accord" className="dark:text-white"/>
                                <TextInput
                                    id="chord_name"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.chord_name}
                                    onChange={(e) => setData('chord_name', e.target.value)}
                                    isFocused
                                    autoComplete="chord_name"
                                />
                            </div>

                            <div className="flex justify-start mt-4">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    type="button"
                                >
                                    Annuler
                                </button>

                                <PrimaryButton disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-600">
                                    Sauvegarder
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mt-6 space-y-6">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="w-full max-h-[600px] overflow-y-auto mt-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                        {Object.entries(groupedChords).map(([levelName, levelChords]) => (
                            <div key={levelName}>
                                {/* Level Header */}
                                <h3 className="w-fit text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2 ml-1">
                                    Niveau: {levelName}
                                </h3>
                                <Droppable droppableId={`level-${levelName}`}>
                                    {(provided) => (
                                        <ul
                                            className="w-full divide-y divide-gray-300 dark:divide-neutral-700"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {levelChords.map((chord, index) => (
                                                <Draggable
                                                    key={chord.id}
                                                    draggableId={chord.id.toString()}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <li
                                                            className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-3 bg-white dark:bg-gray-800 space-y-2 sm:space-y-0 sm:space-x-4"
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {/* Number Column */}
                                                            <span
                                                                className="w-9 font-medium text-gray-700 dark:text-gray-200">
                                                                {index + 1}
                                                            </span>
                                                            {/* Info Columns */}
                                                            <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-y-2 sm:gap-y-0 sm:gap-x-6">
                                                                <span className="w-full sm:w-12 truncate font-semibold text-gray-900 dark:text-gray-100">
                                                                    {chord.level.name}
                                                                </span>
                                                                <span className="truncate text-gray-800 dark:text-gray-300">
                                                                    {chord.chord_name} &nbsp;&nbsp;
                                                                </span>
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(chord)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    onClick={() => openDeleteModal(chord)}
                                                                    className="text-red-500 hover:underline"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </section>
    );
}
