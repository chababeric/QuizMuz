import { useState } from "react";
import { AdminDialog, EmptyState, SectionCard, buttonDanger, buttonPrimary, buttonSecondary, control, iconButtonDanger, label } from "@/Components/AdminUi";
import { BookOpenIcon, PlusIcon, TrashIcon } from "@/Components/AppIcons";

export default function CourseManagement({ authInstitution, courses, getCourses, successMessage, errorMessage, setSuccessMessage, setErrorMessage, selectedInstitution }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [currentCourseToDelete, setCurrentCourseToDelete] = useState([]);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openDeleteModal = (course) => {
        setCurrentCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const addCourse = async () => {
        closeAddModal();

        try {
            const response = await axios.post(route('admin.add-course'), {
                name: newCourseName,
                selectedInstitutionName: selectedInstitution
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getCourses();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }

        setNewCourseName('');
    };

    const deleteCourse = async (course) => {
        closeDeleteModal();

        try {
            const response = await axios.post(route('admin.delete-course'), {
                course_id: course.id,
                name: course.name,
                institution_name: selectedInstitution
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Remove course from the list
            getCourses()
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }
    }

    // Courses can only be changed for the admin's own institution
    const canEdit = authInstitution === selectedInstitution;

    const submitAdd = (e) => {
        e.preventDefault();
        addCourse();
    };

    return (
        <SectionCard
            id="courses-title"
            title={`Cours · ${selectedInstitution}`}
            description={`${courses.length} cours`}
            action={canEdit && (
                <button type="button" onClick={openAddModal} className={buttonPrimary}>
                    <PlusIcon className="h-4 w-4"/> Ajouter
                </button>
            )}
        >
            <AdminDialog
                show={isAddModalOpen}
                onClose={closeAddModal}
                title="Ajouter un cours"
                actions={<>
                    <button type="button" onClick={closeAddModal} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="add-course-form" className={buttonPrimary}>Ajouter</button>
                </>}
            >
                <form id="add-course-form" onSubmit={submitAdd}>
                    <p className="mb-4">Institution : <strong className="text-gray-900 dark:text-white">{selectedInstitution}</strong></p>
                    <label htmlFor="new-course-name" className={label}>Nom du cours</label>
                    <input
                        id="new-course-name"
                        type="text"
                        className={`${control} mt-1.5 w-full`}
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        required
                        autoFocus
                    />
                </form>
            </AdminDialog>

            <AdminDialog
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Supprimer le cours ?"
                actions={<>
                    <button type="button" onClick={closeDeleteModal} className={buttonSecondary}>Annuler</button>
                    <button type="button" onClick={() => deleteCourse(currentCourseToDelete)} className={buttonDanger}>Supprimer</button>
                </>}
            >
                <p>Êtes-vous sûr de vouloir supprimer le cours <strong className="text-gray-900 dark:text-white">{currentCourseToDelete.name}</strong> de l'institution <strong className="text-gray-900 dark:text-white">{selectedInstitution}</strong> ?</p>
            </AdminDialog>

            {courses.length === 0 ? (
                <EmptyState>Aucun cours pour cette institution.</EmptyState>
            ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/70">
                    {courses.map((course) => (
                        <li key={course.id} className="flex items-center gap-3 px-5 py-3">
                            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B4283F]/10 text-[#B4283F] dark:bg-[#E0566C]/20 dark:text-[#F07A8D]">
                                <BookOpenIcon className="h-4 w-4"/>
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-white">{course.name}</span>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(course)}
                                    aria-label={`Supprimer ${course.name}`}
                                    title="Supprimer"
                                    className={iconButtonDanger}
                                >
                                    <TrashIcon className="h-4 w-4"/>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}
