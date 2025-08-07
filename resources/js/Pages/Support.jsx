import React from "react";
import { Link, Head } from '@inertiajs/react';

export default function Support() {
    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Support - QuizMuz"/>

            {/* Header Section */}
            <div className="relative w-full mt-2 mb-8 px-4">
                {/* Back Button - Above title on mobile, beside on desktop */}
                <div className="flex justify-start mb-4 sm:mb-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2 sm:z-10">
                    <Link
                        href={route('welcome')}
                        className="group"
                    >
                        <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-blue-500/30">
                            <div className="flex items-center gap-2 text-white group-hover:text-blue-200">
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-sm font-medium">Retour à l'accueil</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Title - Centered */}
                <div className="flex justify-center">
                    <div className="text-center">
                        <div className="inline-block bg-gradient-to-r from-blue-900/90 via-cyan-900/90 to-blue-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">🆘</span>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                                    Support
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full">
                    <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm rounded-2xl border border-blue-400/20 overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 px-6 sm:px-8 py-6 border-b border-blue-400/20">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Besoin d'aide?
                                </h2>
                                <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Email Contact */}
                            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-xl border border-emerald-400/20 p-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl flex-shrink-0">📧</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold text-white mb-3">Contact par e-mail</h3>
                                        <p className="text-white text-lg leading-relaxed">
                                            Pour toute question, problème ou suggestion, veuillez&nbsp;
                                            <a
                                                href="mailto:chababeric@quizmuz.com"
                                                className="text-emerald-400 hover:text-emerald-300 underline decoration-2 underline-offset-2 transition-colors duration-300 font-medium break-all"
                                            >
                                                me contacter
                                            </a>
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email Copy */}
                            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl border border-amber-400/20 p-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl flex-shrink-0">📋</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold text-white mb-3">Adresse e-mail</h3>
                                        <p className="text-white text-lg leading-relaxed mb-3">
                                            Si le lien ci-dessus ne fonctionne pas, vous pouvez copier l'adresse e-mail suivante:
                                        </p>
                                        <div className="bg-black/30 rounded-lg px-4 py-3 border border-amber-400/30">
                                            <span className="text-amber-400 font-mono text-lg font-medium break-all">
                                                chababeric@quizmuz.com
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Networks */}
                            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl border border-purple-400/20 p-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl flex-shrink-0">🌐</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold text-white mb-3">Réseaux sociaux</h3>
                                        <p className="text-white text-lg leading-relaxed">
                                            Vous pouvez également me contacter par Mio ou n'importe quel réseau social.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Spacing */}
            <div className="h-8"></div>
        </div>
    );
}
