import React, { useState, useEffect } from 'react';
import axios from "axios";
import addIcon from "../../icons/add.svg";
import removeIcon from "../../icons/remove.svg";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import Table from "@/Components/Table.jsx";

export default function AddAdmin({ auth, updateLastActionTime }) {
    const [sortedUsers, setSortedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                const usersWithIcons = data.map(user => ({
                    ...user,
                    icon: user.is_admin ? removeIcon : addIcon,
                    altIcon: user.is_admin ? 'remove' : 'add'
                }));
                setUsers(usersWithIcons);
            } catch (error) {
                console.error("There was an error fetching the users!", error);
            }
        };

        fetchUsers().then(r => {});
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);
    }, [users]);

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

            // Update the user's is_admin status
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === id ? { ...user, is_admin: true, icon: removeIcon, altIcon: 'remove' } : user
            ));

        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    };

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

            // Update the user's is_admin status
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === id ? { ...user, is_admin: false, icon: addIcon, altIcon: 'add' } : user
            ));

        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    }

    return (
        <div className='flex flex-col w-full items-center'>
            <h1 className='text-4xl hover:cursor-default font-bold'>Gestion des administrateurs</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <Table
                data={sortedUsers}
                columnNames={['Nom', 'Prénom', 'Nom d\'utilisateur']}
                columnKeys={['last_name', 'first_name', 'username']}
                action={user => user.is_admin ? removeAdmin(user.id, user.first_name, user.last_name) : makeAdmin(user.id, user.first_name, user.last_name)}
                icon={user => user.icon}
                altIcon={user => user.altIcon}
                actionColumn={true}
            />
        </div>
    );
}
