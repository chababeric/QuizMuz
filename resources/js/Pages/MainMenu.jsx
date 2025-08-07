
import { Link, Head, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MainMenu({ auth }) {
    const { levels } = usePage().props;
    const { courseId } = usePage().props;
    const { courseName } = usePage().props;
    const [selectedLevel, setSelectedLevel] = useState(auth.user.last_level);

    useEffect(() => {
        const currentLevel = levels.find(level => level.id === selectedLevel);
        if (!currentLevel || !currentLevel.is_enabled) {
            const firstEnabledLevel = levels.find(level => level.is_enabled);
            if (firstEnabledLevel) {
                setSelectedLevel(firstEnabledLevel.id);
            }
        }
    }, [levels, selectedLevel]);

    useEffect(() => {
        if (auth.user.last_level !== selectedLevel) {
            axios.post(route('updateLastLevel'), {
                level: selectedLevel,
                userId: auth.user.id
            }).then(r => {}
            ).catch(e => {
                console.error("There was an error updating the last level!", e);
            });
        }
    }, [selectedLevel]);

    useEffect(() => {
        localStorage.removeItem("game_key");
    }, []);

    return (
        <div className="main-app min-h-screen flex flex-col">
            <div className="background-container"></div>
            <Head title="Menu Principal - QuizMuz"/>

            {/* Header Section */}
            <div className="text-center py-6 sm:py-8 relative z-10 px-4">
                <div className="inline-block bg-gradient-to-r from-rose-900/90 via-purple-900/90 to-rose-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 shadow-2xl border border-white/20 max-w-[95vw] sm:max-w-none">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-white via-rose-200 to-white bg-clip-text text-transparent">
                        Menu Principal
                    </h1>
                    <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded-full mb-2 sm:mb-3 lg:mb-4"></div>
                    <h2 className="text-lg sm:text-2xl font-semibold text-rose-100">
                        {courseName}
                    </h2>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex-1 max-w-6xl mx-auto w-full px-6 pb-8">

                {/* Level Selection Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-4xl">🎯</span>
                            <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                                Sélectionnez votre niveau
                            </h3>
                        </div>
                        <div className="h-1 w-32 bg-gradient-to-r from-purple-400 via-rose-400 to-purple-400 rounded-full mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-4 max-w-4xl mx-auto">
                        {levels.map(level => (
                            <button
                                key={level.id}
                                className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-105 w-full lg:w-48 ${
                                    level.is_enabled
                                        ? selectedLevel === level.id
                                            ? 'bg-gradient-to-br from-rose-500 to-purple-600 shadow-2xl shadow-rose-500/50 border-2 border-rose-300'
                                            : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-2 border-white/20 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/30'
                                        : 'bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-sm border-2 border-red-400/30 opacity-60 cursor-not-allowed'
                                }`}
                                onClick={() => level.is_enabled && setSelectedLevel(level.id)}
                                disabled={!level.is_enabled}
                            >
                                {/* Background Animation */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                    level.is_enabled ? 'bg-gradient-to-r from-rose-400/20 via-purple-400/20 to-rose-400/20' : ''
                                }`}></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="text-2xl mb-2">
                                        {level.is_enabled ? '🎵' : '🚫'}
                                    </div>
                                    <span className={`text-lg font-bold ${
                                        selectedLevel === level.id
                                            ? 'text-white'
                                            : level.is_enabled
                                                ? 'text-white group-hover:text-rose-200'
                                                : 'text-red-300'
                                    }`}>
                                        {level.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game Modes Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-4xl">🎮</span>
                            <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
                                Modes de Jeu
                            </h3>
                        </div>
                        <div className="h-1 w-32 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-full mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link
                            href={route('practice', {level: selectedLevel, courseId: courseId, courseName: courseName})}
                            className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 border-2 border-emerald-400/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">🎯</div>
                                <h4 className="text-2xl font-bold text-white mb-2">Pratique</h4>
                                <p className="text-emerald-100 text-sm">Entraînez-vous sans pression</p>
                            </div>
                        </Link>

                        <Link
                            href={route('optionsmenu', {level: selectedLevel, courseId: courseId, courseName: courseName})}
                            className="group relative overflow-hidden bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/30 border-2 border-rose-400/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 via-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">🏆</div>
                                <h4 className="text-2xl font-bold text-white mb-2">Quiz</h4>
                                <p className="text-rose-100 text-sm">Testez vos connaissances</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Scores Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-4xl">📊</span>
                            <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                                Statistiques
                            </h3>
                        </div>
                        <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 rounded-full mx-auto"></div>
                    </div>

                    <div className="max-w-md mx-auto">
                        <Link
                            href={route('highscores', {courseId: courseId})}
                            className="group relative overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 border-2 border-amber-400/30 block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">🏅</div>
                                <h4 className="text-2xl font-bold text-white mb-2">Meilleurs Scores</h4>
                                <p className="text-amber-100 text-sm">Consultez le classement</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="text-center pt-8 border-t border-white/20">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href={route('welcome')}
                            className="group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-8 rounded-xl border-2 border-gray-500/50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>🏠</span>
                                Retour à l'accueil
                            </span>
                        </Link>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-8 rounded-xl border-2 border-red-500/50 hover:border-red-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>🚪</span>
                                Déconnexion
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
