import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import HandleAccess from '@/Pages/Access/Partials/HandleAccess';
import axios from 'axios';

export default function Edit({ auth, user, roles, courses }) {
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Accès</h2>}
        >
            <Head title="Admin - Accès" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <HandleAccess
                            className="max-w-full dark:bg-gray-800"
                            updateLastActionTime={updateLastActionTime}
                            roles={roles}
                            courses={courses}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
