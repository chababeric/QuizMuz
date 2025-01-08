import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import UpdateProfileInformationForm from "@/Pages/Account/Partials/UpdateProfileInformationForm.jsx";
import UpdatePasswordForm from "@/Pages/Account/Partials/UpdatePasswordForm.jsx";
import DeleteUserForm from "@/Pages/Account/Partials/DeleteUserForm.jsx";
import UpdateAdminKeyForm from "@/Pages/Account/Partials/UpdateAdminKeyForm.jsx";

export default function Edit({ auth, user }) {
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Compte</h2>}
        >
            <Head title="Admin - Compte" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdateProfileInformationForm className="max-w-xl dark:bg-gray-800" updateLastActionTime={updateLastActionTime}/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl dark:bg-gray-800" updateLastActionTime={updateLastActionTime}/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdateAdminKeyForm className="max-w-xl dark:bg-gray-800" updateLastActionTime={updateLastActionTime}/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <DeleteUserForm className="max-w-xl dark:bg-gray-800" updateLastActionTime={updateLastActionTime}/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
