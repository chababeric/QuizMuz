import { useState } from "react";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import Modal from "@/Components/Modal.jsx";
import deleteIcon from "../../../../icons/delete.svg";
import addIcon from "../../../../icons/add.svg";
import axios from "axios";

export default function InstitutionManagement({ institutions, getInstitutions, updateLastActionTime, successMessage, setSuccessMessage, errorMessage, setErrorMessage }) {
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
        updateLastActionTime();
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
        updateLastActionTime();
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

    return (
        <section>
            {/* Modal for adding a new institution */}
            <Modal show={isAddModalOpen} onClose={closeAddModal}>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Ajouter une institution</h2>

                    {/* New Institution Name */}
                    <label className="block mb-2">Nom de l'institution:</label>
                    <input
                        type="text"
                        value={newInstitutionName}
                        onChange={(e) => setNewInstitutionName(e.target.value)}
                        className="mb-4 p-2 border rounded w-full"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={addInstitution}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Ajouter
                        </button>
                        <button
                            onClick={closeAddModal}
                            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal for delete confirmation */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
                    <p>Êtes-vous sûr de vouloir supprimer l'institution '{currentInstitutionToDelete?.name}' ?</p>

                    {/* Buttons */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => deleteInstitution(currentInstitutionToDelete)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Supprimer
                        </button>
                        <button
                            onClick={closeDeleteModal}
                            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            {/* Institutions List */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {institutions.map((institution, index) => (
                    <div
                        key={index}
                        className="p-6 border rounded-lg shadow-lg flex flex-col items-center justify-between transition-transform duration-200 hover:scale-105 bg-blue-200"
                    >
                        <h3 className="text-2xl font-semibold mb-4">{institution.name}</h3>
                        <button
                            onClick={() => openDeleteModal(institution)}
                            className="px-4 py-2 rounded-md flex items-center text-white bg-gray-700 hover:bg-gray-800"
                        >
                            <img src={deleteIcon} alt="Delete icon" className="w-6 h-6 mr-1" />
                            Supprimer
                        </button>
                    </div>
                ))}

                {/* Add New Institution button */}
                <div
                    className="p-6 border rounded-lg shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-105 bg-blue-200 cursor-pointer"
                    onClick={openAddModal}
                >
                    <img src={addIcon} alt="Add icon" className="w-14 h-14" />
                </div>
            </div>
        </section>
    );
}
