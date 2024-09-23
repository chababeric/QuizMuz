import { useState } from "react";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import Modal from "@/Components/Modal.jsx";

export default function AdminManagement({users, getUsers, updateLastActionTime, successMessage, setSuccessMessage, errorMessage, setErrorMessage}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'promote' or 'demote'
    const [selectedUser, setSelectedUser] = useState(null); // Store user data for modal confirmation

    const openModal = (action, user) => {
        setModalAction(action);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setModalAction(null);
    };

    const handleAdminAction = async () => {
        updateLastActionTime();
        closeModal(); // Close the modal after confirmation

        const { id, first_name, last_name } = selectedUser;

        try {
            const response = await axios.post(`/admin/${modalAction === 'promote' ? 'make-admin' : 'remove-admin'}`, {
                user_id: id,
                name: `${first_name} ${last_name}`
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getUsers();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }
    };

    return (
        <section>
            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto p-4 md:p-8">
                {users.map((user, index) => (
                    <div
                        key={index}
                        className="p-3 border rounded-lg shadow-lg flex justify-between items-center bg-gray-100 transition-transform duration-200 hover:scale-105 hover:text-blue-600"
                    >
                        <div>
                            <h3 className="text-xl font-semibold">
                                {user.last_name}, {user.first_name}
                            </h3>
                            <p className="text-gray-600">{user.username}</p>
                        </div>
                        <button
                            onClick={() => openModal(user.is_admin ? 'demote' : 'promote', user)}
                            className={`px-4 py-2 rounded-md text-white ${
                                user.is_admin ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                            {user.is_admin ? "Rétrograder" : "Promouvoir"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for confirming admin promotion/demotion */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">
                        {modalAction === 'promote' ? 'Promouvoir' : 'Rétrograder'} {selectedUser?.first_name} {selectedUser?.last_name}
                    </h2>
                    <p>
                        Êtes-vous sûr de vouloir {modalAction === 'promote' ? "donner les droits d'administrateur à" : "retirer les droits d'administrateur de"} {selectedUser?.first_name} {selectedUser?.last_name} ?
                    </p>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleAdminAction}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Confirmer
                        </button>
                        <button
                            onClick={closeModal}
                            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
