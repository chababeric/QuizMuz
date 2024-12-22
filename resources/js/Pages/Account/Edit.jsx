import {Head} from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import UpdateProfileInformationForm from "@/Pages/Account/Partials/UpdateProfileInformationForm.jsx";
import UpdatePasswordForm from "@/Pages/Account/Partials/UpdatePasswordForm.jsx";
import DeleteUserForm from "@/Pages/Account/Partials/DeleteUserForm.jsx";
import UpdateAdminKeyForm from "@/Pages/Account/Partials/UpdateAdminKeyForm.jsx";

export default function Edit({ auth, user }) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Compte</h2>}
        >
            <Head title="Admin - Compte" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdateProfileInformationForm className="max-w-xl"/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-xl"/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdateAdminKeyForm className="max-w-xl"/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <DeleteUserForm className="max-w-xl"/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
