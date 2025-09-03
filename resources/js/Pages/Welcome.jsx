import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="QuizMuz" />

            {/* Header Section */}
            <div className="relative z-10 px-4 py-6 sm:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Main Title */}
                    <div className="text-center mb-8">
                        <div className="inline-block bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <span className="text-5xl sm:text-6xl">🎵</span>
                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                                    QuizMuz
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full mb-3"></div>
                            <p className="text-xl sm:text-2xl text-indigo-200 font-medium">
                                Plateforme d'apprentissage musical
                            </p>
                        </div>
                    </div>

                    {/* Navigation - Only for authenticated users */}
                    {auth.user && (
                        <nav className="flex justify-center mb-8">
                            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                                <Link
                                    href={route('course')}
                                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-emerald-400/30 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center gap-2 text-white group-hover:text-emerald-100 font-medium">
                                        <span className="text-lg">📚</span>
                                        Cours
                                    </span>
                                </Link>

                                {auth.isAdmin && (
                                    <Link
                                        href={route('admin')}
                                        className="group relative overflow-hidden bg-gradient-to-r from-purple-600/80 to-violet-600/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-400/30 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative z-10 flex items-center gap-2 text-white group-hover:text-purple-100 font-medium">
                                            <span className="text-lg">👑</span>
                                            Admin
                                        </span>
                                    </Link>
                                )}

                                <Link
                                    href={route('support')}
                                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-400/30 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center gap-2 text-white group-hover:text-blue-100 font-medium">
                                        <span className="text-lg">🆘</span>
                                        Support
                                    </span>
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="group relative overflow-hidden bg-gradient-to-r from-red-600/80 to-rose-600/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-400/30 hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-red-500/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center gap-2 text-white group-hover:text-red-100 font-medium">
                                        <span className="text-lg">🚪</span>
                                        Déconnexion
                                    </span>
                                </Link>
                            </div>
                        </nav>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-4xl w-full">
                    {auth.user ? (
                        /* Authenticated User Content */
                        <div className="bg-gradient-to-r from-slate-900/20 to-indigo-900/20 backdrop-blur-sm rounded-2xl border border-indigo-400/20 overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-6 sm:px-8 py-6 border-b border-indigo-400/20">
                                <div className="text-center">
                                    <div className="text-5xl mb-4">🎼</div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                        Bienvenue, {auth.user.first_name || 'Musicien'}!
                                    </h2>
                                    <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8">
                                <div className="prose prose-lg max-w-none text-white leading-relaxed">
                                    <p className="mb-6 text-lg">
                                        Durant les cours de littérature musicale au Conservatoire de Musique de Montréal, les étudiants explorent l'évolution de la
                                        musique à travers différentes époques en étudiant les œuvres majeures et les
                                        compositeurs influents. Ils analysent des partitions et apprennent à comprendre les
                                        styles et les techniques de composition utilisés au fil des siècles.
                                    </p>

                                    <p className="mb-6 text-lg">
                                        Les cours incluent également des tests d'écoute où les étudiants doivent reconnaître et situer une pièce musicale jouée.
                                        Ces tests permettent d'évaluer leur capacité à identifier les caractéristiques stylistiques et techniques des œuvres,
                                        ainsi qu'à associer les pièces à leur contexte historique et culturel.
                                    </p>

                                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-6 border border-emerald-400/20">
                                        <div className="flex items-start gap-4">
                                            <span className="text-3xl flex-shrink-0">🚀</span>
                                            <div>
                                                <h3 className="text-xl font-semibold text-emerald-200 mb-2">À propos de QuizMuz</h3>
                                                <p className="text-lg">
                                                    QuizMuz est une plateforme en ligne qui permet aux étudiants de pratiquer pour se préparer à ces tests.
                                                    Elle offre des quiz interactifs et un module d'entraînement qui simulent les conditions des tests d'écoute réels.
                                                    Grâce à QuizMuz, les étudiants peuvent s'exercer à reconnaître les œuvres musicales et à identifier tous leurs éléments caractéristiques,
                                                    ce qui leur permet de renforcer leurs compétences et de gagner en confiance avant les évaluations officielles.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="mt-8 text-center">
                                    <Link
                                        href={route('course')}
                                        className="group relative inline-flex items-center gap-3 overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-8 py-4 border-2 border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative z-10 text-2xl">🎯</span>
                                        <span className="relative z-10 text-xl font-bold text-white">
                                            Commencer à apprendre
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Non-authenticated User Content */
                        <div className="text-center">
                            <div className="bg-gradient-to-r from-slate-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl border border-indigo-400/20 p-8 sm:p-12 shadow-2xl">
                                <div className="text-6xl mb-6">🎭</div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                                    Accès à QuizMuz
                                </h2>
                                <p className="text-xl text-indigo-200 mb-8 leading-relaxed">
                                    Connectez-vous pour accéder à la plateforme et commencer votre parcours d'apprentissage!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href={route('login')}
                                        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl px-8 py-4 border-2 border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative z-10 text-xl">🔑</span>
                                        <span className="relative z-10 text-lg font-bold text-white">
                                            Se connecter
                                        </span>
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-8 py-4 border-2 border-blue-400/50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative z-10 text-xl">📝</span>
                                        <span className="relative z-10 text-lg font-bold text-white">
                                            S'inscrire
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl mx-4 py-4 border border-white/10">
                    <p className="text-white/80 text-sm font-medium">
                        QuizMuz v3.0.4 © 2024 - Tous droits réservés
                    </p>
                </div>
            </footer>
        </div>
    );
}
