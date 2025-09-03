import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import moment from 'moment';

export default function Dashboard({ auth, totalStats, users }) {
    const [sortedUsers, setSortedUsers] = useState([]);
    const [nbConnectedUsers, setNbConnectedUsers] = useState(0);
    const [modalOpen, setModalOpen] = useState(false); // Modal state
    const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
    const isClient = typeof window !== 'undefined';

    useEffect(() => {
        const sorted = [...users].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setSortedUsers(sorted);
        updateNbConnectedUsers();
    }, [users]);

    const openModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalOpen(false);
    };

    const getStatus = (lastActionTime) => {
        if (!isClient) return '';
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Vue d'ensemble</h2>}
        >
            <Head title="Admin - Aperçu" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">Statistiques</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre total d'utilisateurs : <span className="font-semibold">{totalStats.totalUsers}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre total de parties Quiz : <span className="font-semibold">{totalStats.totalSoloGames}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre total de parties Pratiques : <span className="font-semibold">{totalStats.totalPractice}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-200 shadow rounded-lg flex items-center justify-center dark:bg-gray-700">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Nombre d'utilisateurs connectés : <span className="font-semibold">{nbConnectedUsers}</span>
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
                                                    <th scope="col" className="px-6 py-4">Dernière connexion</th>
                                                    <th scope="col" className="px-6 py-4">Statut</th>
                                                    <th scope="col" className="px-6 py-4">Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {sortedUsers.map((user, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b dark:border-neutral-500">
                                                        <td className="whitespace-nowrap px-6 py-4 font-medium">{rowIndex + 1}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {user.last_name}, {user.first_name}
                                                            </span>
                                                            <br />
                                                            <span className="text-sm text-gray-600 dark:text-white">{user.username}</span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">{user.institution_name || 'N/A'}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            {user.last_action_time ? user.last_action_time.split(' ')[0] : ''}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4" style={isClient ? getStatusStyle(getStatus(user.last_action_time)) : {}}>
                                                            {isClient ? getStatus(user.last_action_time) : ''}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <button
                                                                onClick={() => openModal(user)}
                                                                className="text-blue-500 font-semibold hover:underline"
                                                            >
                                                                Voir les stats
                                                            </button>
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

            {modalOpen && selectedUser && (
                <Modal show={modalOpen} onClose={closeModal}>
                    <div>
                        <h2 className="text-xl font-bold mb-4 dark:text-white">
                            Statistiques pour {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.username})
                        </h2>
                        {selectedUser.courses && selectedUser.courses.length > 0 ? (

                            <div className="space-y-2">
                                {selectedUser.courses.map((course) => (
                                    <div key={course.course_id} className="p-3 bg-gray-200 rounded-lg shadow dark:bg-gray-700">
                                        <p className="text-lg font-semibold dark:text-white">{course.course_name}</p>
                                        <p className="text-sm dark:text-gray-400">Pratique: {course.practice}</p>
                                        <p className="text-sm dark:text-gray-400">Quiz: {course.quiz}</p>
                                        <p className="text-sm dark:text-gray-400">Total de visites: {course.total}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-white">Aucune donnée disponible pour cet utilisateur.</p>
                        )}
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
