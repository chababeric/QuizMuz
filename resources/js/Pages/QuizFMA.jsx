import { Head, Link } from '@inertiajs/react';
import ControlMusic from "@/Components/ControlMusic.jsx";
import React, { useState, useEffect, useCallback } from 'react';
import { useQuizAudio } from "@/hooks/useQuizAudio.js";
import { useQuizApi } from "@/hooks/useQuizApi.js";

export default function QuizFMA({
                                    auth,
                                    difficulty,
                                    level_id,
                                    courseId,
                                    selectListData,
                                    current_chord_mp3,
                                    current_score
                                }) {
    // State management
    const [chordMp3, setChordMp3] = useState(current_chord_mp3);
    const [score, setScore] = useState(current_score);
    const [grading, setGrading] = useState(false);
    const [playChordOnce, setPlayChordOnce] = useState(false);
    const [result, setResult] = useState({ status: '', correctAnswer: '' });
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [chordCount, setChordCount] = useState(0);
    const [chordInputs, setChordInputs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Custom hooks
    const { isPlaying, playAudio, stopAudio, cleanup } = useQuizAudio(chordMp3, 'chord');
    const { makeApiCall } = useQuizApi();

    // Computed values
    const actionText = grading ? 'Continuer' : 'Vérifier';
    const isHardDifficulty = difficulty === '3';
    const hasActiveChord = Boolean(chordMp3);

    // Event handlers
    const handlePlayMusic = useCallback(() => {
        playAudio();
    }, [playAudio]);

    const handleStopMusic = useCallback(() => {
        stopAudio();
    }, [stopAudio]);

    const handleChordInputChange = useCallback((index, value) => {
        const newInputs = [...chordInputs];
        newInputs[index] = value;
        setChordInputs(newInputs);

        // For hard difficulty, combine all inputs for selectedAnswer
        const combinedAnswer = newInputs.filter(input => input && input.trim() !== '').join(' - ');
        setSelectedAnswer(combinedAnswer);
    }, [chordInputs]);

    const handleSelectChange = useCallback((event) => {
        setSelectedAnswer(event.target.value);
    }, []);

    const resetAnswers = useCallback(() => {
        setSelectedAnswer('');
        if (isHardDifficulty) {
            setChordInputs(Array(chordCount).fill(''));
        }
    }, [isHardDifficulty, chordCount]);

    // API calls
    const checkAnswer = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await makeApiCall(route('checkFMAAnswers'), {
                selectedAnswer: selectedAnswer.trim()
            });

            if (response.success && response.data) {
                setResult({
                    status: response.data.status || 'unknown',
                    correctAnswer: response.data.correctAnswer || 'Non disponible'
                });
                if (response.data.score !== undefined) {
                    setScore(response.data.score);
                }
            } else {
                setError('Erreur lors de la vérification de la réponse');
                console.error('API response error:', response);
            }
        } catch (error) {
            setError('Erreur lors de la vérification de la réponse');
            console.error('Check answer error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedAnswer, makeApiCall]);

    const getNextChord = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await makeApiCall(route('getNextChord'), { playChordOnce });

            if (response.success && response.data) {
                setChordMp3(response.data.current_chord_mp3);

                if (isHardDifficulty && response.data.chordsData) {
                    const newChordCount = response.data.chordsData.chordCount || 0;
                    setChordCount(newChordCount);
                    setChordInputs(Array(newChordCount).fill(''));
                }
            } else {
                setError('Erreur lors du chargement de l\'accord suivant');
                console.error('API response error:', response);
            }
        } catch (error) {
            setError('Erreur lors du chargement de l\'accord suivant');
            console.error('Get next chord error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [playChordOnce, makeApiCall, isHardDifficulty]);

    const handleGrade = useCallback(async (action) => {
        handleStopMusic();

        if (action === 'Vérifier') {
            await checkAnswer();
            setGrading(true);
        } else if (action === 'Continuer') {
            setGrading(false);
            setResult({ status: '', correctAnswer: '' });
            setError(null);
            resetAnswers();
            await getNextChord();
        }
    }, [checkAnswer, getNextChord, resetAnswers, handleStopMusic]);

    // Effects
    useEffect(() => {
        if (isHardDifficulty && selectListData?.chordCount) {
            setChordCount(selectListData.chordCount);
            setChordInputs(Array(selectListData.chordCount).fill(''));
        }
    }, [isHardDifficulty, selectListData]);

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

    const renderAnswerInput = () => {
        if (isHardDifficulty) {
            return (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Entrez les accords dans l'ordre</h4>
                        <p className="text-purple-200 text-sm">Saisissez chaque accord dans les champs ci-dessous</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
                        {Array(chordCount).fill().map((_, index) => (
                            <div key={index} className="flex flex-col items-center space-y-2">
                                <label className="text-purple-200 text-sm font-medium">#{index + 1}</label>
                                <input
                                    type="text"
                                    value={chordInputs[index] || ''}
                                    onChange={(e) => handleChordInputChange(index, e.target.value)}
                                    disabled={isLoading}
                                    className="w-20 h-12 text-center bg-slate-800/60 backdrop-blur-sm border border-purple-400/30 rounded-lg text-white font-medium focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="?"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // For easy and medium difficulties, show dropdown
        if (Array.isArray(selectListData)) {
            return (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Sélectionnez l'accord</h4>
                        <p className="text-purple-200 text-sm">Choisissez l'accord que vous entendez</p>
                    </div>
                    <select
                        value={selectedAnswer}
                        onChange={handleSelectChange}
                        disabled={isLoading}
                        className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-purple-400/30 rounded-xl text-white font-medium focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Sélectionnez une réponse</option>
                        {selectListData.map((item, index) => (
                            <option key={index} value={item} className="bg-slate-800 text-white">
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-white text-lg">Aucune option disponible</p>
            </div>
        );
    };

    const renderGradingResults = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-3xl">{result.status === 'correct' ? '✅' : '❌'}</span>
                    <h3 className="text-2xl font-bold text-white">Résultats</h3>
                </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-slate-700/50 border-b border-slate-600/50">
                            <th className="px-4 py-3 text-left text-white font-semibold">Résultat</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Votre réponse</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Réponse correcte</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className={`${
                            result.status === 'correct'
                                ? 'bg-emerald-900/30 border-emerald-500/30'
                                : 'bg-red-900/30 border-red-500/30'
                        } border-b`}>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {result.status === 'correct' ? '✓' : '✗'}
                                        </span>
                                    <span className={`font-semibold ${
                                        result.status === 'correct' ? 'text-emerald-200' : 'text-red-200'
                                    }`}>
                                            {result.status === 'correct' ? 'Correct' : 'Incorrect'}
                                        </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-white font-medium">
                                {selectedAnswer || 'Aucune réponse'}
                            </td>
                            <td className="px-4 py-3 text-white font-medium">
                                {result.correctAnswer}
                            </td>
                        </tr>
                        </tbody>
                    </table>
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
                        Toutes les formules ont été jouées !<br/>
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
                        setPlayPieceOnce={setPlayChordOnce}
                        isPlaying={isPlaying}
                        disableRandomPosition={true}
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
                            {renderGradingResults()}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-6 py-4 border-b border-indigo-400/20">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎼</span>
                                <h3 className="text-xl font-bold text-white">
                                    {isHardDifficulty ? 'Analyse d\'accord' : 'Reconnaissance d\'accord'}
                                </h3>
                                <div className="ml-auto bg-indigo-500/20 rounded-lg px-3 py-1">
                                    <span className="text-sm text-indigo-200 font-medium">
                                        Difficulté {difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {renderAnswerInput()}
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
            <Head title="Quiz FMA - QuizMuz" />

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
                                <span className="text-4xl">🎼</span>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                                    Quiz FMA
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
                    {!hasActiveChord ? renderGameCompleted() : renderQuizContent()}
                </div>
            </div>
        </div>
    );
}
