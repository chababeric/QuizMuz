import React, { useRef, useState, useEffect } from 'react';
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import axios from "axios";
import {useForm} from '@inertiajs/react';
import { AdminDialog, AdminField, AdminInput, EmptyState, SectionCard, Toast, buttonDanger, buttonPrimary, buttonSecondary, control, iconButtonDanger, muted } from '@/Components/AdminUi';
import { GripVerticalIcon, PencilIcon, TrashIcon } from '@/Components/AppIcons';

export default function UpdateChord({ className = '', chordsList, setChordsList, levelsList }) {
    const [selectedFilterLevel, setSelectedFilterLevel] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modules, setModules] = useState([]);
    const [selectedEditLevel, setSelectedEditLevel] = useState('');

    const currentChord = useRef(chordsList[0] || null);
    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        id: '',
        level: '',
        module: '',
        chord_name: '',
    });

    // Fetch modules when edit level changes
    useEffect(() => {
        if (selectedEditLevel) {
            axios.get(`/api/modules/level/${selectedEditLevel}`)
                .then(response => {
                    setModules(response.data);
                })
                .catch(error => {
                    console.error('Error fetching modules:', error);
                    setModules([]);
                });
        } else {
            setModules([]);
        }
    }, [selectedEditLevel]);

    const openDeleteModal = (chord) => {
        currentChord.current = chord;
        setIsDeleteModalOpen(true);
    }

    const openEditModal = (chord) => {
        currentChord.current = chord;
        setData({
            id: chord.id || '',
            level: chord.level.id || '',
            module: chord.module_id || '',
            chord_name: chord.chord_name || '',
        });
        setSelectedEditLevel(chord.level.id || '');
        setIsEditModalOpen(true);
    };

    const handleEditLevelChange = (e) => {
        const levelValue = e.target.value;
        setData('level', levelValue);
        setSelectedEditLevel(levelValue);
        // Reset module selection when level changes
        setData('module', '');
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

        // Update the order in the database for the specific level
        axios
            .post('/admin/update-chord-order', { chords: flattenedUpdatedChords })
            .then((response) => {
                setChordsList(flattenedUpdatedChords);
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch((error) => {
                setErrorMessage(error.response.data.error);
                setSuccessMessage('');
            });
    };

    const submitModifications = (e) => {
        e.preventDefault();

        patch(route('admin.update-chord'), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Formule modifiée avec succès');
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
            onError: (errors) => {
                // setErrorMessage(errors.error || "Échec de la modification de l'accord");
                setSuccessMessage('');
            },
            onFinish: () => {
                setIsEditModalOpen(false);
                setSelectedEditLevel('');
                setModules([]);
                reset();
            }
        });
    };

    const handleDelete = (id) => {
        axios.post(`/chords/${id}`)
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
                setIsDeleteModalOpen(false);
                setErrorMessage(error.response?.data?.error || "Échec de la suppression de l'accord");
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

    const levelEntries = Object.entries(groupedChords);

    return (
        <SectionCard
            id="chords-title"
            title="Modifier un accord"
            description={`${filteredChords.length} accord${filteredChords.length > 1 ? 's' : ''} · Glissez un accord pour changer son ordre dans le niveau`}
            className={className}
            action={
                <div className="w-full sm:w-56">
                    <label htmlFor="chords-level-filter" className="sr-only">Filtrer par niveau</label>
                    <select
                        id="chords-level-filter"
                        className={`${control} w-full`}
                        value={selectedFilterLevel}
                        onChange={(e) => setSelectedFilterLevel(e.target.value)}
                    >
                        <option value="">Tous les niveaux</option>
                        {levelsList.map((level) => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <Toast successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <AdminDialog
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Supprimer un accord"
                actions={<>
                    <button type="button" onClick={() => setIsDeleteModalOpen(false)} className={buttonSecondary}>Annuler</button>
                    <button type="button" disabled={processing} onClick={() => handleDelete(currentChord.current?.id)} className={buttonDanger}>Supprimer</button>
                </>}
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer l'accord <strong className="text-gray-900 dark:text-white">{currentChord.current?.chord_name}</strong> du
                    niveau <strong className="text-gray-900 dark:text-white">{currentChord.current?.level.name}</strong> ?
                </p>
            </AdminDialog>

            <AdminDialog
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Modifier un accord"
                actions={<>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="edit-chord-form" disabled={processing} className={buttonPrimary}>Sauvegarder</button>
                </>}
            >
                <form id="edit-chord-form" onSubmit={submitModifications} className="flex flex-col gap-4">
                    <AdminField id="edit-chord-level" label="Niveau">
                        <select
                            id="edit-chord-level"
                            className={`${control} w-full`}
                            value={data.level}
                            onChange={handleEditLevelChange}
                        >
                            <option value={currentChord.current?.level?.id || ''}>
                                {levelsList.find(level => level.id === parseInt(currentChord.current?.level?.id))?.name || 'Sélectionner un niveau'}
                            </option>
                            {levelsList.filter(level => level.id !== parseInt(currentChord.current?.level?.id)).map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </AdminField>

                    <AdminField
                        id="edit-chord-module"
                        label="Module (optionnel)"
                        hint={selectedEditLevel && modules.length === 0 ? 'Aucun module disponible pour ce niveau' : null}
                    >
                        <select
                            id="edit-chord-module"
                            className={`${control} w-full`}
                            value={data.module}
                            onChange={(e) => setData('module', e.target.value)}
                            disabled={!selectedEditLevel || modules.length === 0}
                        >
                            <option value="">Aucun module</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id}>{module.title}</option>
                            ))}
                        </select>
                    </AdminField>

                    <AdminField id="edit-chord-name" label="Nom de l'accord">
                        <AdminInput
                            id="edit-chord-name"
                            value={data.chord_name}
                            onChange={(e) => setData('chord_name', e.target.value)}
                            autoFocus
                            autoComplete="off"
                        />
                    </AdminField>
                </form>
            </AdminDialog>

            {levelEntries.length === 0 ? (
                <EmptyState>Aucun accord pour le moment.</EmptyState>
            ) : (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="max-h-[640px] overflow-y-auto">
                        {levelEntries.map(([levelName, levelChords]) => (
                            <div key={levelName}>
                                {/* Level Header */}
                                <h3 className="sticky top-0 z-10 flex items-baseline gap-2 border-y border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                    Niveau {levelName}
                                    <span className={`font-normal ${muted}`}>{levelChords.length}</span>
                                </h3>
                                <Droppable droppableId={`level-${levelName}`}>
                                    {(provided) => (
                                        <ul
                                            className="divide-y divide-gray-100 dark:divide-gray-700/70"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {levelChords.map((chord, index) => (
                                                <Draggable
                                                    key={chord.id}
                                                    draggableId={chord.id.toString()}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <li
                                                            className={`flex items-center gap-3 px-5 py-2.5 ${
                                                                snapshot.isDragging ? 'rounded-xl bg-white shadow-lg ring-1 ring-[#B4283F] dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
                                                            }`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <GripVerticalIcon className={`h-4 w-4 cursor-grab ${muted}`}/>
                                                            {/* Number Column */}
                                                            <span className={`w-7 shrink-0 text-right text-sm tabular-nums ${muted}`}>
                                                                {index + 1}
                                                            </span>
                                                            {/* Info Columns */}
                                                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                                                                <span className="truncate font-medium text-gray-900 dark:text-white">{chord.chord_name}</span>
                                                                {/* Display module if exists */}
                                                                {chord.module && (
                                                                    <span className="max-w-full truncate rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-200">
                                                                        Module: {chord.module.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex shrink-0 items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(chord)}
                                                                    aria-label={`Modifier ${chord.chord_name}`}
                                                                    title="Modifier"
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                                                >
                                                                    <PencilIcon className="h-4 w-4"/>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDeleteModal(chord)}
                                                                    aria-label={`Supprimer ${chord.chord_name}`}
                                                                    title="Supprimer"
                                                                    className={iconButtonDanger}
                                                                >
                                                                    <TrashIcon className="h-4 w-4"/>
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
            )}
        </SectionCard>
    );
}
