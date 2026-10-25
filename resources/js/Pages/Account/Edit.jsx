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

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
                <UpdateProfileInformationForm/>

                <UpdatePasswordForm/>

                <UpdateAdminKeyForm className="lg:col-span-2"/>

                {canDelete && (
                    <DeleteUserForm className="lg:col-span-2"/>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
