import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import {Transition} from "@headlessui/react";

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [recentlyUpdated, setRecentlyUpdated] = useState(false);
    const [customErrors, setCustomErrors] = useState({});
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

    const deleteUser = (e) => {
        e.preventDefault();

        post(route('admin.delete-user'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                setRecentlyUpdated(true);
                setTimeout(() => setRecentlyUpdated(false), 3000);
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current.focus();
                    setData('password', '');
                }
            },
        });
    };

    const submit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(route('user.find'), {
                usernameToDelete: data.usernameToDelete,
            });

            if (response.data.error) {
                setData('usernameToDelete', '');
                setCustomErrors({ usernameToDelete: response.data.error });
            } else {
                setUserToDelete(response.data.user);
                setConfirmingUserDeletion(true);
                setCustomErrors({});
            }
        } catch (error) {
            if (error.response) {
                setCustomErrors({ usernameToDelete: error.response.data.error });
            } else {
                console.error("An unexpected error occurred.");
            }
        }
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Suppression de compte</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Une fois un compte est supprimé, toutes ses données seront définitivement supprimées. Veuillez entrer
                    le <strong>nom d'utilisateur</strong> du compte à supprimer.
                    <br/><br/>
                    Attention, vous pouvez seulement supprimer des comptes de votre <strong>institution</strong>.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="usernameToDelete" value="Nom d'utilisateur"/>

                    <TextInput
                        id="usernameToDelete"
                        value={data.usernameToDelete}
                        onChange={(e) => setData('usernameToDelete', e.target.value)}
                        className="mt-1 block w-full"
                        autoComplete="usernameToDelete"
                        required
                    />

                    <InputError message={customErrors.usernameToDelete || errors.usernameToDelete} className="mt-2"/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Supprimer</PrimaryButton>

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
                    <h2 className="text-lg font-medium text-gray-900">
                        Êtes-vous sûr de vouloir supprimer le compte <strong>{userToDelete?.username}</strong> de <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?
                    </h2>

                    <div className="mt-1 text-sm text-gray-600">
                        Pour confirmer la suppression de ce compte, veuillez entrer votre mot de passe.
                        <br/><br/>

                        <p className="text-red-600">Attention, cette action est irréversible.</p>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
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
