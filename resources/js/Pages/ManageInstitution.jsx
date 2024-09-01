import React, { useState, useEffect } from "react";
import axios from "axios";
import deleteIcon from "../../icons/delete.svg";
import Table from "@/Components/Table.jsx";
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function ManageInstitution({ updateLastActionTime }) {
    const [institutions, setInstitutions] = useState([]);
    const [addInstitutionClicked, setAddInstitutionClicked] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchInstitutions = async () => {
        try {
            axios.get('/institutions')
                .then(response => {
                    const institutionsWithIcons = response.data.map(institution => ({
                        ...institution,
                        icon: deleteIcon,
                        altIcon: 'delete'
                    }));
                    setInstitutions(institutionsWithIcons);
                })
                .catch(error => {
                    console.error('There was an error fetching the institutions!', error);
                });
        } catch (error) {
            console.error('There was an error fetching the institutions!', error);
        }
    };

    useEffect(() => {
        fetchInstitutions().then(r => {});
    }, []);

    const removeInstitution = async (institution) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'institution '${institution.name}' ?`)) {
            return;
        }

        try {
            axios.post('/admin/remove-institution', {
                institution_id: institution.id,
                name : institution.name
            })
                .then(response => {
                    setSuccessMessage(response.data.message);
                    setErrorMessage('');

                    // Remove the institution from the list
                    setInstitutions(prevInstitutions => prevInstitutions.filter(inst => inst.id !== institution.id));
                })
                .catch(error => {
                    if (error.response && error.response.data) {
                        setErrorMessage(error.response.data.message || 'An error occurred');
                    } else {
                        setErrorMessage('An error occurred');
                    }
                    setSuccessMessage('');
                });
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
        }
    }

    const addInstitution = async () => {
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/add-institution', {
                name: newInstitutionName
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');

            // Clear the input field and refetch institutions
            setNewInstitutionName('');
            setAddInstitutionClicked(false);
            await fetchInstitutions();
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('An error occurred');
            }
            setSuccessMessage('');
            setNewInstitutionName('');
        }
    }

    return (
        <div className="flex flex-col w-full items-center">
            <h1 className='text-4xl hover:cursor-default font-bold'>Gestion des institutions</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
            />

            <Table
                data={institutions}
                columnNames={['Nom']}
                columnKeys={['name']}
                action={removeInstitution}
                icon={institution => institution.icon} // Pass the correct function for the icon
                altIcon={institution => institution.altIcon} // Pass the correct function for the altIcon
                actionColumn={true}
            />

            <div className="mt-8">
                {!addInstitutionClicked &&
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16 flex items-center justify-center"
                        onClick={() => setAddInstitutionClicked(!addInstitutionClicked)}
                    >
                        Ajouter une institution
                    </button>
                }

                {addInstitutionClicked &&
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Nom de l'institution"
                            value={newInstitutionName}
                            onChange={e => setNewInstitutionName(e.target.value)}
                            className="border border-gray-400 p-2 rounded w-96 mb-4"
                        />
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16"
                            onClick={addInstitution}
                        >
                            Ajouter
                        </button>
                    </div>
                }
            </div>
        </div>
    );
}
