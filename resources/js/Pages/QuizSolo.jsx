import { Head, Link } from '@inertiajs/react';
import SelectOption from "@/Components/SelectOption.jsx";
import Grader from "@/Components/Grader.jsx";
import ControlMusic from "@/Components/ControlMusic.jsx";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuizAudio } from "@/hooks/useQuizAudio.js";
import { useQuizApi } from "@/hooks/useQuizApi.js";

export default function QuizSolo({
                                     auth,
                                     difficulty,
                                     level,
                                     courseId,
                                     courseName,
                                     current_piece_mp3,
                                     selectListData,
                                     current_score,
                                     parameters_to_display
                                 }) {
    // State management
    const [pieceMp3, setPieceMp3] = useState(current_piece_mp3);
    const [score, setScore] = useState(current_score);
    const [parametersToDisplay, setParametersToDisplay] = useState([]);
    const [startRandomPosition, setStartRandomPosition] = useState(false);
    const [playPieceOnce, setPlayPieceOnce] = useState(false);
    const [grading, setGrading] = useState(false);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedAnswers, setSelectedAnswers] = useState({
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: ''
    });

    // Custom hooks
    const { isPlaying, playAudio, stopAudio, cleanup } = useQuizAudio(pieceMp3, 'piece');
    const { makeApiCall } = useQuizApi();

    // Constants
    const elements = useMemo(() => {
        const isHistoireDeLaMusique = courseName === 'Histoire de la Musique';

        if (isHistoireDeLaMusique) {
            return [
                { name: "Titre", col: "title" },
                { name: "Compositeur", col: "composer" },
                { name: "Répertoire", col: "element" },
                { name: "Date (siècle)", col: "period" },
                { name: "Genre", col: "genre" },
                { name: "Option", col: "form" }
            ];
        } else {
            // Littérature Musicale or default
            return [
                { name: "Période", col: "period" },
                { name: "Genre", col: "genre" },
                { name: "Compositeur", col: "composer" },
                { name: "Titre", col: "title" },
                { name: "Élément", col: "element" },
                { name: "No. mouvement", col: "no_mvt" },
                { name: "Nom mouvement", col: "mvt" },
                { name: "Forme", col: "form" }
            ];
        }
    }, [courseName]);

    const actionText = grading ? 'Continuer' : 'Vérifier';
    const hasActivePiece = Boolean(pieceMp3);

    // Event handlers
    const handlePlayMusic = useCallback(() => {
        playAudio(startRandomPosition);
    }, [playAudio, startRandomPosition]);

    const handleStopMusic = useCallback(() => {
        stopAudio();
    }, [stopAudio]);

    const handleAnswerChange = useCallback((col, value) => {
        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            // [col]: col === 'no_mvt' ? parseInt(value, 10) || '' : value
            [col]: value
        }));
    }, []);

    const resetAnswers = useCallback(() => {
        setSelectedAnswers({
            period: '',
            genre: '',
            composer: '',
            title: '',
            element: '',
            no_mvt: '',
            mvt: '',
            form: ''
        });
    }, []);

    // API calls
    const checkAnswers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const response = await makeApiCall(route('checkAnswers'), { selectedAnswers });
        if (response.success) {
            setScore(response.data.score);
            setResults(response.data.results);
        } else {
            setError('Erreur lors de la vérification des réponses');
        }

        setIsLoading(false);
    }, [selectedAnswers, makeApiCall]);

    const getNextPiece = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const response = await makeApiCall(route('getNextPiece'), { playPieceOnce });

        if (response.success) {
            setPieceMp3(response.data.current_piece_mp3);

            if (response.data.parameters_to_display) {
                const filteredParameters = elements.filter(element =>
                    response.data.parameters_to_display.includes(element.col)
                );
                setParametersToDisplay(filteredParameters);
            }
        } else {
            setError('Erreur lors du chargement de la pièce suivante');
        }

        setIsLoading(false);
    }, [playPieceOnce, makeApiCall, elements]);

    const handleGrade = useCallback(async (action) => {
        handleStopMusic();

        if (action === 'Vérifier') {
            await checkAnswers();
            setGrading(true);
        } else if (action === 'Continuer') {
            setGrading(false);
            setResults([]);
            setError(null);
            resetAnswers();
            await getNextPiece();
        }
    }, [checkAnswers, getNextPiece, resetAnswers, handleStopMusic]);

    // Effects
    useEffect(() => {
        const filteredParameters = elements.filter(element =>
            parameters_to_display.includes(element.col)
        );
        setParametersToDisplay(filteredParameters);
    }, [parameters_to_display, elements]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // Render helpers
    const renderLoadingOverlay = () => isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                    <span className="text-white text-2xl font-bold">Chargement...</span>
                </div>
            </div>
        </div>
    );

    const renderError = () => error && (
        <div className="mb-6">
            <div className="bg-gradient-to-r from-red-900/40 to-rose-900/40 backdrop-blur-sm rounded-xl px-6 py-4 border border-red-500/50 shadow-xl">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-red-200 font-medium">{error}</p>
                </div>
            </div>
        </div>
    );

    const renderGameCompleted = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-emerald-900/90 backdrop-blur-sm rounded-2xl px-12 py-8 shadow-2xl border border-white/20">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Quiz terminé !
                    </h2>
                    <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                        Toutes les pièces ont été jouées !<br/>
                        Félicitations pour votre performance.
                    </p>
                    <Link
                        href={route('mainmenu', { courseId })}
                        className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl px-8 py-4 border border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <span className="text-2xl">🏠</span>
                            <span className="text-white text-xl font-bold">Retour au menu</span>
                        </div>
                    </Link>
                    <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full mt-6"></div>
                </div>
            </div>
        </div>
    );

    const renderQuizContent = () => (
        <div className="space-y-6 w-full">
            {renderError()}

            {/* Audio Controls Section */}
            <div className="bg-gradient-to-r from-slate-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-purple-400/30 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 px-6 py-4 border-b border-purple-400/20">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎵</span>
                        <h3 className="text-xl font-bold text-white">Contrôles Audio</h3>
                    </div>
                </div>
                <div className="p-6">
                    <ControlMusic
                        playMusic={handlePlayMusic}
                        stopMusic={handleStopMusic}
                        setRandomPosition={setStartRandomPosition}
                        setPlayPieceOnce={setPlayPieceOnce}
                        isPlaying={isPlaying}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Questions/Results Section */}
            <div className="bg-gradient-to-r from-slate-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-indigo-400/30 shadow-2xl overflow-hidden w-full">
                {grading ? (
                    <>
                        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-6 py-4 border-b border-emerald-400/20">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <h3 className="text-xl font-bold text-white">Résultats</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <Grader results={results} elements={elements} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-6 py-4 border-b border-indigo-400/20">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">❓</span>
                                <h3 className="text-xl font-bold text-white">Questions</h3>
                                <div className="ml-auto bg-indigo-500/20 rounded-lg px-3 py-1">
                                    <span className="text-sm text-indigo-200 font-medium">
                                        {parametersToDisplay.length} question{parametersToDisplay.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {parametersToDisplay.map((element, index) => (
                                <SelectOption
                                    key={element.col}
                                    name={element.name}
                                    col={element.col}
                                    data={selectListData}
                                    value={selectedAnswers[element.col]}
                                    onChange={handleAnswerChange}
                                    disabled={isLoading}
                                    difficulty={difficulty}
                                    lastUpdatedTime={index}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Action Button */}
            <div className="sticky bottom-4">
                <button
                    onClick={() => handleGrade(actionText)}
                    disabled={isLoading}
                    className={`group relative overflow-hidden w-full rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                        grading
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 hover:border-emerald-300'
                            : 'bg-gradient-to-r from-rose-600 to-pink-600 border-rose-400/50 hover:border-rose-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        grading
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20'
                            : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
                    }`}></div>
                    <div className="relative z-10 flex items-center justify-center gap-3 py-4 px-6">
                        <span className="text-2xl">
                            {isLoading ? '⏳' : grading ? '➡️' : '🔍'}
                        </span>
                        <span className="text-white text-xl font-bold">
                            {isLoading ? 'Chargement...' : actionText}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Quiz - QuizMuz" />

            {renderLoadingOverlay()}

            {/* Header Section */}
            <div className="relative w-full mt-2 mb-6 px-4">
                {/* Back Button */}
                <div className="flex justify-start mb-4 sm:mb-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2 sm:z-10">
                    <Link
                        href={route('mainmenu', { courseId })}
                        className="group"
                    >
                        <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-purple-500/30">
                            <div className="flex items-center gap-2 text-white group-hover:text-purple-200">
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
                        <div className="inline-block bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">🧠</span>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                                    Quiz
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Display */}
            <div className="px-4 mb-6">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-400/30 shadow-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <span className="text-amber-200 text-xl font-bold">Score: {score}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 pb-6 w-full max-w-6xl mx-auto">
                <div className="mx-auto w-full">
                    {!hasActivePiece ? renderGameCompleted() : renderQuizContent()}
                </div>
            </div>
        </div>
    );
}
