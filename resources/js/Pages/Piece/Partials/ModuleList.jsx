import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

export default function ModuleList({ className = '', coursesList, updateLastActionTime }) {
    const [levels, setLevels] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        // Get levels for the selected course
        if (selectedCourse) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: selectedCourse,
                }
            })
                .then(response => {
                    setLevels(response.data);
                    setSelectedLevel('');
                    setModules([]);
                })
                .catch(error => {
                    console.error('Error fetching levels:', error);
                });
        } else {
            setLevels([]);
            setSelectedLevel('');
            setModules([]);
        }
    }, [selectedCourse]);

    useEffect(() => {
        // Get modules for selected level
        if (selectedLevel) {
            fetchModules(selectedLevel);
        } else {
            setModules([]);
        }
    }, [selectedLevel]);

    const fetchModules = (levelId) => {
        setLoading(true);
        axios.get(`/api/modules/level/${levelId}`)
            .then(response => {
                setModules(response.data);
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
                setErrorMessage('Erreur lors du chargement des modules');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCourseChange = (e) => {
        setSelectedCourse(e.target.value);
    };

    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
    };

    const handleDeleteClick = (moduleId) => {
        setConfirmDelete(moduleId);
    };

    const handleDeleteConfirm = () => {
        if (!confirmDelete) return;

        setLoading(true);
        updateLastActionTime();

        axios.post(route('admin.delete-module'), { id: confirmDelete })
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                fetchModules(selectedLevel);
                setConfirmDelete(null);
            })
            .catch(error => {
                console.error('Error deleting module:', error);
                setErrorMessage('Erreur lors de la suppression du module');
                setSuccessMessage('');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;

        // If dropped outside the list or no change
        if (!destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)) {
            return;
        }

        // Reorder modules
        const reordered = Array.from(modules);
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);

        // Update the order property
        const updatedModules = reordered.map((module, index) => ({
            ...module,
            order: index + 1
        }));

        // Update state optimistically
        setModules(updatedModules);

        // Save to server
        updateLastActionTime();
        axios.post(route('admin.update-module-order'), {
            modules: updatedModules.map(module => ({
                id: module.id,
                order: module.order
            }))
        })
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                console.error('Error updating module order:', error);
                setErrorMessage('Erreur lors de la mise à jour de l\'ordre des modules');
                setSuccessMessage('');
                // Restore original order by refetching
                fetchModules(selectedLevel);
            });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Liste des Modules</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Voir, réorganiser et supprimer les modules existants.
                </p>
            </header>

            <div className="mt-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{errorMessage}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cours
                        </label>
                        <select
                            id="course"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            onChange={handleCourseChange}
                            value={selectedCourse}
                        >
                            <option value="">Sélectionnez un cours</option>
                            {coursesList.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Niveau
                        </label>
                        <select
                            id="level"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            onChange={handleLevelChange}
                            value={selectedLevel}
                            disabled={!selectedCourse}
                        >
                            <option value="">Sélectionnez un niveau</option>
                            {levels.map(level => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                        Chargement...
                    </div>
                )}

                {!loading && selectedLevel && modules.length === 0 && (
                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                        Aucun module trouvé pour ce niveau
                    </div>
                )}

                {selectedLevel && modules.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                            Modules ({modules.length})
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Faites glisser les modules pour changer leur ordre
                        </p>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId={`modules-${uuidv4()}`}>
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {modules.map((module, index) => (
                                            <Draggable key={module.id} draggableId={`module-${module.id}`} index={index}>
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600"
                                                    >
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {module.title}
                                                            </h4>
                                                            {module.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {module.description}
                                                                </p>
                                                            )}
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Ordre: {module.order} | {module.pieces?.length || 0} pièces
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(module.id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Confirmer la suppression
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
