import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AdminLayout from "../Layouts/AdminLayout";
import Overview from "@/Pages/Overview.jsx";
import ModifyUsername from "@/Pages/ModifyUsername.jsx";
import ModifyPassword from "@/Pages/ModifyPassword.jsx";
import ModifyPiece from "@/Pages/ModifyPiece.jsx";
import AddPiece from "@/Pages/AddPiece.jsx";
import AddAdmin from "@/Pages/AddAdmin.jsx";
import AddLevel from "@/Pages/AddLevel.jsx";
import DeleteAccount from "@/Pages/DeleteAccount.jsx";
import ManageInstitution from "@/Pages/ManageInstitution.jsx";
import LevelAccess from "@/Pages/LevelAccess.jsx";
import ResetScores from "@/Pages/ResetScores.jsx";
import ModifyAdminKey from "@/Pages/ModifyAdminKey.jsx";

export default function AdminControl({ auth }) {
    const { flash } = usePage().props;
    const [selectedComponent, setSelectedComponent] = useState(null);

    /**
     * Updates the last action time by making an API call to the backend.
     */
    const updateLastActionTime = () => {
        axios.post('/update-last-action-time')
            .then(response => {})
            .catch(error => {
                console.error('Error updating last action time:', error);
            });
    };

    const renderComponent = () => {
        updateLastActionTime();
        switch (selectedComponent) {
            case 'Overview':
                return <Overview />;
            case 'ModifyUsername':
                return <ModifyUsername flash={flash} updateLastActionTime={updateLastActionTime} />;
            case 'ModifyPassword':
                return <ModifyPassword updateLastActionTime={updateLastActionTime} />;
            case 'ModifyPiece':
                return <ModifyPiece />;
            case 'AddPiece':
                return <AddPiece updateLastActionTime={updateLastActionTime}/>;
            case 'AddAdmin':
                return <AddAdmin auth={auth} updateLastActionTime={updateLastActionTime} />;
            case 'AddLevel':
                return <AddLevel updateLastActionTime={updateLastActionTime} />;
            case 'DeleteAccount':
                return <DeleteAccount updateLastActionTime={updateLastActionTime} />;
            case 'ManageInstitution':
                return <ManageInstitution updateLastActionTime={updateLastActionTime} />;
            case 'LevelAccess':
                return <LevelAccess updateLastActionTime={updateLastActionTime} />;
            case 'ResetScores':
                return <ResetScores updateLastActionTime={updateLastActionTime} />;
            case 'ModifyAdminKey':
                return <ModifyAdminKey updateLastActionTime={updateLastActionTime} auth={auth} />;

            default:
                return <Overview />;
        }
    };

    return (
        <AdminLayout setSelectedComponent={setSelectedComponent}>
            <Head title="Admin - QuizMuz" />
            {renderComponent()}
        </AdminLayout>
    );
}
