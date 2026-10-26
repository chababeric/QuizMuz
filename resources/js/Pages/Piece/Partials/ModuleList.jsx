import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AdminDialog, AdminField, SectionCard, Toast, buttonDanger, buttonSecondary, control, iconButtonDanger, muted } from '@/Components/AdminUi';
import { GripVerticalIcon, TrashIcon } from '@/Components/AppIcons';

export default function ModuleList({ className = '', courseName }) {
    const [levels, setLevels] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        axios.get(route('levelsFromCourse'), {
            params: {
                course_name: courseName,
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
    }, []);

    useEffect(() => {
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

    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
    };

    const handleDeleteClick = (moduleId) => {
        setConfirmDelete(moduleId);
    };

    const handleDeleteConfirm = () => {
        if (!confirmDelete) return;

        setLoading(true);

        axios.post(route('admin.delete-module'), { id: confirmDelete })
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                fetchModules(selectedLevel);
            })
            .catch(error => {
                setErrorMessage(error.response.data.error || 'Erreur lors de la suppression du module');
                setSuccessMessage('');
            })
            .finally(() => {
                setLoading(false);
                setConfirmDelete(null);
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
                setErrorMessage(error.response.data.error || 'Erreur lors de la mise à jour de l\'ordre des modules');
                setSuccessMessage('');
                // Restore original order by refetching
                fetchModules(selectedLevel);
            });
    };

    const confirmModule = modules.find(module => module.id === confirmDelete);

    return (
        <SectionCard
            id="module-list-title"
            title="Liste des Modules"
            description="Voir, réorganiser et supprimer les modules existants."
            className={className}
        >
            <div className="flex flex-1 flex-col gap-4 p-5">
                <AdminField id="module-list-level" label="Niveau">
                    <select
                        id="module-list-level"
                        className={`${control} w-full`}
                        onChange={handleLevelChange}
                        value={selectedLevel}
                    >
                        <option value="">Sélectionnez un niveau</option>
                        {levels.map(level => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                </AdminField>

                {loading && (
                    <p className={`py-4 text-center text-sm ${muted}`}>Chargement...</p>
                )}

                {!loading && !selectedLevel && (
                    <p className={`rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm dark:border-gray-600 ${muted}`}>
                        Choisissez un niveau pour voir ses modules.
                    </p>
                )}

                {!loading && selectedLevel && modules.length === 0 && (
                    <p className={`py-4 text-center text-sm ${muted}`}>Aucun module trouvé pour ce niveau</p>
                )}

                {selectedLevel && modules.length > 0 && (
                    <div>
                        <div className="mb-2 flex items-baseline justify-between gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Modules ({modules.length})</h3>
                            <p className={`text-xs ${muted}`}>Faites glisser les modules pour changer leur ordre</p>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="modules">
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex flex-col gap-2"
                                    >
                                        {modules.map((module, index) => (
                                            <Draggable key={module.id} draggableId={`module-${module.id}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 dark:bg-gray-800 ${
                                                            snapshot.isDragging ? 'border-[#B4283F] shadow-lg' : 'border-gray-200 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        <GripVerticalIcon className={`h-4 w-4 ${muted}`}/>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
                                                            {module.description && (
                                                                <p className={`text-sm ${muted}`}>{module.description}</p>
                                                            )}
                                                            <p className={`mt-0.5 text-xs ${muted}`}>
                                                                Ordre: {module.order} · {courseName === 'Formation Musicale et Auditive'
                                                                    ? (module.chords?.length || 0) + ' formules'
                                                                    : (module.pieces?.length || 0) + ' pièces'
                                                                }
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(module.id)}
                                                            aria-label={`Supprimer ${module.title}`}
                                                            title="Supprimer"
                                                            className={iconButtonDanger}
                                                        >
                                                            <TrashIcon className="h-4 w-4"/>
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
            </div>

            {/* Confirmation Dialog */}
            <AdminDialog
                show={Boolean(confirmDelete)}
                onClose={handleDeleteCancel}
                title="Confirmer la suppression"
                actions={<>
                    <button type="button" onClick={handleDeleteCancel} className={buttonSecondary}>Annuler</button>
                    <button type="button" onClick={handleDeleteConfirm} className={buttonDanger}>Supprimer</button>
                </>}
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer {confirmModule ? <>le module <strong className="text-gray-900 dark:text-white">{confirmModule.title}</strong></> : 'ce module'} ? Cette action est irréversible.
                </p>
            </AdminDialog>

            <Toast successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>
        </SectionCard>
    );
}
