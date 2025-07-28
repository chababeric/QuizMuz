import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import UpdateProfileInformationForm from "@/Pages/Account/Partials/UpdateProfileInformationForm.jsx";
import UpdatePasswordForm from "@/Pages/Account/Partials/UpdatePasswordForm.jsx";
import DeleteUserForm from "@/Pages/Account/Partials/DeleteUserForm.jsx";
import UpdateAdminKeyForm from "@/Pages/Account/Partials/UpdateAdminKeyForm.jsx";
import { useEffect, useState } from "react";

export default function Edit({ auth }) {
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        const isSuperAdmin = auth.user.roles.some(role => role.name === 'Super Admin');

        if (isSuperAdmin)
            setCanDelete(true);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Compte</h2>}
        >
            <Head title="Admin - Compte" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdateProfileInformationForm className="max-w-xl dark:bg-gray-800"/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl dark:bg-gray-800"/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdateAdminKeyForm className="max-w-xl dark:bg-gray-800"/>
                    </div>

                    {canDelete && (
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                            <DeleteUserForm className="max-w-xl dark:bg-gray-800"/>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
