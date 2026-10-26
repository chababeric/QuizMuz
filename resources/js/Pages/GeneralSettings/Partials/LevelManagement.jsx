import { useState } from "react";
import { AdminDialog, EmptyState, SectionCard, buttonDanger, buttonPrimary, buttonSecondary, control, iconButtonDanger, label, muted } from "@/Components/AdminUi";
import { PlusIcon, TrashIcon } from "@/Components/AppIcons";

export default function LevelManagement({auth, courses, levels, getLevels, successMessage, errorMessage, setSuccessMessage, setErrorMessage, selectedInstitution, selectedInstitutionId}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLevelName, setNewLevelName] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [levelToDelete, setLevelToDelete] = useState(null); // Track the level to be deleted

    const openModal = (course = "") => {
        setSelectedCourse(course); // Set the default course
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const openDeleteModal = (level) => {
        setLevelToDelete(level);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLevelToDelete(null);
    };

    const toggleLevelAccess = async (toggledLevel) => {

        try {
            const response = await axios.post(route('admin.toggle-level-access'), {
                level_id: toggledLevel.id,
                name: toggledLevel.name,
                selectedInstitutionName: selectedInstitution,
            });

            setSuccessMessage(response.data.message);
            setErrorMessage("");

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred");
            setSuccessMessage("");
        }
    };

    const addLevel = async () => {
        closeModal();

        try {
            const response = await axios.post(route("admin.add-level"), {
                name: newLevelName,
                course_id: selectedCourse,
                institution_name: selectedInstitution,
            });

            setSuccessMessage(response.data.message);
            setErrorMessage("");

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred");
            setSuccessMessage("");
        }

        setNewLevelName("");
        setSelectedCourse("");
    };

    const deleteLevel = async () => {
        if (!levelToDelete) return;

        try {
            const response = await axios.post(route("admin.delete-level"), {
                level_id: levelToDelete.id,
                name: levelToDelete.name,
                institution_name: selectedInstitution,
            });

            setSuccessMessage(response.data.message);
            setErrorMessage("");

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred");
            setSuccessMessage("");
        }

        closeDeleteModal();
    };

    // Levels can only be changed for the admin's own institution
    const canEdit = auth.user.institution_id === selectedInstitutionId;

    const submitAdd = (e) => {
        e.preventDefault();
        addLevel();
    };

    return (
        <SectionCard
            id="levels-title"
            title={`Niveaux · ${selectedInstitution}`}
            description={`${levels.length} niveau${levels.length > 1 ? 'x' : ''}, ${levels.filter((level) => level.is_enabled).length} accessible${levels.filter((level) => level.is_enabled).length > 1 ? 's' : ''}`}
        >
            <AdminDialog
                show={isModalOpen}
                onClose={closeModal}
                title="Ajouter un niveau"
                actions={<>
                    <button type="button" onClick={closeModal} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="add-level-form" className={buttonPrimary}>Ajouter</button>
                </>}
            >
                <form id="add-level-form" onSubmit={submitAdd} className="flex flex-col gap-4">
                    {/* Select Course */}
                    <div>
                        <label htmlFor="new-level-course" className={label}>Cours</label>
                        <select
                            id="new-level-course"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className={`${control} mt-1.5 w-full`}
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* New Level Name */}
                    <div>
                        <label htmlFor="new-level-name" className={label}>Nom du niveau</label>
                        <input
                            id="new-level-name"
                            type="text"
                            value={newLevelName}
                            onChange={(e) => setNewLevelName(e.target.value)}
                            required
                            autoFocus
                            className={`${control} mt-1.5 w-full`}
                        />
                    </div>
                </form>
            </AdminDialog>

            {/* Modal for confirming delete */}
            <AdminDialog
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Supprimer le niveau ?"
                actions={<>
                    <button type="button" onClick={closeDeleteModal} className={buttonSecondary}>Annuler</button>
                    <button type="button" onClick={deleteLevel} className={buttonDanger}>Supprimer</button>
                </>}
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer le niveau{" "}
                    <strong className="text-gray-900 dark:text-white">{levelToDelete?.name}</strong> du cours{" "}
                    <strong className="text-gray-900 dark:text-white">{levelToDelete?.course.name}</strong> ?
                </p>
            </AdminDialog>

            {courses.length === 0 && <EmptyState>Ajoutez d'abord un cours pour créer des niveaux.</EmptyState>}

            {/* Iterate over all courses */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course) => {
                    const courseLevels = levels.filter((level) => level.course_id === course.id);

                    return (
                        <div key={course.id} className="px-5 py-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {course.name}
                                    <span className={`ml-2 font-normal ${muted}`}>{courseLevels.length}</span>
                                </h3>

                                {/* Add New Level button */}
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={() => openModal(course.id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#B4283F] hover:bg-[#B4283F]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F] dark:text-[#F07A8D] dark:hover:bg-[#E0566C]/20"
                                    >
                                        <PlusIcon className="h-4 w-4"/> Ajouter un niveau
                                    </button>
                                )}
                            </div>

                            {courseLevels.length === 0 ? (
                                <p className={`text-sm ${muted}`}>Aucun niveau dans ce cours.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                    {courseLevels.map((level) => (
                                        <li key={level.id} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-900 dark:text-white">{level.name}</p>
                                                <p className={`flex items-center gap-1.5 text-xs font-medium ${level.is_enabled ? 'text-emerald-700 dark:text-emerald-400' : muted}`}>
                                                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${level.is_enabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                    {level.is_enabled ? 'Accessible' : 'Verrouillé'}
                                                </p>
                                            </div>

                                            {canEdit && (
                                                <>
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={Boolean(level.is_enabled)}
                                                        aria-label={`Accès au niveau ${level.name}`}
                                                        title={level.is_enabled ? "Désactiver l'accès" : "Activer l'accès"}
                                                        onClick={() => toggleLevelAccess(level)}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 motion-reduce:transition-none ${
                                                            level.is_enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                    >
                                                        <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transition motion-reduce:transition-none ${level.is_enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(level)}
                                                        aria-label={`Supprimer ${level.name}`}
                                                        title="Supprimer"
                                                        className={iconButtonDanger}
                                                    >
                                                        <TrashIcon className="h-4 w-4"/>
                                                    </button>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </SectionCard>
    );
}
