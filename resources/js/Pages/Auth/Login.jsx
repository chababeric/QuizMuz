import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            reset('password');
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Connexion"/>

            <h1 className="text-3xl font-bold text-center text-white hover:cursor-default">Connexion</h1>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Nom d'utilisateur" className="text-white"/>

                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        className="login-form-field"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                        required
                    />

                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mot de passe" className="text-white"/>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="login-form-field"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.username} className="mt-4"/>
                    <InputError message={errors.password} className="mt-4"/>
                </div>

                {/*<div className="block mt-4">*/}
                {/*    <label className="flex items-center">*/}
                {/*        <Checkbox*/}
                {/*            name="remember"*/}
                {/*            checked={data.remember}*/}
                {/*            onChange={(e) => setData('remember', e.target.checked)}*/}
                {/*        />*/}
                {/*        <span className="ms-2 text-sm text-white">Se rappeler de moi</span>*/}
                {/*    </label>*/}
                {/*</div>*/}

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('register')}
                        className="underline text-sm text-white hover:text-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Inscription?
                    </Link>

                    <PrimaryButton className="ms-4 bg-rose-600 hover:bg-rose-800" disabled={processing}>
                        Connexion
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
