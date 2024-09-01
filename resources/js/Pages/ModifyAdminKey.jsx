import React, { useState } from "react";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import axios from "axios";

export default function ModifyAdminKey({ updateLastActionTime, auth }) {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [key, setKey] = useState('');
    const [newKey, setNewKey] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const verifyKey = (event) => {
        event.preventDefault();
        updateLastActionTime();

        axios.post('/admin_key/validate', { key })
            .then(response => {
                if (response.status === 200) {
                    setSuccessMessage(response.data.message);
                    setErrorMessage('');
                } else {
                    setErrorMessage(response.data.message);
                    setSuccessMessage('');
                }
            })
            .catch(error => {
                setErrorMessage(error.response.data.message || 'Une erreur s\'est produite lors de la vérification de la clé.');
                setSuccessMessage('');
            });
        setKey('');
    };

    const updateKey = (event) => {
        event.preventDefault();
        updateLastActionTime();

        const username = auth.user.username;
        axios.post('/admin_key/update', { newKey, userPassword })
            .then(response => {
                if (response.status === 200) {
                    setSuccessMessage(response.data.message);
                    setErrorMessage('');
                } else {
                    setErrorMessage(response.data.message);
                    setSuccessMessage('');
                }
            })
            .catch(error => {
                setErrorMessage(error.response.data.message || 'Une erreur s\'est produite lors de la modification de la clé.');
                setSuccessMessage('');
            });
        setNewKey('');
        setUserPassword('');
    }

    return (
        <div className='flex flex-col w-full items-center'>
            <h1 className='text-4xl hover:cursor-default font-bold'>Modification de la Clé Admin</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <div className='flex flex-col w-full items-center mt-2'>
                <p className='text-center mb-4'>
                    Pour des raisons de sécurité, la clé d'administrateur ne peut pas être affichée à cause de son
                    chiffrement. Cependant, vous pouvez la vérifier en la saisissant dans le champ ci-dessous.
                </p>

                <form className='flex flex-row items-center space-x-4' onSubmit={verifyKey}>
                    <label className='text-lg font-bold' htmlFor='adminKey'>Clé Admin</label>
                    <input
                        type='text'
                        id='adminKey'
                        className='border border-gray-400 p-2 rounded-md'
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                    />

                    <button type='submit'
                            className='bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg'>
                        Vérifier
                    </button>
                </form>
            </div>

            <div className='flex flex-col w-full items-center mt-14'>
                <p className='text-center mb-4'>
                    Si vous souhaitez modifier la clé d'administrateur, veuillez saisir la nouvelle clé dans le champ
                    ci-dessous. Utilisez des caractères alphanumériques et spéciaux pour la sécurité et l'intégrité de
                    l'application.
                </p>

                <form className='flex flex-col items-center space-y-4' onSubmit={updateKey}>
                    <div className='flex items-center space-x-4'>
                        <label className='text-lg font-bold' htmlFor='newAdminKey'>Nouvelle Clé Admin</label>
                        <input
                            type='text'
                            id='newAdminKey'
                            className='border border-gray-400 p-2 rounded-md'
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            required
                        />
                    </div>

                    <div className='flex items-center space-x-4'>
                        <label className='text-lg font-bold' htmlFor='userPassword'>
                            Le mot de passe de {auth.user.username}
                        </label>
                        <input
                            type='password'
                            id='userPassword'
                            className='border border-gray-400 p-2 rounded-md'
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type='submit'
                            className='bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg mt-4'>
                        Modifier
                    </button>
                </form>
            </div>

        </div>
    );
}
