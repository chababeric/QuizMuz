import { useState } from "react";
import axios from "axios";
import { AdminDialog, EmptyState, SectionCard, buttonDanger, buttonPrimary, buttonSecondary, control, iconButtonDanger, label } from "@/Components/AdminUi";
import { BuildingIcon, PlusIcon, TrashIcon } from "@/Components/AppIcons";

export default function InstitutionManagement({ institutions, getInstitutions, successMessage, setSuccessMessage, errorMessage, setErrorMessage }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState('');
    const [currentInstitutionToDelete, setCurrentInstitutionToDelete] = useState([]);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openDeleteModal = (institution) => {
        setCurrentInstitutionToDelete(institution);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const addInstitution = async () => {
        closeAddModal();

        try {
            const response = await axios.post(route('admin.add-institution'), {
                name: newInstitutionName
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getInstitutions();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }

        setNewInstitutionName('');
    };

    const deleteInstitution = async (institution) => {
        closeDeleteModal();

        try {
            const response = await axios.post(route('admin.delete-institution'), {
                institution_id: institution.id,
                name: institution.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Remove institution from the list
            getInstitutions()
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }
    };

    const submitAdd = (e) => {
        e.preventDefault();
        addInstitution();
    };

    return (
        <SectionCard
            id="institutions-title"
            title="Institutions"
            description={`${institutions.length} institution${institutions.length > 1 ? 's' : ''}`}
            action={
                <button type="button" onClick={openAddModal} className={buttonPrimary}>
                    <PlusIcon className="h-4 w-4"/> Ajouter
                </button>
            }
        >
            {/* Modal for adding a new institution */}
            <AdminDialog
                show={isAddModalOpen}
                onClose={closeAddModal}
                title="Ajouter une institution"
                actions={<>
                    <button type="button" onClick={closeAddModal} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="add-institution-form" className={buttonPrimary}>Ajouter</button>
                </>}
            >
                <form id="add-institution-form" onSubmit={submitAdd}>
                    <label htmlFor="new-institution-name" className={label}>Nom de l'institution</label>
                    <input
                        id="new-institution-name"
                        type="text"
                        value={newInstitutionName}
                        onChange={(e) => setNewInstitutionName(e.target.value)}
                        required
                        autoFocus
                        className={`${control} mt-1.5 w-full`}
                    />
                </form>
            </AdminDialog>

            {/* Modal for delete confirmation */}
            <AdminDialog
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Supprimer l'institution ?"
                actions={<>
                    <button type="button" onClick={closeDeleteModal} className={buttonSecondary}>Annuler</button>
                    <button type="button" onClick={() => deleteInstitution(currentInstitutionToDelete)} className={buttonDanger}>Supprimer</button>
                </>}
            >
                <p>Êtes-vous sûr de vouloir supprimer l'institution <strong className="text-gray-900 dark:text-white">{currentInstitutionToDelete?.name}</strong> ?</p>
            </AdminDialog>

            {/* Institutions List */}
            {institutions.length === 0 ? (
                <EmptyState>Aucune institution pour le moment.</EmptyState>
            ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/70">
                    {institutions.map((institution) => (
                        <li key={institution.id} className="flex items-center gap-3 px-5 py-3">
                            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                <BuildingIcon className="h-4 w-4"/>
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-white">{institution.name}</span>
                            <button
                                type="button"
                                onClick={() => openDeleteModal(institution)}
                                aria-label={`Supprimer ${institution.name}`}
                                title="Supprimer"
                                className={iconButtonDanger}
                            >
                                <TrashIcon className="h-4 w-4"/>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}
