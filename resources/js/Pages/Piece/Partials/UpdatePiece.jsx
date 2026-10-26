import React, { useEffect, useRef, useState, useMemo } from 'react';
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import axios from "axios";
import {useForm} from '@inertiajs/react';
import { AdminDialog, AdminField, AdminInput, EmptyState, SectionCard, Toast, buttonDanger, buttonPrimary, buttonSecondary, control, iconButtonDanger, muted } from '@/Components/AdminUi';
import { GripVerticalIcon, PencilIcon, TrashIcon } from '@/Components/AppIcons';

export default function UpdatePiece({ className = '', piecesList, setPiecesList, courseName }) {
    const [levelsList, setLevelsList] = useState([]);
    const [levelsModifyOptions, setLevelsModifyOptions] = useState([]);
    const [selectedFilterLevel, setSelectedFilterLevel] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const currentPiece = useRef(piecesList[0] || null);
    const [modules, setModules] = useState([]);
    const [isLitMusCourse, setIsLitMusCourse] = useState(false);
    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        id: '',
        course: '',
        level: '',
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: '',
        file_name: '',
        module_id: '',
        courseName: courseName,
    });

    const fieldConfigs = useMemo(() => {
        const isHistoireDeLaMusique = courseName === 'Histoire de la Musique';

        if (isHistoireDeLaMusique) {
            return [
                { key: 'title', label: 'Titre', dbField: 'title' },
                { key: 'composer', label: 'Compositeur', dbField: 'composer' },
                { key: 'element', label: 'Répertoire', dbField: 'element' },
                { key: 'period', label: 'Date (siècle)', dbField: 'period' },
                { key: 'genre', label: 'Genre', dbField: 'genre' },
                { key: 'form', label: 'Option', dbField: 'form' }
            ];
        } else {
            // Littérature Musicale
            return [
                { key: 'period', label: 'Période', dbField: 'period' },
                { key: 'genre', label: 'Genre', dbField: 'genre' },
                { key: 'composer', label: 'Compositeur', dbField: 'composer' },
                { key: 'title', label: 'Titre', dbField: 'title' },
                { key: 'element', label: 'Élément', dbField: 'element' },
                { key: 'no_mvt', label: 'No. mouvement', dbField: 'no_mvt' },
                { key: 'mvt', label: 'Mouvement / Partie', dbField: 'mvt' },
                { key: 'form', label: 'Forme', dbField: 'form' }
            ];
        }
    }, [courseName]);

    const openDeleteModal = (piece) => {
        currentPiece.current = piece;
        setIsDeleteModalOpen(true);
    }

    const openEditModal = (piece) => {
        currentPiece.current = piece;
        setData({
            id: piece.id || '',
            course: piece.level.course.id || '',
            level: piece.level.id || '',
            period: piece.period || '',
            genre: piece.genre || '',
            composer: piece.composer || '',
            title: piece.title || '',
            element: piece.element || '',
            no_mvt: piece.no_mvt || '',
            mvt: piece.mvt || '',
            form: piece.form || '',
            file_name: piece.file_name || '',
            module_id: piece.module_id || '',
            courseName: courseName,
        })
        setIsLitMusCourse(courseName === 'Littérature Musicale');

        // If it's a LitMus course, fetch modules for the level
        if (courseName === 'Littérature Musicale' && piece.level.id) {
            fetchModules(piece.level.id);
        }

        setIsEditModalOpen(true);
    };

    useEffect(() => {
        axios.get(route('levelsFromCourse'), {
            params: {
                course_name: courseName,
            }
        }).then(response => {
            setLevelsList(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        axios.get(route('levelsFromCourse'), {
            params: {
                course_name: courseName,
            }
        }).then(response => {
            setLevelsModifyOptions(response.data);
        }).catch(error => {
            console.log(error);
        });
        setIsLitMusCourse(courseName === 'Littérature Musicale');

        // Reset module_id if not a LitMus course
        if (courseName !== 'Littérature Musicale') {
            setData('module_id', '');
            setModules([]);
        }
    }, []);

    useEffect(() => {
        if (isLitMusCourse && data.level) {
            fetchModules(data.level);
        } else {
            setModules([]);
            if (!isLitMusCourse) {
                setData('module_id', '');
            }
        }
    }, [data.level, isLitMusCourse]);

    const fetchModules = (levelId) => {
        axios.get(`/api/modules/level/${levelId}`)
            .then(response => {
                setModules(response.data);
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
            });
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        // Extract the level from the droppableId (e.g., 'level-LevelName')
        const sourceLevelName = source.droppableId.split('-')[1];
        const destinationLevelName = destination.droppableId.split('-')[1];

        // Ensure the source and destination levels are the same
        if (sourceLevelName !== destinationLevelName) return;

        // Clone the list of pieces
        const updatedPiecesList = [...piecesList];

        // Group pieces by level
        const groupedPieces = groupAndSortPieces(updatedPiecesList);

        // Get the array of pieces for the specific level
        const levelPieces = groupedPieces[sourceLevelName];

        // Rearrange items only within the specific level
        const [movedItem] = levelPieces.splice(source.index, 1);
        levelPieces.splice(destination.index, 0, movedItem);

        // Update the order of the items in the specific level
        // Update the grouped pieces with the new level arrangement
        groupedPieces[sourceLevelName] = levelPieces.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        // Flatten the grouped pieces back to a single array
        const flattenedUpdatedPieces = Object.values(groupedPieces).flat();

        // Update the order in the database for the specific level
        axios
            .post('/admin/update-order', { pieces: flattenedUpdatedPieces, courseName: courseName })
            .then((response) => {
                setPiecesList(flattenedUpdatedPieces);
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

        patch(route('admin.update-piece'), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Pièce modifiée avec succès');
                setErrorMessage('');
                axios.get(route('allPieces'))
                    .then((response) => {
                        // Sort the piecesList by order
                        const sortedPieces = response.data.sort((a, b) => a.order - b.order);

                        setPiecesList(sortedPieces);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            },
            onError: (errors) => {
                setErrorMessage(errors.error || 'Échec de la modification de la pièce');
                setSuccessMessage('');
            },
            onFinish: () => {
                reset();
                setIsEditModalOpen(false);
            }
        });
    };

    const handleDelete = (id) => {
        // axios.post(`/pieces/${id}/move-to-reserve`)
        axios.post(`/delete-piece/${id}`, courseName)
            .then(response => {
                setIsDeleteModalOpen(false);
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                // getPiecesInReserve();
                axios.get(route('allPieces'))
                    .then((response) => {
                        // Sort the piecesList by order
                        const sortedPieces = response.data.sort((a, b) => a.order - b.order);
                        setPiecesList(sortedPieces);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch(error => {
                setIsDeleteModalOpen(false);
                setErrorMessage(error.response.data.error || 'Échec de la suppression de la pièce');
                setSuccessMessage('');
            });
    };

    const groupAndSortPieces = (pieces) => {
        // Group pieces by level
        const groupedPieces = pieces.reduce((groups, piece) => {
            const level = piece.level.name;
            if (!groups[level]) {
                groups[level] = [];
            }
            groups[level].push(piece);
            return groups;
        }, {});

        // Sort each group by order
        Object.keys(groupedPieces).forEach(level => {
            groupedPieces[level].sort((a, b) => a.order - b.order);
        });

        return groupedPieces;
    };

    const filteredPieces = piecesList.filter(piece => {
        // If a level filter is selected, only include pieces from that level
        if (selectedFilterLevel) {
            return piece.level.id.toString() === selectedFilterLevel.toString();
        }
        return true;
    });

    const groupedPieces = groupAndSortPieces(filteredPieces);

    const levelEntries = Object.entries(groupedPieces);

    return (
        <SectionCard
            id="pieces-title"
            title="Modifier une pièce"
            description={`${filteredPieces.length} pièce${filteredPieces.length > 1 ? 's' : ''} · Glissez une pièce pour changer son ordre dans le niveau`}
            className={className}
            action={
                <div className="w-full sm:w-56">
                    <label htmlFor="pieces-level-filter" className="sr-only">Filtrer par niveau</label>
                    <select
                        id="pieces-level-filter"
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
            <Toast successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <AdminDialog
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Retirer une pièce"
                actions={<>
                    <button type="button" onClick={() => setIsDeleteModalOpen(false)} className={buttonSecondary}>Annuler</button>
                    <button type="button" disabled={processing} onClick={() => handleDelete(currentPiece.current?.id)} className={buttonDanger}>Retirer</button>
                </>}
            >
                <p>
                    Êtes-vous sûr de vouloir retirer la pièce <strong className="text-gray-900 dark:text-white">{currentPiece.current?.title}</strong>
                    &nbsp;de <strong className="text-gray-900 dark:text-white">{currentPiece.current?.composer}</strong> du
                    niveau <strong className="text-gray-900 dark:text-white">{currentPiece.current?.level.name}</strong> ?
                </p>
            </AdminDialog>

            <AdminDialog
                wide
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Modifier une pièce"
                actions={<>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="edit-piece-form" disabled={processing} className={buttonPrimary}>Sauvegarder</button>
                </>}
            >
                <form id="edit-piece-form" onSubmit={submitModifications} className="-mx-1 max-h-[60vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 pb-1 sm:grid-cols-2">
                        <AdminField id="edit-piece-level" label="Niveau">
                            <select
                                id="edit-piece-level"
                                className={`${control} w-full`}
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                            >
                                <option value={currentPiece.current?.level?.id || ''}>
                                    {levelsModifyOptions.find(level => level.id === parseInt(currentPiece.current?.level?.id))?.name || 'Sélectionner un niveau'}
                                </option>
                                {levelsModifyOptions.filter(level => level.id !== parseInt(currentPiece.current?.level?.id)).map((level) => (
                                    <option key={level.id} value={level.id}>{level.name}</option>
                                ))}
                            </select>
                        </AdminField>

                        {/* Add module selection for LitMus courses */}
                        {isLitMusCourse && (
                            <AdminField id="edit-piece-module" label="Module (optionnel)">
                                <select
                                    id="edit-piece-module"
                                    className={`${control} w-full`}
                                    value={data.module_id || ''}
                                    onChange={(e) => setData('module_id', e.target.value)}
                                >
                                    <option value="">Aucun module</option>
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.title}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                        )}

                        {/* Render fields in the order specified by fieldConfigs */}
                        {fieldConfigs.map((field) => (
                            <AdminField key={field.key} id={`edit-piece-${field.key}`} label={field.label}>
                                <AdminInput
                                    id={`edit-piece-${field.key}`}
                                    value={data[field.key]}
                                    onChange={(e) => setData(field.key, e.target.value)}
                                />
                            </AdminField>
                        ))}

                        <div className="sm:col-span-2">
                            <AdminField id="edit-piece-file-name" label="Nom du fichier audio">
                                <AdminInput
                                    id="edit-piece-file-name"
                                    className="font-mono disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                                    value={data.file_name}
                                    readOnly
                                    disabled
                                />
                            </AdminField>
                        </div>
                    </div>
                </form>
            </AdminDialog>

            {levelEntries.length === 0 ? (
                <EmptyState>Aucune pièce pour le moment.</EmptyState>
            ) : (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="max-h-[640px] overflow-y-auto">
                        {levelEntries.map(([levelName, levelPieces]) => (
                            <div key={levelName}>
                                {/* Level Header */}
                                <h3 className="sticky top-0 z-10 flex items-baseline gap-2 border-y border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                    Niveau {levelName}
                                    <span className={`font-normal ${muted}`}>{levelPieces.length}</span>
                                </h3>
                                <Droppable droppableId={`level-${levelName}`}>
                                    {(provided) => (
                                        <ul
                                            className="divide-y divide-gray-100 dark:divide-gray-700/70"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {levelPieces.map((piece, index) => (
                                                <Draggable
                                                    key={piece.id}
                                                    draggableId={piece.id.toString()}
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
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-gray-900 dark:text-white">{piece.title}</p>
                                                                <p className={`truncate text-sm ${muted}`}>
                                                                    {[
                                                                        piece.composer,
                                                                        piece.no_mvt && `Mvt: ${piece.no_mvt}`,
                                                                        piece.mvt,
                                                                    ].filter(Boolean).join(' · ')}
                                                                </p>
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex shrink-0 items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(piece)}
                                                                    aria-label={`Modifier ${piece.title}`}
                                                                    title="Modifier"
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                                                >
                                                                    <PencilIcon className="h-4 w-4"/>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDeleteModal(piece)}
                                                                    aria-label={`Retirer ${piece.title}`}
                                                                    title="Retirer"
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
