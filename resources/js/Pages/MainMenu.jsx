
import { Link, Head, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChevronIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path fillRule="evenodd" d="M7.2 14.8a.75.75 0 0 1 0-1.06L10.94 10 7.2 6.26a.75.75 0 1 1 1.06-1.06l4.27 4.27a.75.75 0 0 1 0 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0Z" clipRule="evenodd"/>
    </svg>
);

const HomeIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M10.7 2.3a1 1 0 0 0-1.4 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h3v-4h4v4h3a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .7-1.7l-7-7Z"/>
    </svg>
);

const LogoutIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .41.34.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd"/>
        <path fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.69l-1.72-1.72a.75.75 0 1 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd"/>
    </svg>
);

export default function MainMenu({ auth }) {
    const { levels } = usePage().props;
    const { courseId } = usePage().props;
    const { courseName } = usePage().props;
    const [selectedLevel, setSelectedLevel] = useState(auth.user.last_level);
    const [saveError, setSaveError] = useState(false);

    const currentLevel = levels.find(level => level.id === selectedLevel);
    const hasEnabledLevel = levels.some(level => level.is_enabled);
    const hasDisabledLevel = levels.some(level => !level.is_enabled);
    const canPlay = Boolean(currentLevel && currentLevel.is_enabled);

    useEffect(() => {
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

    // Mode entries only link somewhere when an enabled level is selected
    const ModeLink = canPlay ? Link : 'div';
    const modeProps = (routeName) => canPlay
        ? { href: route(routeName, {level: selectedLevel, courseId: courseId, courseName: courseName}) }
        : { 'aria-disabled': true };
    const unavailable = canPlay ? '' : 'opacity-50 cursor-not-allowed';
    const transition = 'transition-colors duration-200 motion-reduce:transition-none';
    const surface = 'bg-gray-950/80 border border-white/10';

    return (
        <div className="main-app min-h-[100dvh] flex flex-col !justify-start !items-stretch !pt-0">
            <div className="background-container"></div>
            <Head title="Menu principal - QuizMuz"/>

            {/* Top bar: context on the leading side, navigation on the trailing side */}
            <header className="sticky top-0 z-20 bg-gray-950/70 backdrop-blur-md border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
                    <h1 className="flex-1 min-w-0 truncate text-lg sm:text-xl font-bold text-white">
                        {courseName}
                    </h1>
                    <Link
                        href={route('welcome')}
                        aria-label="Retour à l'accueil"
                        className={`min-h-[44px] min-w-[44px] px-3 flex items-center justify-center gap-2 rounded-full text-white hover:bg-white/10 ${transition}`}
                    >
                        <HomeIcon/>
                        <span className="hidden sm:inline text-sm font-medium">Accueil</span>
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        aria-label="Déconnexion"
                        className={`min-h-[44px] min-w-[44px] px-3 flex items-center justify-center gap-2 rounded-full text-red-300 hover:bg-red-500/15 ${transition}`}
                    >
                        <LogoutIcon/>
                        <span className="hidden sm:inline text-sm font-medium">Déconnexion</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center gap-5 sm:gap-8">

                {/* Level picker, styled as a segmented control */}
                <section aria-labelledby="level-heading">
                    <h2 id="level-heading" className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-white/90 drop-shadow">
                        Niveau
                    </h2>

                    {!hasEnabledLevel ? (
                        <p className={`${surface} rounded-2xl p-4 text-white text-sm`}>
                            Aucun niveau n'est disponible pour ce cours pour le moment. Contactez votre établissement pour qu'il ouvre un niveau.
                        </p>
                    ) : (
                        <div role="group" aria-labelledby="level-heading" className={`${surface} rounded-2xl p-1.5 flex flex-wrap gap-1.5`}>
                            {levels.map(level => {
                                const isSelected = selectedLevel === level.id;
                                return (
                                    <button
                                        key={level.id}
                                        aria-pressed={isSelected}
                                        disabled={!level.is_enabled}
                                        onClick={() => level.is_enabled && setSelectedLevel(level.id)}
                                        className={`flex-1 min-w-[4.5rem] min-h-[44px] px-3 rounded-xl flex items-center justify-center gap-1.5 text-base font-semibold ${transition} ${
                                            isSelected
                                                ? 'bg-white text-gray-950 shadow'
                                                : level.is_enabled
                                                    ? 'text-white hover:bg-white/10'
                                                    : 'text-white/40 line-through cursor-not-allowed'
                                        }`}
                                    >
                                        {isSelected && <span aria-hidden="true">✓</span>}
                                        {level.name}
                                        {!level.is_enabled && <span className="sr-only">(désactivé)</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {saveError ? (
                        <p role="status" className="mt-2 px-1 text-xs text-red-200 drop-shadow">
                            Votre niveau n'a pas pu être enregistré. L'ancien niveau sera sélectionné à votre prochaine visite.
                        </p>
                    ) : hasEnabledLevel && hasDisabledLevel && (
                        <p className="mt-2 px-1 text-xs text-white/80 drop-shadow">
                            Les niveaux barrés n'ont pas encore été ouverts par votre établissement.
                        </p>
                    )}
                </section>

                {/* Primary action first, secondary destinations grouped beside it */}
                <section aria-label="Modes de jeu" className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <ModeLink
                        {...modeProps('optionsmenu')}
                        className={`group flex md:flex-col items-center md:justify-center gap-4 rounded-2xl bg-rose-600 hover:bg-rose-500 p-5 md:p-8 text-white shadow-xl md:text-center ${transition} ${unavailable}`}
                    >
                        <span aria-hidden="true" className="text-4xl md:text-6xl">🏆</span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-2xl md:text-3xl font-bold">Quiz</span>
                            <span className="block text-sm text-rose-50">
                                {canPlay ? `Testez vos connaissances · Niveau ${currentLevel.name}` : 'Choisissez un niveau pour commencer'}
                            </span>
                        </span>
                        <span className="md:hidden"><ChevronIcon/></span>
                    </ModeLink>

                    <div className={`${surface} rounded-2xl overflow-hidden flex flex-col divide-y divide-white/10`}>
                        <ModeLink
                            {...modeProps('practice')}
                            className={`flex-1 flex items-center gap-4 px-5 py-4 text-white hover:bg-white/5 ${transition} ${unavailable}`}
                        >
                            <span aria-hidden="true" className="text-3xl">🎯</span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-lg font-semibold">Pratique</span>
                                <span className="block text-sm text-gray-300">Entraînez-vous sans pression</span>
                            </span>
                            <span className="text-gray-400"><ChevronIcon/></span>
                        </ModeLink>

                        <Link
                            href={route('highscores', {courseId: courseId})}
                            className={`flex-1 flex items-center gap-4 px-5 py-4 text-white hover:bg-white/5 ${transition}`}
                        >
                            <span aria-hidden="true" className="text-3xl">🏅</span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-lg font-semibold">Meilleurs scores</span>
                                <span className="block text-sm text-gray-300">Consultez le classement</span>
                            </span>
                            <span className="text-gray-400"><ChevronIcon/></span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
