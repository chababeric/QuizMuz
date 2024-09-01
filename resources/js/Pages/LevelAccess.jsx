import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import disableIcon from "../../icons/disable.svg";
import enableIcon from "../../icons/enable.svg";

export default function LevelAccess({ updateLastActionTime }) {
    const [levels, setLevels] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        axios.get('/api/levels')
            .then(response => {
                const levelsWithIcons = response.data.map(level => ({
                    ...level,
                    icon: level.is_enabled ? enableIcon : disableIcon,
                    altIcon: level.is_enabled ? 'enable' : 'disable'
                }));
                setLevels(levelsWithIcons);
            })
            .catch(error => {
                console.error('Error fetching levels:', error);
            });
    }, []);

    const toggleLevelAccess = async (level) => {
        updateLastActionTime();

        try {
            const response = await axios.post('/admin/toggle-level-access', {
                level_id: level.id,
                name: level.name
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setLevels(prevLevels => prevLevels.map(lvl => {
                if (lvl.id === level.id) {
                    return {
                        ...lvl,
                        is_enabled: !lvl.is_enabled,
                        icon: !lvl.is_enabled ? enableIcon : disableIcon,
                        altIcon: !lvl.is_enabled ? 'enable' : 'disable'
                    };
                }
                return lvl;
            }));
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
            <h1 className='text-4xl hover:cursor-default font-bold'>Gestion d'accès aux niveaux</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
            />

            <table className="mt-4 min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Nom</th>
                        <th className="px-4 py-2">Statut</th>
                    </tr>
                </thead>
                <tbody>
                {levels.map((level, index) => (
                    <tr key={index} className="text-center">
                        <td className="border px-4 py-2">{level.name}</td>
                        <td className="border px-4 py-2 flex justify-center items-center">
                            <img
                                src={level.icon}
                                alt={level.altIcon}
                                className="w-8 h-8 cursor-pointer"
                                onClick={() => toggleLevelAccess(level)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
