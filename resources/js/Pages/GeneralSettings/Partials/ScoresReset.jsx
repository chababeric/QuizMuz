import { useState } from 'react';
import Modal from "@/Components/Modal.jsx";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import axios from 'axios';

export default function ScoresReset({auth, scores, getScores, updateLastActionTime, successMessage, setSuccessMessage, errorMessage, setErrorMessage, selectedInstitution, selectedInstitutionId }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const resetScores = async () => {
        updateLastActionTime();
        closeModal();

        try {
            const response = await axios.post(route('admin.reset-scores'));
            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getScores();
        } catch (error) {
            setErrorMessage('An error occurred while resetting scores.');
            setSuccessMessage('');
        }
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 max-w-xs">Réinitialisation des scores - {selectedInstitution}</h2>
                <button
                    onClick={openModal}
                    className={`px-4 py-2 rounded-md transition duration-200 ml-4 ${
                        scores.length === 0 || auth.user.institution_id !== selectedInstitutionId
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    disabled={scores.length === 0 || auth.user.institution_id !== selectedInstitutionId}
                >
                    Réinitialiser
                </button>
            </div>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            <div className="flex flex-col space-y-4 max-h-[600px] overflow-y-auto p-4 md:p-8">
                {scores.map((scoreItem, index) => (
                    <div
                        key={index}
                        className="p-3 border rounded-lg shadow-lg flex justify-between items-center bg-gray-100 transition-transform duration-200 hover:scale-105 hover:text-blue-600"
                    >
                        <div>
                            <h3 className="text-xl font-semibold">
                                {scoreItem.user.last_name}, {scoreItem.user.first_name}
                            </h3>
                            <p className="text-gray-600">{scoreItem.user.username}</p>
                        </div>

                        <div>{scoreItem.score}</div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <Modal show={isModalOpen}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Confirmation</h2>
                        <p>Êtes-vous sûr de vouloir <strong>réinitialiser tous les scores</strong> de l'institution : <strong>{selectedInstitution}</strong>?</p>
                        <p className="text-red-500 mt-6">Cette action est irréversible.</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                onClick={resetScores}
                            >
                                Confirmer
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                onClick={closeModal}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    );
}
