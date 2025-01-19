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

export default function UpdatePiece({ className = '', piecesList, setPiecesList, coursesList, updateLastActionTime, getPiecesInReserve }) {
    const [levelsList, setLevelsList] = useState([]);
    const [levelsModifyOptions, setLevelsModifyOptions] = useState([]);
    const [selectedFilterCourse, setSelectedFilterCourse] = useState('');
    const [selectedFilterLevel, setSelectedFilterLevel] = useState('');
    const [filterDisplay, setFilterDisplay] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const currentPiece = useRef(piecesList[0] || null);
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
    });

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
        })
        setIsEditModalOpen(true);
    };

    useEffect(() => {
        if (selectedFilterCourse) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: selectedFilterCourse,
                }
            }).then(response => {
                setLevelsList(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsList([]);
        }
    }, [selectedFilterCourse]);

    useEffect(() => {
        if (data.course) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: data.course,
                }
            }).then(response => {
                setLevelsModifyOptions(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsModifyOptions([]);
        }
    }, [data.course]);

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

        // Update state with the new list
        setPiecesList(flattenedUpdatedPieces);

        // Update the order in the database for the specific level
        axios
            .post('/admin/update-order', { pieces: flattenedUpdatedPieces })
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

        patch(route('admin.update-piece'), {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
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
            onError: () => {
                setErrorMessage('Échec de la modification de la pièce');
                setSuccessMessage('');
            }
        });
    };

    const handleDelete = (id) => {
        updateLastActionTime();
        axios.post(`/pieces/${id}/move-to-reserve`)
            .then(response => {
                setIsDeleteModalOpen(false);
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                getPiecesInReserve();
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
                setErrorMessage('Échec de la suppression de la pièce');
                setSuccessMessage('');
            });
    };

    const groupAndSortPieces = (pieces) => {
        // Group pieces by level
        const groupedPieces = pieces.reduce((groups, piece) => {
            const level = piece.level.name; // You can use level.id instead if needed
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
        return true; // Otherwise, include all pieces
    });

    const groupedPieces = groupAndSortPieces(filteredPieces);

    return (
        <section className={className}>
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Modifier une pièce</h2>

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
                        <InputLabel htmlFor="course" value="Cours" className="dark:text-white" />
                        <select
                            id="course"
                            className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                            value={selectedFilterCourse}
                            onChange={(e) => setSelectedFilterCourse(e.target.value)}
                        >
                            <option value="">Choisir un cours</option>
                            {coursesList.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="level" value="Niveau" className="dark:text-white" />
                        <select
                            id="level"
                            className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                            value={selectedFilterLevel}
                            onChange={(e) => setSelectedFilterLevel(e.target.value)}
                        >
                            <option value="">
                                Choisir un niveau {!selectedFilterCourse && "-- choisissez un cours pour voir les niveaux"}
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Retirer une pièce</h2>

                    <p className="text-gray-800 dark:text-gray-200">
                        Êtes-vous sûr de vouloir retirer la pièce <span className="font-semibold">{currentPiece.current?.title}</span>
                        &nbsp;de <span className="font-semibold">{currentPiece.current?.composer}</span> du
                        niveau <span className="font-semibold">{currentPiece.current?.level.name}</span> ?
                    </p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            type="button"
                        >
                            Annuler
                        </button>

                        <DangerButton disabled={processing} onClick={() => handleDelete(currentPiece.current?.id)}>
                            Retirer
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={isEditModalOpen} close={() => setIsEditModalOpen(false)}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modifier une pièce</h2>

                    <form onSubmit={submitModifications} className={`processing ? 'opacity-50' : '' space-y-2`}>
                        <div className="max-h-96 overflow-y-auto hide-scrollbar">
                            <div>
                                <InputLabel htmlFor="course" value="Cours" className="dark:text-white"/>
                                <select
                                    id="course"
                                    className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.course}
                                    onChange={(e) => setData('course', e.target.value)}
                                >
                                    <option value={currentPiece.current?.level?.course?.id || ''}>
                                        {coursesList.find(course => course.id === parseInt(currentPiece.current?.level?.course?.id))?.name || 'Sélectionner un cours'}
                                    </option>
                                    {coursesList.filter(course => course.id !== parseInt(currentPiece.current?.level?.course?.id)).map((course) => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="level" value="Niveau" className="dark:text-white"/>
                                <select
                                    id="level"
                                    className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
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
                            </div>

                            <div>
                                <InputLabel htmlFor="period" value="Période" className="dark:text-white"/>
                                <TextInput
                                    id="period"
                                    type="text"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.period}
                                    onChange={(e) => setData('period', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="genre" value="Genre" className="dark:text-white"/>
                                <TextInput
                                    id="genre"
                                    type="text"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.genre}
                                    onChange={(e) => setData('genre', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="composer" value="Compositeur" className="dark:text-white"/>
                                <TextInput
                                    id="composer"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.composer}
                                    onChange={(e) => setData('composer', e.target.value)}
                                    isFocused
                                    autoComplete="composer"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="title" value="Titre" className="dark:text-white"/>
                                <TextInput
                                    id="title"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    autoComplete="title"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="element" value="Élément" className="dark:text-white"/>
                                <TextInput
                                    id="element"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.element}
                                    onChange={(e) => setData('element', e.target.value)}
                                    autoComplete="element"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="no_mvt" value="No. Mouvement" className="dark:text-white"/>
                                <TextInput
                                    id="no_mvt"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.no_mvt}
                                    onChange={(e) => setData('no_mvt', e.target.value)}
                                    autoComplete="no_mvt"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="mvt" value="Mouvement / Partie" className="dark:text-white"/>
                                <TextInput
                                    id="mvt"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.mvt}
                                    onChange={(e) => setData('mvt', e.target.value)}
                                    autoComplete="mvt"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="form" value="Forme" className="dark:text-white"/>
                                <TextInput
                                    id="form"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.form}
                                    onChange={(e) => setData('form', e.target.value)}
                                    autoComplete="form"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="file_name" value="Nom du fichier audio" className="dark:text-white"/>
                                <TextInput
                                    id="file_name"
                                    className="mt-1 block border border-black w-full rounded-md dark:text-white dark:bg-gray-800"
                                    value={data.file_name}
                                    onChange={(e) => setData('file_name', e.target.value)}
                                    autoComplete="file_name"
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
                        {Object.entries(groupedPieces).map(([levelName, levelPieces]) => (
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
                                            {levelPieces.map((piece, index) => (
                                                <Draggable
                                                    key={piece.id}
                                                    draggableId={piece.id.toString()}
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
                                                                    {piece.level.name}
                                                                </span>
                                                                <span className="truncate text-gray-800 dark:text-gray-300">
                                                                    {piece.title} &nbsp;&nbsp;
                                                                </span>
                                                                <span className="truncate text-gray-600 dark:text-gray-400">
                                                                    {piece.composer} &nbsp;&nbsp;
                                                                </span>
                                                                {piece.no_mvt && (
                                                                    <span className="truncate text-gray-500 dark:text-gray-400">
                                                                        Mvt: {piece.no_mvt} &nbsp;&nbsp;
                                                                    </span>
                                                                )}
                                                                {piece.mvt && (
                                                                    <span className="truncate text-gray-500 dark:text-gray-400">
                                                                        {piece.mvt}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(piece)}
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    onClick={() => openDeleteModal(piece)}
                                                                    className="text-red-500 hover:underline"
                                                                >
                                                                    Retirer
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
