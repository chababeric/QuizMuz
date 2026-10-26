import { useRef, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary, buttonSecondary, muted } from '@/Components/AdminUi';

export default function UpdateAdminKeyForm({ className = '' }) {
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

        post(route('admin_key.validate'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('key');
                setData({
                    key: '',
                    newKey: data.newKey,
                    userPassword: data.userPassword,
                });
                setRecentlyValidated(true);
                setTimeout(() => setRecentlyValidated(false), 3000); // Clear message after 3 seconds
            },
            onError: (errors) => {
                if (errors.key) {
                    reset('key');
                }
                setData({
                    key: '',
                    newKey: data.newKey,
                    userPassword: data.userPassword,
                });
            },
        });
    };

    const updateKey = (e) => {
        e.preventDefault();

        post(route('admin_key.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('newKey');
                reset('userPassword');
                setData({
                    key: '',
                    newKey: '',
                    userPassword: '',
                });
                setRecentlyUpdated(true);
                setTimeout(() => setRecentlyUpdated(false), 3000); // Clear message after 3 seconds
            },
            onError: (errors) => {
                reset('newKey');
                reset('userPassword');
                setData({
                    key: data.key,
                    newKey: '',
                    userPassword: '',
                });
            },
        });
    };

    return (
        <SectionCard id="admin-key-title" title="Clé d'administrateur" description="Modifier la clé d'administrateur." className={className}>
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <div className="grid flex-1 grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-gray-700">
                <form onSubmit={validateKey} className="flex flex-col gap-5 p-5">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Vérifier la clé actuelle</h3>
                        <p className={`mt-1 text-sm ${muted}`}>
                            Pour des raisons de sécurité, la clé d'administrateur ne peut pas être affichée à cause de son chiffrement.
                            Cependant, vous pouvez la vérifier en la saisissant dans le champ ci-dessous.
                        </p>
                    </div>

                    <AdminField id="key" label="Clé admin à vérifier" error={errors.key}>
                        <AdminInput
                            id="key"
                            ref={confirmationKey}
                            value={data.key}
                            onChange={(e) => setData('key', e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </AdminField>

                    <div className="mt-auto flex items-center gap-4 pt-1">
                        <button type="submit" disabled={processing} className={buttonSecondary}>Vérifier</button>
                        <SavedNote show={recentlyValidated}>Clé correcte.</SavedNote>
                    </div>
                </form>

                {/* Key Update Form */}
                <form onSubmit={updateKey} className="flex flex-col gap-5 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Définir une nouvelle clé</h3>

                    <AdminField id="newKey" label="Nouvelle clé admin" error={errors.newKey}>
                        <AdminInput
                            id="newKey"
                            ref={newKey}
                            value={data.newKey}
                            onChange={(e) => setData('newKey', e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </AdminField>

                    <AdminField id="userPassword" label={`Mot de passe de ${user.username}`} error={errors.userPassword}>
                        <AdminInput
                            id="userPassword"
                            ref={userPassword}
                            value={data.userPassword}
                            onChange={(e) => setData('userPassword', e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </AdminField>

                    <div className="mt-auto flex items-center gap-4 pt-1">
                        <button type="submit" disabled={processing} className={buttonPrimary}>Sauvegarder</button>
                        <SavedNote show={recentlyUpdated}>Clé sauvegardée.</SavedNote>
                    </div>
                </form>
            </div>
        </SectionCard>
    );
}
