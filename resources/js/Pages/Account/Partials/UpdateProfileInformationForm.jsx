import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import TextInput from '@/Components/TextInput.jsx';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ className = '', updateLastActionTime }) {
    // const user = usePage().props.auth.user;

    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        old_username: '',
        new_username: '',
    });

    const submit = (e) => {
        e.preventDefault();
        updateLastActionTime();

        patch(route('admin.update-username'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Nom d'utilisateur</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-white">
                    Modifier le nom d'utilisateur d'un compte.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nom d'utilisateur actuel" className="dark:text-white"/>

                    <TextInput
                        id="old_username"
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        value={data.old_username}
                        onChange={(e) => setData('old_username', e.target.value)}
                        required
                        isFocused
                        autoComplete="old_username"
                    />

                    <InputError className="mt-2" message={errors.old_username} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Nouveau nom d'utilisateur" className="dark:text-white"/>

                    <TextInput
                        id="new_username"
                        className="mt-1 block w-full dark:text-white dark:bg-gray-800"
                        value={data.new_username}
                        onChange={(e) => setData('new_username', e.target.value)}
                        required
                        autoComplete="new_username"
                    />

                    <InputError className="mt-2" message={errors.new_username} />
                </div>

                {/*{mustVerifyEmail && user.email_verified_at === null && (*/}
                {/*    <div>*/}
                {/*        <p className="text-sm mt-2 text-gray-800">*/}
                {/*            Your email address is unverified.*/}
                {/*            <Link*/}
                {/*                href={route('verification.send')}*/}
                {/*                method="post"*/}
                {/*                as="button"*/}
                {/*                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"*/}
                {/*            >*/}
                {/*                Click here to re-send the verification email.*/}
                {/*            </Link>*/}
                {/*        </p>*/}

                {/*        {status === 'verification-link-sent' && (*/}
                {/*            <div className="mt-2 font-medium text-sm text-green-600">*/}
                {/*                A new verification link has been sent to your email address.*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*)}*/}

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
