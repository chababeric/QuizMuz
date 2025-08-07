import { Link, Head } from '@inertiajs/react';
import React from "react";

export default function Course({ auth, courses }) {
    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Cours - QuizMuz"/>

            {/* Header Section */}
            <div className="relative z-10 px-4 py-6 sm:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <div className="inline-block bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <span className="text-5xl">👋</span>
                                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                                    Bienvenue, {auth.user.first_name || auth.user.username}!
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-4xl w-full">
                    {/* Course Selection Section */}
                    <div className="bg-gradient-to-r from-slate-900/20 to-indigo-900/20 backdrop-blur-sm rounded-2xl border border-indigo-400/20 overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-6 sm:px-8 py-6 border-b border-emerald-400/20">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="text-4xl">📚</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                        Choisissez un cours
                                    </h2>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
                            </div>
                        </div>

                        {/* Courses Grid */}
                        <div className="p-6 sm:p-8">
                            {courses && courses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {courses.map((course, index) => (
                                        <Link
                                            key={course.id}
                                            href={route('mainmenu', {courseId: course.id})}
                                            className="group relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            <div className="relative z-10 text-center">
                                                {/* Course Icon */}
                                                <div className="text-6xl mb-4">
                                                    {course.name.includes('Littérature') ? '🎼' :
                                                        course.name.includes('Formation') ? '🎵' :
                                                            course.name.includes('Harmonie') ? '🎹' : '🎧'}
                                                </div>

                                                {/* Course Name */}
                                                <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 leading-tight">
                                                    {course.name}
                                                </h3>

                                                {/* Course Description */}
                                                {course.description && (
                                                    <p className="text-purple-200 text-sm mt-3 leading-relaxed">
                                                        {course.description}
                                                    </p>
                                                )}

                                                {/* Visual Indicator */}
                                                <div className="mt-4 flex items-center justify-center gap-2 text-purple-300 group-hover:text-purple-200 transition-colors duration-300">
                                                    <span className="text-sm font-medium">Accéder au cours</span>
                                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                /* No Courses Available */
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-6">📚</div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        Aucun cours disponible
                                    </h3>
                                    <p className="text-indigo-200 text-lg">
                                        Il n'y a actuellement aucun cours disponible pour votre profil.
                                    </p>
                                </div>
                            )}

                            {/* Course Info */}
                            {courses && courses.length > 0 && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-400/20">
                                    <div className="flex items-start gap-4">
                                        <span className="text-3xl flex-shrink-0">💡</span>
                                        <div>
                                            <h4 className="text-lg font-semibold text-blue-200 mb-2">
                                                À propos des cours
                                            </h4>
                                            <p className="text-blue-100 leading-relaxed">
                                                Chaque cours offre des modules d'apprentissage spécialisés avec des quiz interactifs.
                                                Sélectionnez un cours pour accéder aux différents niveaux et commencer votre apprentissage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="text-center mt-8">
                        <Link
                            href={route('welcome')}
                            className="group relative inline-flex items-center gap-3 overflow-hidden bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-500/50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-500/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 text-xl">🏠</span>
                            <span className="relative z-10 text-white font-medium group-hover:text-gray-200 transition-colors duration-300">
                                Retour à l'accueil
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl mx-4 py-4 border border-white/10">
                    <p className="text-white/80 text-sm font-medium">
                        Sélectionnez un cours pour commencer votre apprentissage musical
                    </p>
                </div>
            </footer>
        </div>
    );
}
