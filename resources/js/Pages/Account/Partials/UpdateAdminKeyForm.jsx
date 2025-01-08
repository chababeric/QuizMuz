import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateAdminKeyForm({ className = '', updateLastActionTime }) {
    const user = usePage().props.auth.user;
    const newKey = useRef();
    const confirmationKey = useRef();
    const userPassword = useRef();

    const [recentlyValidated, setRecentlyValidated] = useState(false);
    const [recentlyUpdated, setRecentlyUpdated] = useState(false);

    const { data, setData, errors, post, reset, processing } = useForm({
        key: '',
        newKey: '',
        userPassword: '',
    });

    const validateKey = (e) => {
        e.preventDefault();
        updateLastActionTime();

        post(route('admin_key.validate'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('key');
                setRecentlyValidated(true);
                setTimeout(() => setRecentlyValidated(false), 3000); // Clear message after 3 seconds
            },
            onError: (errors) => {
                if (errors.key) {
                    reset('key');
                }
            },
        });
    };

    const updateKey = (e) => {
        e.preventDefault();
        updateLastActionTime();

        post(route('admin_key.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('newKey');
                reset('userPassword');
                setRecentlyUpdated(true);
                setTimeout(() => setRecentlyUpdated(false), 3000); // Clear message after 3 seconds
            },
            onError: (errors) => {
                reset('newKey');
                reset('userPassword');
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Clé d'administrateur</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-white">
                    Modifier la clé d'administrateur.
                </p>
            </header>

            <form onSubmit={validateKey} className="mt-6 space-y-6">
                <p className="text-sm text-gray-800 dark:text-white">
                    Pour des raisons de sécurité, la clé d'administrateur ne peut pas être affichée à cause de son chiffrement.
                    Cependant, vous pouvez la vérifier en la saisissant dans le champ ci-dessous.
                </p>
                <div>
                    <InputLabel htmlFor="key" value="Clé admin à vérifier" className="dark:text-white"/>

                    <TextInput
                        id="key"
                        ref={confirmationKey}
                        value={data.key}
                        onChange={(e) => setData('key', e.target.value)}
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="key"
                        required
                    />

                    <InputError className="mt-2" message={errors.key}/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Vérifier</PrimaryButton>

                    <Transition
                        show={recentlyValidated}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-500">Clé correcte.</p>
                    </Transition>
                </div>
            </form>

            {/* Key Update Form */}
            <form onSubmit={updateKey} className="mt-10 space-y-6">
                <div>
                    <InputLabel htmlFor="newKey" value="Nouvelle clé admin" className="dark:text-white"/>

                    <TextInput
                        id="newKey"
                        ref={newKey}
                        value={data.newKey}
                        onChange={(e) => setData('newKey', e.target.value)}
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="newKey"
                        required
                    />

                    <InputError className="mt-2" message={errors.newKey}/>
                </div>

                <div>
                    <InputLabel htmlFor="userPassword" value={`Mot de passe de ${user.username}`} className="dark:text-white"/>

                    <TextInput
                        id="userPassword"
                        ref={userPassword}
                        value={data.userPassword}
                        onChange={(e) => setData('userPassword', e.target.value)}
                        type="password"
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        autoComplete="password"
                        required
                    />

                    <InputError className="mt-2" message={errors.userPassword}/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Sauvegarder</PrimaryButton>

                    <Transition
                        show={recentlyUpdated}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-500">Clé sauvegardée.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
