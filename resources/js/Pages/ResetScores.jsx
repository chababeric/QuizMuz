import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function ResetScores({ updateLastActionTime }) {
    const [scores, setScores] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchScores = async () => {
        try {
            const response = await fetch('/scores');
            const data = await response.json();
            setScores(data);
        } catch (error) {
            console.error('There was an error fetching the scores!', error);
        }
    }

    useEffect(() => {
        fetchScores().then(r => {});
    }, []);

    const resetScores = async () => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir réinitialiser les scores ?`)) {
            return;
        }

        try {
            const response = await axios.post('/admin/reset-scores');
            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setScores([]);
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
            <h1 className='text-4xl hover:cursor-default font-bold'>Réinitialiser les scores</h1>

            <MessageDisplay
                successMessage={successMessage}
                errorMessage={errorMessage}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />

            <table className="mt-4 min-w-full bg-white mb-6">
                <thead>
                <tr>
                    <th className="px-4 py-2">Prénom</th>
                    <th className="px-4 py-2">Nom de famille</th>
                    <th className="px-4 py-2">Nom d'utilisateur</th>
                    <th className="px-4 py-2">Score</th>
                </tr>
                </thead>
                <tbody>
                {scores.map((score, index) => (
                    <tr key={index} className="text-center">
                        <td className="border px-4 py-2">{score.user.first_name}</td>
                        <td className="border px-4 py-2">{score.user.last_name}</td>
                        <td className="border px-4 py-2">{score.user.username}</td>
                        <td className="border px-4 py-2">{score.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button
                className="bg-rose-600 hover:bg-rose-800 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16"
                onClick={resetScores}
            >
                Réinitialiser les scores
            </button>
        </div>
    );
}
