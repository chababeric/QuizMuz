import React, { useState } from 'react';
import axios from "axios";
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function ModifyPassword({ updateLastActionTime }) {
    const [currentUsername, setCurrentUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Update the last action time
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/update-password', {
                current_username: currentUsername,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            // Handle success
            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setCurrentUsername('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            // Handle error
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className='flex flex-col w-full items-center'>
            <h1 className='text-4xl hover:cursor-default font-bold'>Modifier un mot de passe</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <form onSubmit={handleSubmit} className="mt-4 w-4/5">
                <div className="mb-4">
                    <label htmlFor="currentUsername" className="block text-sm font-medium text-gray-700">
                        Nom d'utilisateur
                    </label>
                    <input
                        type="text"
                        id="currentUsername"
                        value={currentUsername}
                        onChange={(e) => setCurrentUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        Nouveau mot de passe
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Sauvegarder
                </button>
            </form>
        </div>
    );
}
