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

    return (
        <div className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Menu Principal - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Menu Principal</h1>
            <h2 className="text-4xl font-bold text-white hover:cursor-default mb-8">{courseName}</h2>

            <div className="w-full px-4">
                <h3 className="text-5xl text-white text-center hover:cursor-default mb-6 font-bold">Niveau</h3>
                <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            className={`border-2 border-white p-2.5 text-center cursor-pointer bg-black text-white text-lg w-32 h-16 mx-auto rounded-lg hover:bg-opacity-80 ${
                                level.is_enabled ? 'hover:shadow-greenGlow' : 'hover:shadow-redGlow'
                            } ${selectedLevel === level.id ? 'bg-black text-black shadow-greenGlow' : ''}`}
                            onClick={() => setSelectedLevel(level.id)}
                            disabled={!level.is_enabled}
                        >
                            {level.name}
                        </button>
                    ))}
                </div>

                <h3 className="text-5xl text-white text-center hover:cursor-default mb-6 mt-10 font-bold">Mode de
                    Jeu
                </h3>
                <div className="flex flex-wrap justify-center gap-4 mb-6 w-full flex-col items-center">
                    <Link
                        href={route('practice', {level: selectedLevel, courseId: courseId})}
                        className="game-mode"
                    >
                        Pratique
                    </Link>
                    <Link
                        href={route('optionsmenu', {level: selectedLevel, courseId: courseId})}
                        className="game-mode"
                    >
                        Quiz
                    </Link>
                </div>

                <h3 className="text-5xl text-white text-center hover:cursor-default mb-6 mt-10 font-bold">
                    Scores
                </h3>
                <div className="flex flex-wrap justify-center gap-4 mb-6 w-full flex-col items-center">
                    <Link
                        href={route('highscores', {courseId: courseId})}
                        className="game-mode"
                    >
                        Meilleurs Scores
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href={route('welcome')}
                        className="inline-flex items-center justify-center text-white py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-900 mr-4 border border-white"
                    >
                        Retour à l'accueil
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-800"
                    >
                        Déconnexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
