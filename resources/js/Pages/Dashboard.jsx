import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {useEffect, useState} from "react";
import moment from 'moment';

export default function Dashboard({ auth }) {
    const [totalStats, setTotalStats] = useState([]);
    const [users, setUsers] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [nbConnectedUsers, setNbConnectedUsers] = useState(0);

    useEffect(() => {
        const fetchTotalStats = async () => {
            try {
                const response = await fetch('/admin/total-stats');
                const data = await response.json();
                setTotalStats(data);
            } catch (error) {
                console.error("There was an error fetching the total stats!", error);
            }
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(route('allUsers'));
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("There was an error fetching the users!", error);
            }
        }

        fetchTotalStats().then(r => {});
        fetchUsers().then(r => {});
        updateLastActionTime();
    }, []);

    useEffect(() => {
        // Sort users alphabetically by last name
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);

        updateNbConnectedUsers();
    }, [users]);

    const getStatus = (lastActionTime) => {
        const now = moment();
        const lastAction = moment(lastActionTime);
        const diff = now.diff(lastAction, 'minutes');
        return diff < 20 ? 'En ligne' : 'Hors ligne';
    }

    const getStatusStyle = (status) => {
        return status === 'En ligne' ? { color: 'green' } : { color: 'red' };
    }

    const updateNbConnectedUsers = () => {
        const onlineUsers = users.filter(user => getStatus(user.last_action_time) === 'En ligne').length;
        setNbConnectedUsers(onlineUsers);
    };

    const updateLastActionTime = () => {
        axios.post(route('updateLastActionTime'))
            .then(response => {})
            .catch(error => {
                console.error('Error updating last action time:', error);
            });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Vue d'ensemble</h2>}
        >
            <Head title="Admin - Aperçu" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Statistiques</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-700 dark:text-white">
                                        Nombre total d'utilisateurs : <span
                                        className="font-semibold">{totalStats.totalUsers}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre total de parties Quiz : <span
                                        className="font-semibold">{totalStats.totalSoloGames}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre total de parties Pratiques : <span
                                        className="font-semibold">{totalStats.totalPractice}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre d'utilisateurs connectés : <span
                                        className="font-semibold">{nbConnectedUsers}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Utilisateurs</h1>
                            <div className="flex flex-col overflow-x-auto">
                                <div className="sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left text-sm font-light">
                                                <thead className="border-b font-medium dark:border-neutral-500">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">#</th>
                                                    <th scope="col" className="px-6 py-4">Utilisateur</th>
                                                    <th scope="col" className="px-6 py-4">Institution</th>
                                                    <th scope="col" className="px-6 py-4">Pratique</th>
                                                    <th scope="col" className="px-6 py-4">Quiz</th>
                                                    <th scope="col" className="px-6 py-4">Dernière connexion</th>
                                                    <th scope="col" className="px-6 py-4">Statut</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {sortedUsers.map((item, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b dark:border-neutral-500">
                                                        <td className="whitespace-nowrap px-6 py-4 font-medium">{rowIndex + 1}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <span
                                                                className="font-semibold text-gray-900 dark:text-white">{item.last_name}, {item.first_name}</span>
                                                            <br/>
                                                            <span
                                                                className="text-sm text-gray-600 dark:text-white">{item.username}</span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">{item.institution_name}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">{item.nb_practice}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">{item.nb_game_solo}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">{item.last_action_time.split(' ')[0]}</td>
                                                        <td className="whitespace-nowrap px-6 py-4"
                                                            style={getStatusStyle(getStatus(item.last_action_time))}>
                                                            {getStatus(item.last_action_time)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
