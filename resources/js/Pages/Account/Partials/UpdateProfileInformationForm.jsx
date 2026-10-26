import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary } from '@/Components/AdminUi';

export default function UpdateProfileInformation({ className = '' }) {
    // const user = usePage().props.auth.user;

    const { data, setData, patch, reset, errors, processing, recentlySuccessful } = useForm({
        old_username: '',
        new_username: '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('admin.update-username'), {
            onSuccess: () => {
                reset();
                setData({
                    old_username: '',
                    new_username: '',
                });
            },
        });
    };

    return (
        <SectionCard id="username-title" title="Nom d'utilisateur" description="Modifier le nom d'utilisateur d'un compte." className={className}>
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={submit} className="flex flex-1 flex-col gap-5 p-5">
                <AdminField id="old_username" label="Nom d'utilisateur actuel" error={errors.old_username}>
                    <AdminInput
                        id="old_username"
                        value={data.old_username}
                        onChange={(e) => setData('old_username', e.target.value)}
                        required
                        autoComplete="off"
                    />
                </AdminField>

                <AdminField id="new_username" label="Nouveau nom d'utilisateur" error={errors.new_username}>
                    <AdminInput
                        id="new_username"
                        value={data.new_username}
                        onChange={(e) => setData('new_username', e.target.value)}
                        required
                        autoComplete="off"
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
