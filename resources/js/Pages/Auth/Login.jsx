import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
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
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Connexion - QuizMuz" />

            {/* Header Section */}
            <div className="relative z-10 px-4 py-6 sm:py-8">
                <div className="max-w-md mx-auto">
                    {/* App Title */}
                    <div className="text-center">
                        <Link href={route('welcome')} className="group">
                            <div className="inline-block bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20 transition-all duration-300 group-hover:scale-105">
                                <div className="flex items-center justify-center gap-4 mb-3">
                                    <span className="text-4xl sm:text-5xl"></span>
                                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                                        QuizMuz
                                    </h1>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 w-full">
                <div className="max-w-lg w-full">
                    {/* Login Card */}
                    <div className="bg-gradient-to-r from-slate-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-indigo-400/20 overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-6 sm:px-8 py-6 border-b border-emerald-400/20">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="text-4xl"></span>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                        Connexion
                                    </h2>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 sm:p-8">
                            {/* Status Message */}
                            {status && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-900/40 to-green-900/40 backdrop-blur-sm rounded-xl border border-emerald-500/50 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✅</span>
                                        <p className="text-emerald-200 font-medium">{status}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-white mb-2">
                                        Nom d'utilisateur
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={data.username}
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('username', e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300"
                                            placeholder="Votre nom d'utilisateur"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300"
                                            placeholder="Votre mot de passe"
                                        />
                                    </div>
                                </div>

                                {/* Error Messages */}
                                {(errors.username || errors.password) && (
                                    <div className="space-y-2">
                                        <InputError message={errors.username} />
                                        <InputError message={errors.password} />
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

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative overflow-hidden w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl py-3 border border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    <span className="text-white font-bold">Connexion...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl"></span>
                                                    <span className="text-white text-lg font-bold">Se connecter</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Register Link */}
                                    <div className="text-center">
                                        <Link
                                            href={route('register')}
                                            className="group inline-flex items-center gap-2 text-indigo-200 hover:text-indigo-100 transition-colors duration-300"
                                        >
                                            <span className="text-sm font-medium">Pas encore de compte ?</span>
                                            <span className="text-sm font-bold underline decoration-2 underline-offset-2 group-hover:decoration-indigo-300">
                                                S'inscrire
                                            </span>
                                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
