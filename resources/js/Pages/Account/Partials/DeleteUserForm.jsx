import { useRef, useState, useEffect } from 'react';
import DangerButton from '@/Components/DangerButton.jsx';
import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import Modal from '@/Components/Modal.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import TextInput from '@/Components/TextInput.jsx';
import { useForm, usePage } from '@inertiajs/react';
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import {Transition} from "@headlessui/react";

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
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Suppression de compte</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-white">
                    Une fois un compte est supprimé, toutes ses données seront définitivement supprimées. Veuillez entrer
                    le <strong>nom d'utilisateur</strong> du compte à supprimer.
                    <br/><br/>
                    Attention, vous pouvez seulement supprimer des comptes de votre <strong>institution</strong>.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="usernameToDelete" value="Nom d'utilisateur" className="dark:text-white"/>

                    <TextInput
                        id="usernameToDelete"
                        value={data.usernameToDelete}
                        onChange={(e) => setData('usernameToDelete', e.target.value)}
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="usernameToDelete"
                        required
                    />

                    <InputError message={pageErrors.usernameToDelete || errors.usernameToDelete} className="mt-2"/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Supprimer</PrimaryButton>

                    <Transition
                        show={recentlyUpdated}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-500">Compte supprimé.</p>
                    </Transition>
                </div>
            </form>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Êtes-vous sûr de vouloir supprimer le compte <strong>{userToDelete?.username}</strong> de <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?
                    </h2>

                    <div className="mt-1 text-sm text-gray-600 dark:text-white">
                        Pour confirmer la suppression de ce compte, veuillez entrer votre mot de passe.
                        <br/><br/>

                        <p className="text-red-600">Attention, cette action est irréversible.</p>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only dark:text-white"/>

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4 dark:text-white dark:bg-gray-800"
                            isFocused
                            placeholder="Mot de passe"
                            required
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Annuler</SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Supprimer le compte
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
