import { useRef, useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { AdminDialog, AdminField, AdminInput, SavedNote, SectionCard, buttonDanger, buttonSecondary } from '@/Components/AdminUi';

export default function DeleteUserForm({ className = '' }) {
    const { flash, errors: pageErrors } = usePage().props;
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [recentlyUpdated, setRecentlyUpdated] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
        usernameToDelete: '',
    });

    // Check for flash data
    useEffect(() => {
        if (flash.userToDelete) {
            setUserToDelete(flash.userToDelete);
            setConfirmingUserDeletion(true);
        }
    }, [flash]);

    const deleteUser = (e) => {
        e.preventDefault();

        post(route('admin.delete-user'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                setRecentlyUpdated(true);
                setTimeout(() => setRecentlyUpdated(false), 3000);
                reset('password', 'usernameToDelete');
                setUserToDelete(null);
                setConfirmingUserDeletion(false);
                setData('usernameToDelete', '');
                // Reset the password input field
                if (passwordInput.current) {
                    passwordInput.current.value = '';
                }
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current.focus();
                    setData('password', '');
                }
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('user-find'), {
            preserveScroll: true,
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <SectionCard id="delete-account-title" title="Suppression de compte" description="Supprimer définitivement le compte d'un utilisateur." className={className}>
            <form onSubmit={submit} className="grid grid-cols-1 items-start gap-5 p-5 md:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <p>
                        Une fois un compte est supprimé, toutes ses données seront définitivement supprimées. Veuillez entrer
                        le <strong>nom d'utilisateur</strong> du compte à supprimer.
                    </p>
                    <p className="mt-2">
                        Attention, vous pouvez seulement supprimer des comptes de votre <strong>institution</strong>.
                    </p>
                </div>

                <div className="flex flex-col gap-5">
                    <AdminField id="usernameToDelete" label="Nom d'utilisateur" error={pageErrors.usernameToDelete || errors.usernameToDelete}>
                        <AdminInput
                            id="usernameToDelete"
                            value={data.usernameToDelete}
                            onChange={(e) => setData('usernameToDelete', e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </AdminField>

                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={processing} className={buttonDanger}>Supprimer</button>
                        <SavedNote show={recentlyUpdated}>Compte supprimé.</SavedNote>
                    </div>
                </div>
            </form>

            <AdminDialog
                show={confirmingUserDeletion}
                onClose={closeModal}
                title="Supprimer ce compte ?"
                actions={<>
                    <button type="button" onClick={closeModal} className={buttonSecondary}>Annuler</button>
                    <button type="submit" form="delete-user-form" disabled={processing} className={buttonDanger}>Supprimer le compte</button>
                </>}
            >
                <form id="delete-user-form" onSubmit={deleteUser} className="flex flex-col gap-4">
                    <p>
                        Êtes-vous sûr de vouloir supprimer le compte <strong className="text-gray-900 dark:text-white">{userToDelete?.username}</strong> de <strong className="text-gray-900 dark:text-white">{userToDelete?.first_name} {userToDelete?.last_name}</strong> ?
                    </p>
                    <p>Pour confirmer la suppression de ce compte, veuillez entrer votre mot de passe.</p>
                    <p className="font-medium text-red-600 dark:text-red-400">Attention, cette action est irréversible.</p>

                    <AdminField id="delete_password" label="Votre mot de passe" error={errors.password}>
                        <AdminInput
                            id="delete_password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            autoFocus
                            required
                        />
                    </AdminField>
                </form>
            </AdminDialog>
        </SectionCard>
    );
}
