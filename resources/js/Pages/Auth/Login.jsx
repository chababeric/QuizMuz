import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import { useForm } from '@inertiajs/react';
import { AuthField, AuthLayout, AuthSubmit, AuthSwitchLink, FieldError, authInput } from '@/Components/AuthUi';
import { CircleCheckIcon, LockIcon, LogInIcon, UserIcon } from '@/Components/AppIcons';

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
        <AuthLayout headTitle="Connexion - QuizMuz" title="Connexion">
            <h2 className="mt-6 text-[32px] md:text-[36px] font-bold leading-tight">Connexion</h2>

            {/* Status Message */}
            {status && (
                <p role="status" className="mt-4 flex items-center gap-2 rounded-[14px] border border-[rgba(30,158,98,0.4)] bg-[rgba(30,158,98,0.1)] px-4 py-3 text-[15px] font-medium text-[#5FD39A]">
                    <CircleCheckIcon className="w-5 h-5"/>
                    {status}
                </p>
            )}

            <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
                <AuthField id="username" label="Nom d'utilisateur" icon={UserIcon}>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={data.username}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('username', e.target.value)}
                        required
                        className={authInput}
                        placeholder="Votre nom d'utilisateur"
                    />
                </AuthField>

                <AuthField id="password" label="Mot de passe" icon={LockIcon}>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        className={authInput}
                        placeholder="Votre mot de passe"
                    />
                </AuthField>

                {/* Error Messages */}
                {(errors.username || errors.password) && (
                    <div className="flex flex-col gap-2">
                        <FieldError message={errors.username}/>
                        <FieldError message={errors.password}/>
                    </div>
                )}

                {/* Remember Me - Uncommented and styled */}
                {/*<div className="flex items-center">*/}
                {/*    <label className="flex items-center cursor-pointer group">*/}
                {/*        <Checkbox*/}
                {/*            name="remember"*/}
                {/*            checked={data.remember}*/}
                {/*            onChange={(e) => setData('remember', e.target.checked)}*/}
                {/*        />*/}
                {/*        <span className="ml-3 text-sm text-indigo-200 group-hover:text-indigo-100 transition-colors duration-300">*/}
                {/*            Se rappeler de moi*/}
                {/*        </span>*/}
                {/*    </label>*/}
                {/*</div>*/}

                <div className="mt-1 flex flex-col gap-2">
                    <AuthSubmit processing={processing} label="Se connecter" processingLabel="Connexion..." icon={LogInIcon}/>
                    <AuthSwitchLink href={route('register')} prompt="Pas encore de compte ?" label="S'inscrire"/>
                </div>
            </form>
        </AuthLayout>
    );
}
