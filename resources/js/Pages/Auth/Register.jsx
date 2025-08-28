import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

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
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Inscription - QuizMuz" />

            {/* Header Section */}
            <div className="relative z-10 px-4 py-6 sm:py-8">
                <div className="max-w-2xl mx-auto">
                    {/* App Title */}
                    <div className="text-center mb-8">
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
            <div className="flex-1 flex items-center justify-center px-4 pb-8">
                <div className="max-w-2xl w-full">
                    {/* Registration Card */}
                    <div className="bg-gradient-to-r from-slate-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-indigo-400/20 overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 sm:px-8 py-6 border-b border-blue-400/20">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="text-4xl"></span>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                        Inscription
                                    </h2>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 sm:p-8">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Personal Information Section */}
                                <div className="bg-gradient-to-r from-slate-800/20 to-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl"></span>
                                        Informations personnelles
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* First Name */}
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-semibold text-white mb-2">
                                                Prénom
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="first_name"
                                                    name="first_name"
                                                    type="text"
                                                    value={data.first_name}
                                                    autoComplete="given-name"
                                                    autoFocus
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300"
                                                    placeholder="Votre prénom"
                                                />
                                            </div>
                                            {errors.first_name && <InputError message={errors.first_name} className="mt-2" />}
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label htmlFor="last_name" className="block text-sm font-semibold text-white mb-2">
                                                Nom de famille
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="last_name"
                                                    name="last_name"
                                                    type="text"
                                                    value={data.last_name}
                                                    autoComplete="family-name"
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300"
                                                    placeholder="Votre nom de famille"
                                                />
                                            </div>
                                            {errors.last_name && <InputError message={errors.last_name} className="mt-2" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Institution Section */}
                                <div className="bg-gradient-to-r from-purple-800/20 to-indigo-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-600/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl"></span>
                                        Institution
                                    </h3>

                                    <div>
                                        <label htmlFor="institution" className="block text-sm font-semibold text-white mb-2">
                                            Sélectionnez votre institution
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <select
                                                id="institution"
                                                name="institution"
                                                value={data.institution}
                                                onChange={(e) => setData('institution', e.target.value)}
                                                required
                                                disabled={isLoadingInstitutions}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-purple-400/30 rounded-xl text-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">
                                                    {isLoadingInstitutions ? 'Chargement...' : 'Choisissez votre institution'}
                                                </option>
                                                {institutions.map((institution) => (
                                                    <option key={institution.id} value={institution.id} className="bg-slate-800 text-white">
                                                        {institution.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.institution && <InputError message={errors.institution} className="mt-2" />}
                                    </div>
                                </div>

                                {/* Account Information Section */}
                                <div className="bg-gradient-to-r from-emerald-800/20 to-teal-800/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-600/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl"></span>
                                        Informations de compte
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Username */}
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
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-white placeholder-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300"
                                                    placeholder="Choisissez un nom d'utilisateur"
                                                />
                                            </div>
                                            {errors.username && <InputError message={errors.username} className="mt-2" />}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Password */}
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
                                                        autoComplete="new-password"
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-white placeholder-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300"
                                                        placeholder="Mot de passe sécurisé"
                                                    />
                                                </div>
                                                {errors.password && <InputError message={errors.password} className="mt-2" />}
                                            </div>

                                            {/* Password Confirmation */}
                                            <div>
                                                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-white mb-2">
                                                    Confirmer le mot de passe
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        value={data.password_confirmation}
                                                        autoComplete="new-password"
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-white placeholder-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300"
                                                        placeholder="Répétez le mot de passe"
                                                    />
                                                </div>
                                                {errors.password_confirmation && <InputError message={errors.password_confirmation} className="mt-2" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Key Section */}
                                <div className="bg-gradient-to-r from-amber-800/20 to-orange-800/20 backdrop-blur-sm rounded-xl p-6 border border-amber-600/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl"></span>
                                        Clé d'accès
                                    </h3>

                                    <div>
                                        <label htmlFor="admin_password" className="block text-sm font-semibold text-white mb-2">
                                            Clé Admin
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 12H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-6.586A2 2 0 014.586 8L7 5.414A2 2 0 018.414 5H10a6 6 0 015 9.743V17a2 2 0 01-2 2H9v-4h2l2.257-2.257A6 6 0 0115 7z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="admin_password"
                                                name="admin_password"
                                                type="text"
                                                value={data.admin_password}
                                                onChange={(e) => setData('admin_password', e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-amber-400/30 rounded-xl text-white placeholder-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all duration-300"
                                                placeholder="Clé d'accès fournie par l'institution"
                                            />
                                        </div>
                                        {errors.admin_password && <InputError message={errors.admin_password} className="mt-2" />}

                                        {/* Info box */}
                                        <div className="mt-3 p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                                            <div className="flex items-start gap-2">
                                                <span className="text-amber-400 text-sm mt-0.5"></span>
                                                <p className="text-amber-200 text-xs leading-relaxed">
                                                    Cette clé vous est fournie par votre institution pour valider votre inscription. Contactez votre administrateur si vous ne la possédez pas.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {/* Register Button */}
                                    <button
                                        type="submit"
                                        disabled={processing || isLoadingInstitutions}
                                        className="group relative overflow-hidden w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-3 border border-blue-400/50 hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    <span className="text-white font-bold">Inscription en cours...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl"></span>
                                                    <span className="text-white text-lg font-bold">S'inscrire</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Login Link */}
                                    <div className="text-center">
                                        <Link
                                            href={route('login')}
                                            className="group inline-flex items-center gap-2 text-indigo-200 hover:text-indigo-100 transition-colors duration-300"
                                        >
                                            <span className="text-sm font-medium">Déjà un compte ?</span>
                                            <span className="text-sm font-bold underline decoration-2 underline-offset-2 group-hover:decoration-indigo-300">
                                                Se connecter
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
