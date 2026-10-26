import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { AuthField, AuthLayout, AuthSubmit, AuthSwitchLink, authInput } from '@/Components/AuthUi';
import { BuildingIcon, CircleAlertIcon, KeyIcon, LockIcon, ShieldCheckIcon, UserIcon, UserPlusIcon } from '@/Components/AppIcons';

const sectionTitle = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]';

const FormSection = ({ title, children }) => (
    <fieldset className="flex flex-col gap-4 border-t border-white/[0.08] pt-5 first:border-t-0 first:pt-0">
        <legend className={`float-left w-full mb-1 ${sectionTitle}`}>{title}</legend>
        {children}
    </fieldset>
);

export default function Register() {
    const [institutions, setInstitutions] = useState([]);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        institution: '',
        username: '',
        password: '',
        password_confirmation: '',
        admin_password: '',
    });

    useEffect(() => {
        getInstitutions();
    }, []);

    const getInstitutions = () => {
        setIsLoadingInstitutions(true);
        axios.get(route('allInstitutions'))
            .then(response => {
                setInstitutions(response.data);
            })
            .catch(error => {
                console.error('Error fetching institutions:', error);
            })
            .finally(() => {
                setIsLoadingInstitutions(false);
            });
    };

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
        <AuthLayout headTitle="Inscription - QuizMuz" title="Inscription" maxWidth="max-w-2xl">
            <h2 className="mt-6 text-[32px] md:text-[36px] font-bold leading-tight">Inscription</h2>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-6">
                <FormSection title="Informations personnelles">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AuthField id="first_name" label="Prénom" icon={UserIcon} error={errors.first_name}>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={data.first_name}
                                autoComplete="given-name"
                                autoFocus
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                                className={authInput}
                                placeholder="Votre prénom"
                            />
                        </AuthField>

                        <AuthField id="last_name" label="Nom de famille" icon={UserIcon} error={errors.last_name}>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={data.last_name}
                                autoComplete="family-name"
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                className={authInput}
                                placeholder="Votre nom de famille"
                            />
                        </AuthField>
                    </div>
                </FormSection>

                <FormSection title="Institution">
                    <AuthField id="institution" label="Sélectionnez votre institution" icon={BuildingIcon} error={errors.institution}>
                        <select
                            id="institution"
                            name="institution"
                            value={data.institution}
                            onChange={(e) => setData('institution', e.target.value)}
                            required
                            disabled={isLoadingInstitutions}
                            className={`${authInput} cursor-pointer`}
                        >
                            <option value="" className="bg-[#0B0D18] text-[#F2F3F8]">
                                {isLoadingInstitutions ? 'Chargement...' : 'Choisissez votre institution'}
                            </option>
                            {institutions.map((institution) => (
                                <option key={institution.id} value={institution.id} className="bg-[#0B0D18] text-[#F2F3F8]">
                                    {institution.name}
                                </option>
                            ))}
                        </select>
                    </AuthField>
                </FormSection>

                <FormSection title="Informations de compte">
                    <AuthField id="username" label="Nom d'utilisateur" icon={UserIcon} error={errors.username}>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={data.username}
                            autoComplete="username"
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            className={authInput}
                            placeholder="Choisissez un nom d'utilisateur"
                        />
                    </AuthField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AuthField id="password" label="Mot de passe" icon={LockIcon} error={errors.password}>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={data.password}
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className={authInput}
                                placeholder="Mot de passe sécurisé"
                            />
                        </AuthField>

                        <AuthField id="password_confirmation" label="Confirmer le mot de passe" icon={ShieldCheckIcon} error={errors.password_confirmation}>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className={authInput}
                                placeholder="Répétez le mot de passe"
                            />
                        </AuthField>
                    </div>
                </FormSection>

                <FormSection title="Clé d'accès">
                    <AuthField id="admin_password" label="Clé Admin" icon={KeyIcon} error={errors.admin_password}>
                        <input
                            id="admin_password"
                            name="admin_password"
                            type="text"
                            value={data.admin_password}
                            onChange={(e) => setData('admin_password', e.target.value)}
                            required
                            aria-describedby="admin-password-help"
                            className={authInput}
                            placeholder="Clé d'accès fournie par l'institution"
                        />
                    </AuthField>
                    <p id="admin-password-help" className="flex items-start gap-2 rounded-[14px] border border-[rgba(242,185,75,0.3)] bg-[rgba(242,185,75,0.08)] px-4 py-3 text-[14px] leading-relaxed text-[#C9CCDA]">
                        <CircleAlertIcon className="w-4 h-4 mt-0.5 text-[#F2B94B]"/>
                        Cette clé vous est fournie par votre institution pour valider votre inscription. Contactez votre administrateur si vous ne la possédez pas.
                    </p>
                </FormSection>

                <div className="flex flex-col gap-2">
                    <AuthSubmit
                        processing={processing}
                        disabled={isLoadingInstitutions}
                        label="S'inscrire"
                        processingLabel="Inscription en cours..."
                        icon={UserPlusIcon}
                    />
                    <AuthSwitchLink href={route('login')} prompt="Déjà un compte ?" label="Se connecter"/>
                </div>
            </form>
        </AuthLayout>
    );
}
