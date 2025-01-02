import { useRef } from 'react';
import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import TextInput from '@/Components/TextInput.jsx';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '', updateLastActionTime }) {
    const passwordInput = useRef();
    const usernameInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        username: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        updateLastActionTime();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.username) {
                    reset('username');
                    usernameInput.current.focus();
                }
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mot de passe</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-white">
                    Modifier le mot de passe d'un compte.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="username" value="Nom d'utilisateur" className="dark:text-white"/>

                    <TextInput
                        id="username"
                        ref={usernameInput}
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="username"
                        required
                    />

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nouveau mot de passe" className="dark:text-white"/>

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="new-password"
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" className="dark:text-white"/>

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="new-password dark:text-white dark:bg-gray-800"
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Sauvegarder</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-500">Sauvegardé.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
