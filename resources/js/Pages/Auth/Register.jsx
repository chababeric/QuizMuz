import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        password_confirmation: '',
        admin_password: '',
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            reset('password', 'password_confirmation', 'admin_password');
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />

            <h1 className="text-3xl font-bold text-center text-white hover:cursor-default">Inscription</h1>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="first_name" value="Prénom" className="text-white"/>

                    <TextInput
                        id="first_name"
                        name="first_name"
                        value={data.first_name}
                        className="login-form-field"
                        autoComplete="given-name"
                        isFocused={true}
                        onChange={(e) => setData('first_name', e.target.value)}
                        required
                    />

                    <InputError message={errors.first_name} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="last_name" value="Nom de famille" className="text-white"/>

                    <TextInput
                        id="last_name"
                        name="last_name"
                        value={data.last_name}
                        className="login-form-field"
                        autoComplete="family-name"
                        onChange={(e) => setData('last_name', e.target.value)}
                        required
                    />

                    <InputError message={errors.last_name} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="username" value="Nom d'utilisateur" className="text-white"/>

                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        className="login-form-field"
                        autoComplete="username"
                        onChange={(e) => setData('username', e.target.value)}
                        required
                    />

                    <InputError message={errors.username} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mot de passe" className="text-white"/>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="login-form-field"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmation mot de passe" className="text-white"/>

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="login-form-field"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="admin_password" value="Clé Admin" className="text-white"/>

                    <TextInput
                        id="admin_password"
                        type="password"
                        name="admin_password"
                        value={data.admin_password}
                        className="login-form-field"
                        onChange={(e) => setData('admin_password', e.target.value)}
                        required
                    />

                    <InputError message={errors.admin_password} className="mt-2"/>
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('login')}
                        className="underline text-sm text-white hover:text-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Déjà inscrit ? Connectez-vous
                    </Link>

                    <PrimaryButton className="ms-4 bg-rose-600 hover:bg-rose-800" disabled={processing}>
                        Inscription
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
