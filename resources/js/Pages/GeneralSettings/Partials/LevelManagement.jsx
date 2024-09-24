import MessageDisplay from "@/Components/MessageDisplay.jsx";
import deleteIcon from "../../../../icons/delete.svg";
import addIcon from "../../../../icons/add.svg";
import Modal from "@/Components/Modal.jsx";
import { useState } from "react";

export default function LevelManagement({ courses, levels, getLevels, updateLastActionTime, successMessage, errorMessage, setSuccessMessage, setErrorMessage, selectedInstitution }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [levelToDelete, setLevelToDelete] = useState(null); // Track the level to be deleted

    const openModal = (course = '') => {
        setSelectedCourse(course);  // Set the default course
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
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/toggle-level-access', {
                level_id: toggledLevel.id,
                name: toggledLevel.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }
    };

    const addLevel = async () => {
        updateLastActionTime();
        closeModal();

        try {
            const response = await axios.post(route('admin.add-level'), {
                name: newLevelName,
                course_id: selectedCourse,
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }

        setNewLevelName('');
        setSelectedCourse('');
    };

    const deleteLevel = async () => {
        if (!levelToDelete) return;

        updateLastActionTime();

        try {
            const response = await axios.post(route('admin.delete-level'), {
                level_id: levelToDelete.id,
                name: levelToDelete.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getLevels();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred');
            setSuccessMessage('');
        }

        closeDeleteModal(); // Close the modal after deletion
    };

    return (
        <section>
            {/* Modal for adding a new level */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Ajouter un niveau</h2>

                    {/* Select Course */}
                    <label className="block mb-2">Cours:</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="mb-4 p-2 border rounded w-full"
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>

                    {/* New Level Name */}
                    <label className="block mb-2">Nom du niveau:</label>
                    <input
                        type="text"
                        value={newLevelName}
                        onChange={(e) => setNewLevelName(e.target.value)}
                        className="mb-4 p-2 border rounded w-full"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={addLevel}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Ajouter
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

            {/* Modal for confirming delete */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
                    <p className="mb-4">Êtes-vous sûr de vouloir supprimer le niveau <strong>{levelToDelete?.name}</strong> du cours: <strong>{levelToDelete?.course.name}</strong>?</p>

                    {/* Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={deleteLevel}
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

            {/* Group levels by course */}
            {levels.reduce((acc, level) => {
                const courseIndex = acc.findIndex(course => course.course_id === level.course_id);
                if (courseIndex === -1) {
                    acc.push({
                        course_id: level.course_id,
                        course_name: level.course.name,
                        levels: [level],
                    });
                } else {
                    acc[courseIndex].levels.push(level);
                }
                return acc;
            }, []).map((course, courseIndex) => (
                <div key={courseIndex} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{course.course_name}</h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {course.levels.map((level, levelIndex) => (
                            <div
                                key={levelIndex}
                                className={`p-6 border rounded-lg shadow-lg flex flex-col items-center justify-between transition-transform duration-200 hover:scale-105 ${
                                    level.is_enabled ? "bg-green-200" : "bg-red-200"
                                }`}
                            >
                                <h3 className="text-2xl font-semibold mb-4">{level.name}</h3>
                                <button
                                    onClick={() => toggleLevelAccess(level)}
                                    className={`px-4 py-2 rounded-md text-white mb-4 ${
                                        level.is_enabled
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    {level.is_enabled ? "Désactiver l'accès" : "Activer l'accès"}
                                </button>
                                <button
                                    onClick={() => openDeleteModal(level)}
                                    className="px-4 py-2 rounded-md flex items-center text-white bg-gray-700 hover:bg-gray-800"
                                >
                                    <img src={deleteIcon} alt="Delete icon" className="w-6 h-6 mr-1" />
                                    Supprimer
                                </button>
                            </div>
                        ))}

                        {/* Add New Level button */}
                        <div
                            className="p-6 border rounded-lg shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-105 bg-gray-300 cursor-pointer"
                            onClick={() => openModal(course.course_id)} // Pass the course id here
                        >
                            <img src={addIcon} alt="Add icon" className="w-14 h-14" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
