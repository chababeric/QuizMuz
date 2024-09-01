import React, { useState, useEffect } from 'react';
import axios from "axios";
import deleteIcon from "../../icons/delete.svg";
import Table from "@/Components/Table.jsx";
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function DeleteAccount({ updateLastActionTime }) {
    const [accounts, setAccounts] = useState([]);
    const [sortedAccounts, setSortedAccounts] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchAccounts = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            const accountsWithIcons = data.map(account => ({
                ...account,
                icon: deleteIcon,
                altIcon: 'delete'
            }));
            setAccounts(accountsWithIcons);
        } catch (error) {
            console.error('There was an error fetching the accounts!', error);
        }
    };

    useEffect(() => {
        fetchAccounts().then(r => {});
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...accounts].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedAccounts(sorted);
    }, [accounts]);

    const removeAccount = async (account) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${account.first_name} ${account.last_name} ?`)) {
            return;
        }

        try {
            const response = await axios.post('/admin/delete-user', {
                user_id: account.id,
                name: `${account.first_name} ${account.last_name}`
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Remove the account from the list
            setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== account.id));

        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    };

    return (
        <div className='flex flex-col w-full items-center'>
            <h1 className='text-4xl hover:cursor-default font-bold'>Suppression de compte</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <Table
                data={sortedAccounts}
                columnNames={['Nom de famille', 'Prénom', 'Nom d\'utilisateur', 'Institution']}
                columnKeys={['last_name', 'first_name', 'username', 'institution_name']}
                action={removeAccount}
                icon={account => account.icon}
                altIcon={account => account.altIcon}
                actionColumn={true}
            />
        </div>
    );
}
