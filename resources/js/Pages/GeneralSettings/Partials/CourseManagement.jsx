import MessageDisplay from "@/Components/MessageDisplay.jsx";
import Modal from "@/Components/Modal.jsx";
import { useState } from "react";
import deleteIcon from "../../../../icons/delete.svg";
import addIcon from "../../../../icons/add.svg";

export default function CourseManagement({ courses, getCourses, updateLastActionTime, successMessage, errorMessage, setSuccessMessage, setErrorMessage }) {
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
        updateLastActionTime();
        closeAddModal();

        try {
            const response = await axios.post(route('admin.add-course'), {
                name: newCourseName
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
        updateLastActionTime();
        closeDeleteModal();

        try {
            const response = await axios.post(route('admin.delete-course'), {
                course_id: course.id,
                name: course.name
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

    return (
        <section>
            <Modal show={isAddModalOpen} close={closeAddModal}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouveau cours</h2>

                    <label className="block mb-2">Nom du cours:</label>
                    <input
                        type="text"
                        className="mb-4 p-2 border rounded w-full"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                    />
                    {/* Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={addCourse}
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

            <Modal show={isDeleteModalOpen} close={closeDeleteModal}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h2>
                    <p>Êtes-vous sûr de vouloir supprimer le cours <strong>{currentCourseToDelete.name}</strong>?</p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => deleteCourse(currentCourseToDelete)}
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {courses.map((course, index) => (
                    <div
                        key={index}
                        className="p-6 border rounded-lg shadow-lg flex flex-col items-center justify-between transition-transform duration-200 hover:scale-105 bg-orange-200"
                    >
                        <h3 className="text-2xl font-semibold mb-4">{course.name}</h3>
                        <button
                            onClick={() => openDeleteModal(course)}
                            className="px-4 py-2 rounded-md flex items-center text-white bg-gray-700 hover:bg-gray-800"
                        >
                            <img src={deleteIcon} alt="Delete icon" className="w-6 h-6 mr-1"/>
                            Supprimer
                        </button>
                    </div>
                ))}

                {/* Add New Institution button */}
                <div
                    className="p-6 border rounded-lg shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-105 bg-orange-200 cursor-pointer"
                    onClick={openAddModal}
                >
                    <img src={addIcon} alt="Add icon" className="w-14 h-14"/>
                </div>
            </div>
        </section>
    );
}
