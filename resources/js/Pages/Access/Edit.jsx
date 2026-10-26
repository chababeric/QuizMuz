import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import HandleAccess from '@/Pages/Access/Partials/HandleAccess';

export default function Edit({ auth, user, roles, courses }) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Accès</h2>}
        >
            <Head title="Admin - Accès" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <HandleAccess
                    roles={roles}
                    courses={courses}
                />
            </div>
        </AuthenticatedLayout>
    );
}
