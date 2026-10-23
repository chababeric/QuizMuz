
import { Link, Head, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MainMenu({ auth }) {
    const { levels } = usePage().props;
    const { courseId } = usePage().props;
    const { courseName } = usePage().props;
    const [selectedLevel, setSelectedLevel] = useState(auth.user.last_level);
    const [saveError, setSaveError] = useState(false);

    const hasEnabledLevel = levels.some(level => level.is_enabled);
    const hasDisabledLevel = levels.some(level => !level.is_enabled);
    const canPlay = levels.some(level => level.id === selectedLevel && level.is_enabled);

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
        if (auth.user.last_level !== selectedLevel && canPlay) {
            setSaveError(false);
            axios.post(route('updateLastLevel'), {
                level: selectedLevel,
                userId: auth.user.id
            }).then(r => {}
            ).catch(e => {
                console.error("There was an error updating the last level!", e);
                setSaveError(true);
            });
        }
    }, [selectedLevel]);

    useEffect(() => {
        localStorage.removeItem("game_key");
    }, []);

    // Mode cards only link somewhere when an enabled level is selected
    const ModeCard = canPlay ? Link : 'div';
    const modeCardState = canPlay ? '' : 'opacity-50 cursor-not-allowed';
    const motionClasses = 'transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none';

    return (
        <div className="main-app min-h-screen flex flex-col">
            <div className="background-container"></div>
            <Head title="Menu principal - QuizMuz"/>

            {/* Header Section */}
            <div className="text-center py-6 sm:py-8 relative z-10 px-4">
                <div className="inline-block bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 shadow-2xl border border-white/20 max-w-[95vw] sm:max-w-none">
                    <h1 className="text-3xl sm:text-5xl font-bold text-white">
                        {courseName}
                    </h1>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex-1 max-w-6xl mx-auto w-full px-6 pb-8">

                {/* Level Selection Section */}
                <div className="mb-10">
                    <div className="text-center mb-6">
                        <h2 id="level-heading" className="inline-block bg-gray-900/80 backdrop-blur-sm rounded-xl px-5 py-2 text-2xl font-bold text-white">
                            Sélectionnez votre niveau
                        </h2>
                    </div>

                    {levels.length === 0 || !hasEnabledLevel ? (
                        <p className="max-w-md mx-auto text-center bg-gray-900/80 rounded-xl p-4 text-white">
                            Aucun niveau n'est disponible pour ce cours pour le moment. Contactez votre établissement pour qu'il ouvre un niveau.
                        </p>
                    ) : (
                        <div role="group" aria-labelledby="level-heading" className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-3 max-w-4xl mx-auto">
                            {levels.map(level => {
                                const isSelected = selectedLevel === level.id;
                                return (
                                    <button
                                        key={level.id}
                                        aria-pressed={isSelected}
                                        className={`relative rounded-2xl p-4 text-center w-full lg:w-40 border-2 transition-colors duration-200 motion-reduce:transition-none ${
                                            level.is_enabled
                                                ? isSelected
                                                    ? 'bg-rose-600 border-white shadow-xl'
                                                    : 'bg-gray-900/80 backdrop-blur-sm border-white/20 hover:border-rose-300'
                                                : 'bg-gray-900/60 backdrop-blur-sm border-white/10 opacity-70 cursor-not-allowed'
                                        }`}
                                        onClick={() => level.is_enabled && setSelectedLevel(level.id)}
                                        disabled={!level.is_enabled}
                                    >
                                        {isSelected && (
                                            <span aria-hidden="true" className="absolute top-2 right-3 text-white font-bold">✓</span>
                                        )}
                                        <span className="block text-lg font-bold text-white">
                                            {level.name}
                                        </span>
                                        {!level.is_enabled && (
                                            <span className="block text-sm text-gray-200">Désactivé</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {hasEnabledLevel && hasDisabledLevel && (
                        <p className="mt-4 text-center text-sm text-white">
                            <span className="bg-gray-900/80 rounded-lg px-3 py-1 inline-block">
                                Les niveaux désactivés n'ont pas encore été ouverts par votre établissement.
                            </span>
                        </p>
                    )}

                    {saveError && (
                        <p role="status" className="mt-4 text-center text-sm text-white">
                            <span className="bg-red-800/90 rounded-lg px-3 py-1 inline-block">
                                Votre niveau n'a pas pu être enregistré. Il sera de nouveau sélectionné par défaut à votre prochaine visite.
                            </span>
                        </p>
                    )}
                </div>

                {/* Game Modes Section */}
                <div className="mb-10">
                    <div className="text-center mb-6">
                        <h2 className="inline-block bg-gray-900/80 backdrop-blur-sm rounded-xl px-5 py-2 text-2xl font-bold text-white">
                            Modes de jeu
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <ModeCard
                            {...(canPlay
                                ? { href: route('optionsmenu', {level: selectedLevel, courseId: courseId, courseName: courseName}) }
                                : { 'aria-disabled': true })}
                            className={`block bg-rose-600 rounded-2xl p-8 text-center border-2 border-rose-300 shadow-xl hover:bg-rose-500 ${motionClasses} ${modeCardState}`}
                        >
                            <div aria-hidden="true" className="text-5xl mb-4">🏆</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Quiz</h3>
                            <p className="text-white text-sm">Testez vos connaissances</p>
                        </ModeCard>

                        <ModeCard
                            {...(canPlay
                                ? { href: route('practice', {level: selectedLevel, courseId: courseId, courseName: courseName}) }
                                : { 'aria-disabled': true })}
                            className={`block bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-white/20 hover:border-white/50 ${motionClasses} ${modeCardState}`}
                        >
                            <div aria-hidden="true" className="text-5xl mb-4">🎯</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pratique</h3>
                            <p className="text-gray-200 text-sm">Entraînez-vous sans pression</p>
                        </ModeCard>
                    </div>
                </div>

                {/* Scores Section */}
                <div className="mb-10">
                    <div className="text-center mb-6">
                        <h2 className="inline-block bg-gray-900/80 backdrop-blur-sm rounded-xl px-5 py-2 text-2xl font-bold text-white">
                            Statistiques
                        </h2>
                    </div>

                    <div className="max-w-md mx-auto">
                        <Link
                            href={route('highscores', {courseId: courseId})}
                            className={`block bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-white/20 hover:border-white/50 ${motionClasses}`}
                        >
                            <div aria-hidden="true" className="text-5xl mb-4">🏅</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Meilleurs scores</h3>
                            <p className="text-gray-200 text-sm">Consultez le classement</p>
                        </Link>
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="text-center pt-8 border-t border-white/20">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href={route('welcome')}
                            className={`bg-gray-800 text-white py-3 px-8 rounded-xl border-2 border-gray-500/50 hover:border-gray-300 ${motionClasses}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span aria-hidden="true">🏠</span>
                                Retour à l'accueil
                            </span>
                        </Link>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={`bg-red-700 text-white py-3 px-8 rounded-xl border-2 border-red-500/50 hover:border-red-300 ${motionClasses}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span aria-hidden="true">🚪</span>
                                Déconnexion
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
