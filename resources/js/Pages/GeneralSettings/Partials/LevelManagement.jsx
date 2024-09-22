import MessageDisplay from "@/Components/MessageDisplay.jsx";
import deleteIcon from "../../../../icons/delete.svg";

export default function LevelManagement({ levels, setLevels, updateLastActionTime, successMessage, errorMessage, setSuccessMessage, setErrorMessage }) {
    const toggleLevelAccess = async (toggledLevel) => {
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/toggle-level-access', {
                level_id: toggledLevel.id,
                name: toggledLevel.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');
            // Update the levels state locally to reflect the change without a page refresh
            setLevels(prevLevels =>
                prevLevels.map(level =>
                    level.id === toggledLevel.id
                        ? { ...level, is_enabled: !level.is_enabled } // Toggle the is_enabled value
                        : level
                )
            );
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    };

    const deleteLevel = async (level) => {
        console.log('deleteLevel', level);
    }

    return (
        <section>
            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            {/* Group levels by course */}
            {levels.reduce((acc, level) => {
                // Group levels by course_id
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
                    {/* Course Name */}
                    <h2 className="text-xl font-semibold mb-4">{course.course_name}</h2>

                    {/* Levels for the course */}
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
                                    onClick={() => deleteLevel(level)}
                                    className="px-4 py-2 rounded-md flex items-center text-white bg-gray-700 hover:bg-gray-800"
                                >
                                    <img src={deleteIcon} alt="Delete icon" className="w-4 h-4 mr-1" />
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
