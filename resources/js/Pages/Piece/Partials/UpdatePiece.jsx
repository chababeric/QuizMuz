import React, { useEffect, useState } from 'react';
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import InputLabel from "@/Components/InputLabel.jsx";
import settingsIcon from '../../../../icons/settings-black.svg';
import settingsWhiteIcon from '../../../../icons/settings.svg';
import Modal from "@/Components/Modal.jsx";
import axios from "axios";
import TextInput from "@/Components/TextInput.jsx";
import { useForm } from '@inertiajs/react';

export default function UpdatePiece({ className = '', piecesList, setPiecesList, coursesList }) {
    const [levelsList, setLevelsList] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [filterDisplay, setFilterDisplay] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        course: '',
        level: '',
        period: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: '',
        fileName: '',
    });

    const openModal = (piece) => {
        setIsEditModalOpen(true);
    }

    useEffect(() => {
        if (selectedCourse) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: selectedCourse,
                }
            }).then(response => {
                setLevelsList(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsList([]);
        }
    }, [selectedCourse]);

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(piecesList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the state with the new order
        const updatedItems = items.map((item, index) => ({...item, order: index + 1}));
        setPiecesList(updatedItems);

        // Update the order in the database
        axios.post('/admin/update-order', { pieces: updatedItems })
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setErrorMessage('Échec de la mise à jour de l\'ordre');
                setSuccessMessage('');
            });
    };

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

            {filterDisplay && (
                <div className="mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="course" value="Cours" className="dark:text-white"/>
                        <select
                            id="course"
                            className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Choisir un cours</option>
                            {coursesList.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="level" value="Niveau" className="dark:text-white"/>
                        <select
                            id="level"
                            className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="">Choisir un niveau</option>
                            {levelsList.map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <MessageDisplay successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <Modal show={isEditModalOpen} close={() => setIsEditModalOpen(false)}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modifier une pièce</h2>
                    <InputLabel htmlFor="course" value="Cours" className="dark:text-white"/>
                    <select
                        id="course"
                        className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                        value={data.course}
                        onChange={(e) => setData('course', e.target.value)}
                    >
                        <option value="">Choisir un cours</option>
                        {coursesList.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>

                    <InputLabel htmlFor="level" value="Niveau" className="dark:text-white"/>
                    <select
                        id="level"
                        className="mt-1 block w-full rounded-md dark:text-white dark:bg-gray-800"
                        value={data.level}
                        onChange={(e) => setData('level', e.target.value)}
                    >
                        <option value="">Choisir un niveau</option>
                        {levelsList.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>


                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="mt-6 space-y-6">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    {/* Parent scrollable container */}
                    <div className="w-full max-h-[600px] overflow-y-auto mt-4 bg-gray-50 dark:bg-gray-900">
                        <Droppable droppableId="pieces">
                            {(provided) => (
                                <ul
                                    className="w-full divide-y divide-gray-300 dark:divide-neutral-700"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {piecesList.map((piece, index) => (
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
                                                    {/* Number column */}
                                                    <span
                                                        className="w-9 font-medium text-gray-700 dark:text-gray-200">
                                                        {index + 1}
                                                    </span>
                                                    {/* Info columns */}
                                                    <div
                                                        className="flex-1 flex flex-wrap sm:flex-nowrap gap-y-2 sm:gap-y-0 sm:gap-x-6">
                                                        <span
                                                            className="w-full sm:w-12 truncate font-semibold text-gray-900 dark:text-gray-100">
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
                                                            onClick={() => openModal(piece)}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(piece.id)}
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
                </DragDropContext>
            </div>
        </section>
    );
}
