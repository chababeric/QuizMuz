import React, { useEffect, useState } from 'react';
import moment from 'moment';

export default function Overview() {
    const [sortedUsers, setSortedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalStats, setTotalStats] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("There was an error fetching the users!", error);
            }
        };

        const fetchTotalStats = async () => {
            try {
                const response = await fetch('/admin/total-stats');
                const data = await response.json();
                setTotalStats(data);
            } catch (error) {
                console.error("There was an error fetching the total stats!", error);
            }
        }

        fetchUsers().then(r => {});
        fetchTotalStats().then(r => {});
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);
    }, [users]);

    const getStatus = (lastActionTime) => {
        const now = moment();
        const lastAction = moment(lastActionTime);
        const diff = now.diff(lastAction, 'minutes');
        return diff < 5 ? 'En ligne' : 'Hors ligne';
    };

    const getStatusStyle = (status) => {
        return status === 'En ligne' ? { color: 'green' } : { color: 'red' };
    };

    return (
        <div className='flex flex-col w-full items-center'>
            <div className='flex flex-col w-full items-center mb-10'>
                <h1 className='text-4xl hover:cursor-default font-bold mb-4'>Statistiques</h1>
                <div className='flex flex-wrap justify-center'>
                    <div className='w-1/2 p-2 flex items-center justify-center'>
                        <p className='text-xl font-bold'>Nombre total d'utilisateurs : {totalStats.totalUsers}</p>
                    </div>
                    <div className='w-1/2 p-2 flex items-center justify-center'>
                        <p className='text-xl font-bold'>Nombre total de parties Quiz : {totalStats.totalSoloGames}</p>
                    </div>
                    <div className='w-1/2 p-2 flex items-center justify-center'>
                        <p className='text-xl font-bold'>Nombre total de parties Pratiques
                            : {totalStats.totalPractice}</p>
                    </div>
                    <div className='w-1/2 p-2 flex items-center justify-center'>
                        <p className="text-xl font-bold">Nombre total de pièces jouées dans Quiz
                            : {totalStats.totalPiecesPlayed}</p>
                    </div>
                </div>
            </div>

    <h1 className='text-4xl hover:cursor-default font-bold mb-6'>Vue d'ensemble</h1>
    <table className="mt-4 min-w-full bg-white">
        <thead>
        <tr>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Prénom</th>
            <th className="px-4 py-2">Nom d'utilisateur</th>
            <th className="px-4 py-2">Institution</th>
            <th className="px-4 py-2">Nombre de Pratiques</th>
            <th className="px-4 py-2">Nombre de parties Quiz</th>
            <th className="px-4 py-2">Dernière connexion</th>
            <th className="px-4 py-2">Statut</th>
        </tr>
        </thead>
        <tbody>
        {sortedUsers.map((item, rowIndex) => (
            <tr key={rowIndex} className="text-center">
                <td className="border px-4 py-2">{item.last_name}</td>
                <td className="border px-4 py-2">{item.first_name}</td>
                <td className="border px-4 py-2">{item.username}</td>
                        <td className="border px-4 py-2">{item.institution_name}</td>
                        <td className="border px-4 py-2">{item.nb_practice}</td>
                        <td className="border px-4 py-2">{item.nb_game_solo}</td>
                        <td className="border px-4 py-2">{item.last_action_time.split(' ')[0]}</td>
                        <td className="border px-4 py-2" style={getStatusStyle(getStatus(item.last_action_time))}>
                            {getStatus(item.last_action_time)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
