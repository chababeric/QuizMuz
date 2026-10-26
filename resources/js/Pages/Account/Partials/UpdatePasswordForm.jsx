import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary } from '@/Components/AdminUi';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const usernameInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        username: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setData({
                    username: '',
                    password: '',
                    password_confirmation: '',
                });
            },
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
        <SectionCard id="password-title" title="Mot de passe" description="Modifier le mot de passe d'un compte." className={className}>
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={updatePassword} className="flex flex-1 flex-col gap-5 p-5">
                <AdminField id="username" label="Nom d'utilisateur" error={errors.username}>
                    <AdminInput
                        id="username"
                        ref={usernameInput}
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        autoComplete="off"
                        required
                    />
                </AdminField>

                <AdminField id="password" label="Nouveau mot de passe" error={errors.password}>
                    <AdminInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                </AdminField>

                <AdminField id="password_confirmation" label="Confirmer le mot de passe" error={errors.password_confirmation}>
                    <AdminInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                </AdminField>

                <div className="mt-auto flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className={buttonPrimary}>Sauvegarder</button>
                    <SavedNote show={recentlySuccessful}>Sauvegardé.</SavedNote>
                </div>
            </form>
        </SectionCard>
    );
}
