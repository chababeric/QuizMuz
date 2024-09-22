import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function AdminManagement({users, setUsers, updateLastActionTime, successMessage, setSuccessMessage, errorMessage, setErrorMessage}) {
    const makeAdmin = async (id, firstName, lastName) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir donner les droits d'administrateur à ${firstName} ${lastName} ?`)) {
            return;
        }

        try {
            const response = await axios.post('/admin/make-admin', {
                user_id: id,
                name: `${firstName} ${lastName}`
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Update the users state locally
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? { ...user, is_admin: true } : user // Set is_admin to true
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
    }

    const removeAdmin = async (id, firstName, lastName) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir retirer les droits d'administrateur de ${firstName} ${lastName} ?`)) {
            return;
        }

        try {
            const response = await axios.post('/admin/remove-admin', {
                user_id: id,
                name: `${firstName} ${lastName}`
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Update the users state locally
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? { ...user, is_admin: false } : user // Set is_admin to false
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
    }

    return(
        <section>
            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            <div className=" flex flex-col space-y-4 max-h-96 overflow-y-auto p-4 md:p-8">
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
                            onClick={() => user.is_admin ? removeAdmin(user.id, user.first_name, user.last_name) : makeAdmin(user.id, user.first_name, user.last_name)}
                            className={`px-4 py-2 rounded-md text-white ${
                                user.is_admin ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                            {user.is_admin ? "Rétrograder" : "Promouvoir"}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
