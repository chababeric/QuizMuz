import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Head, Link } from "@inertiajs/react";
import { useSwipeable } from 'react-swipeable';
import ScoreCard from "@/Components/ScoreCard.jsx";

export default function HighScores({ auth, courseId }) {
    const [scores, setScores] = useState([]);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        axios.get('/all-scores', {params: {course_id: courseId}})
            .then(response => {
                const sortedScores = response.data.sort((a, b) => b.score - a.score);
                const rankedScores = sortedScores.map((score, index, arr) => {
                    if (index === 0) {
                        score.rank = 1;
                    } else if (score.score === arr[index - 1].score) {
                        score.rank = arr[index - 1].rank;
                    } else {
                        score.rank = index + 1;
                    }
                    return score;
                });
                setScores(rankedScores);
                setError(null);
            })
            .catch(error => {
                console.error('There was an error fetching the scores!', error);
                setError('Erreur lors du chargement des scores');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [courseId]);

    const nextScore = () => {
        setRotation((prevRotation) => prevRotation - (360 / scores.length));
    };

    const prevScore = () => {
        setRotation((prevRotation) => prevRotation + (360 / scores.length));
    };

    const getCardStyle = (index) => {
        const totalCards = scores.length;
        const angle = index * (360 / totalCards);

        return {
            transform: `rotateY(${angle}deg) translateZ(250px)`,
        };
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => nextScore(),
        onSwipedRight: () => prevScore(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    const renderLoadingState = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                    <span className="text-white text-2xl font-bold">Chargement des scores...</span>
                </div>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="bg-gradient-to-r from-red-900/90 via-rose-900/90 to-red-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">⚠️</span>
                    <div>
                        <h3 className="text-white text-2xl font-bold mb-2">Erreur</h3>
                        <p className="text-red-200">{error}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-slate-800/60 to-gray-800/60 backdrop-blur-sm rounded-2xl px-12 py-8 shadow-2xl border border-white/20">
                    <div className="text-6xl mb-6">🏆</div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Aucun score disponible
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Soyez le premier à jouer un quiz<br/>
                        et à apparaître sur ce tableau !
                    </p>
                    <div className="h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mt-6"></div>
                </div>
            </div>
        </div>
    );

    const renderScoreCarousel = () => (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {/* Instructions */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-indigo-400/30 shadow-xl">
                <div className="flex items-center gap-3 text-indigo-200">
                    <span className="text-xl">👆</span>
                    <span className="font-medium">Balayez ou utilisez les flèches pour naviguer</span>
                </div>
            </div>

            {/* 3D Carousel Container */}
            <div
                {...handlers}
                className="carousel-container perspective-1000 w-full h-80 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
                style={{
                    perspective: '1000px',
                    touchAction: 'none'
                }}
            >
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `rotateY(${rotation}deg)`,
                    }}
                >
                    {scores.map((score, index) => (
                        <div
                            key={index}
                            className="absolute"
                            style={getCardStyle(index)}
                        >
                            <ScoreCard
                                rank={score.rank}
                                username={score.user.username}
                                score={score.score}
                                user={auth.user.username}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={prevScore}
                    className="group bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-sm rounded-full p-3 border border-indigo-400/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                    <svg className="h-6 w-6 text-white transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-400/30">
                    <span className="text-white font-medium">
                        {scores.length} score{scores.length > 1 ? 's' : ''}
                    </span>
                </div>

                <button
                    onClick={nextScore}
                    className="group bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-sm rounded-full p-3 border border-purple-400/50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                    <svg className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        if (isLoading) return renderLoadingState();
        if (error) return renderErrorState();
        if (scores.length === 0) return renderEmptyState();
        return renderScoreCarousel();
    };

    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            <div className="background-container"></div>
            <Head title="Meilleurs Scores - QuizMuz"/>

            {/* Header Section */}
            <div className="relative w-full mt-2 mb-6 px-4">
                {/* Back Button */}
                <div className="flex justify-start mb-4 sm:mb-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2 sm:z-10">
                    <Link
                        href={route('mainmenu', { courseId: courseId })}
                        className="group"
                    >
                        <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 hover:border-amber-300 transition-all duration-300 shadow-lg hover:shadow-amber-500/30">
                            <div className="flex items-center gap-2 text-white group-hover:text-amber-200">
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-sm font-medium">Retour</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Title - Centered */}
                <div className="flex justify-center">
                    <div className="text-center">
                        <div className="inline-block bg-gradient-to-r from-amber-900/90 via-yellow-900/90 to-amber-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">🏆</span>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                                    Meilleurs Scores
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 pb-6">
                <div className="max-w-6xl mx-auto h-full">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
