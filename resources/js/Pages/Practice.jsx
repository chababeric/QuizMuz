import { Head, Link } from '@inertiajs/react';
import React, { useState, useMemo, useCallback } from 'react';
import axios from "axios";
import { useAudioPlayer } from "@/hooks/useAudioPlayer.js";
import PiecesList from "@/Components/PiecesList.jsx";
import AudioControls from "@/Components/AudioControls.jsx";
import playIcon from "../../icons/play.svg";
import pauseIcon from "../../icons/pause.svg";
import nextIcon from "../../icons/next.svg";
import previousIcon from "../../icons/previous.svg";

export default function Practice({
                                     auth,
                                     level,
                                     courseId,
                                     courseName,
                                     lastUpdated,
                                     piecesList = [],
                                     modulesList = [],
                                     nonModulePiecesList = [],
                                     initialLoading = false
                                 }) {
    // State management
    const [pieces] = useState(piecesList);
    const [modules] = useState(modulesList);
    const [nonModulePieces] = useState(nonModulePiecesList);
    const [currentPiece, setCurrentPiece] = useState(
        piecesList.length > 0 ? piecesList[0] : null
    );
    const [loading] = useState(initialLoading);
    const [isAudioControlsExpanded, setIsAudioControlsExpanded] = useState(false);

    // Memoized values
    const formattedLastUpdate = useMemo(() => {
        return lastUpdated
            ? new Date(lastUpdated).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'Non disponible';
    }, [lastUpdated]);

    // API call optimization
    const updateLastActionTime = useCallback(() => {
        axios.post(route('updateLastActionTime'))
            .catch(error => console.error('Error updating last action time:', error));
    }, []);

    // Navigation handlers
    const handleNext = useCallback(() => {
        updateLastActionTime();
        if (currentPiece && pieces.length > 0) {
            const currentIndex = pieces.findIndex(p => p.id === currentPiece.id);
            const nextIndex = (currentIndex + 1) % pieces.length;
            setCurrentPiece(pieces[nextIndex]);
        }
    }, [currentPiece, pieces, updateLastActionTime]);

    const handlePrevious = useCallback(() => {
        updateLastActionTime();
        if (currentPiece && pieces.length > 0) {
            const currentIndex = pieces.findIndex(p => p.id === currentPiece.id);
            const previousIndex = (currentIndex - 1 + pieces.length) % pieces.length;
            setCurrentPiece(pieces[previousIndex]);
        }
    }, [currentPiece, pieces, updateLastActionTime]);

    // Audio player hook
    const {
        audioRef,
        isPlaying,
        progress,
        duration,
        isLoading,
        handlePlayPause,
        handleProgressChange,
        setIsPlaying,
        resetAudio,
        restartCurrentPiece
    } = useAudioPlayer(currentPiece, courseName, handleNext);

    // Piece selection handler - now handles same piece clicks differently
    const handlePieceClick = useCallback((piece) => {
        updateLastActionTime();

        // If clicking on the same piece that's currently selected
        if (currentPiece && piece.id === currentPiece.id) {
            // Just restart the current piece
            restartCurrentPiece();
        } else {
            // Different piece - reset audio and switch
            resetAudio();
            setCurrentPiece(piece);
            setIsPlaying(true);
        }
    }, [currentPiece, resetAudio, setIsPlaying, restartCurrentPiece, updateLastActionTime]);

    // Back button handler
    const handleBackClick = useCallback(() => {
        resetAudio();
    }, [resetAudio]);

    // Enhanced play/pause with action time update
    const handlePlayPauseWithUpdate = useCallback(() => {
        handlePlayPause();
        updateLastActionTime();
    }, [handlePlayPause, updateLastActionTime]);

    // Toggle audio controls
    const toggleAudioControls = useCallback(() => {
        setIsAudioControlsExpanded(prev => !prev);
    }, []);

    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Pratique - QuizMuz"/>

            {/* Header Section */}
            <div className="relative w-full mt-2 mb-4 px-2 sm:px-4">
                {/* Back Button - Above title on mobile, beside on desktop */}
                <div className="flex justify-start mb-4 sm:mb-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2 sm:z-10">
                    <Link
                        href={route('mainmenu', { courseId })}
                        className="group"
                        onClick={handleBackClick}
                    >
                        <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-4 border border-white/20 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30">
                            <div className="flex items-center gap-2 text-white group-hover:text-emerald-200">
                                <svg className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-xs sm:text-sm font-medium">Retour</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Title - Centered */}
                <div className="flex justify-center">
                    <div className="text-center">
                        <div className="inline-block bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-emerald-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-8 sm:py-4 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <span className="text-2xl sm:text-4xl">🎯</span>
                                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                                    Pratique
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Update Info */}
            {!loading && (
                <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-block bg-black/30 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-1 sm:px-4 sm:py-2 border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-200">
                            <span className="text-base sm:text-lg">📅</span>
                            <span className="text-xs sm:text-sm font-medium">
                                Dernière mise à jour: {formattedLastUpdate}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-0 sm:px-6 lg:px-0 w-full">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-sm rounded-2xl px-12 py-8 shadow-2xl border border-white/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                                    <span className="text-3xl font-bold text-white">Chargement...</span>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Content Area - Full width on mobile, contained on larger screens */}
                        <div className={`flex-1 ${isAudioControlsExpanded ? 'mb-6' : 'mb-20'} transition-all duration-300`}>
                            <div className="bg-black/20 backdrop-blur-sm rounded-none sm:rounded-2xl border-0 sm:border sm:border-white/10 shadow-none sm:shadow-2xl overflow-hidden sm:mx-6">
                                <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 px-3 py-2 sm:px-6 sm:py-4 border-b border-white/10">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-lg sm:text-2xl">🎵</span>
                                        <h2 className="text-base sm:text-xl font-bold text-white truncate">
                                            Liste des Pièces - {courseName}
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-1 sm:p-6 pb-10 sm:pb-6">
                                    <PiecesList
                                        courseName={courseName}
                                        pieces={pieces}
                                        modules={modules}
                                        nonModulePieces={nonModulePieces}
                                        currentPiece={currentPiece}
                                        onPieceClick={handlePieceClick}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Audio Controls - Fixed at bottom */}
                        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
                            isAudioControlsExpanded ? 'translate-y-0' : 'translate-y-full'
                        }`}>
                            <div className="mx-6 mb-6">
                                <div className="bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-600/20 via-rose-600/20 to-purple-600/20 px-6 py-3 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🎧</span>
                                            <h3 className="text-lg font-bold text-white">
                                                Contrôles Audio
                                            </h3>
                                            {/* Collapse Button */}
                                            <button
                                                className="group relative overflow-hidden bg-gradient-to-r from-red-600/80 to-rose-600/80 backdrop-blur-sm rounded-xl p-2 border border-red-500/50 hover:border-red-300 transition-all duration-300 ml-auto"
                                                onClick={toggleAudioControls}
                                                title="Réduire"
                                            >
                                                <svg
                                                    className="h-4 w-4 text-white transform transition-transform duration-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <AudioControls
                                            currentPiece={currentPiece}
                                            courseName={courseName}
                                            pieces={pieces}
                                            isPlaying={isPlaying}
                                            progress={progress}
                                            duration={duration}
                                            isLoading={isLoading}
                                            onPlayPause={handlePlayPauseWithUpdate}
                                            onNext={handleNext}
                                            onPrevious={handlePrevious}
                                            onProgressChange={handleProgressChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimized Audio Controls Bar */}
                        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
                            isAudioControlsExpanded ? 'translate-y-full' : 'translate-y-0'
                        }`}>
                            <div className="mx-6 mb-6">
                                <div className="bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                                    <div className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Current Piece Info */}
                                            {currentPiece ? (
                                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                                    <span className="text-xl">🎵</span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-white font-medium truncate">
                                                            {courseName === "Formation Musicale et Auditive"
                                                                ? currentPiece.chord_name
                                                                : currentPiece.title
                                                            }
                                                        </div>
                                                        {courseName !== "Formation Musicale et Auditive" && currentPiece.composer && (
                                                            <div className="text-purple-200 text-sm truncate">
                                                                {currentPiece.composer}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center gap-3 text-gray-400">
                                                    <span className="text-xl">🎵</span>
                                                    <span className="text-sm">Aucune pièce sélectionnée</span>
                                                </div>
                                            )}

                                            {/* Mini Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="group relative overflow-hidden bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-2 border border-gray-500/50 hover:border-purple-400 transition-all duration-300 disabled:opacity-50"
                                                    onClick={handlePrevious}
                                                    disabled={!currentPiece || pieces.length <= 1}
                                                >
                                                    <img src={previousIcon} alt="Previous" className="h-4 w-4 filter brightness-0 invert"/>
                                                </button>

                                                <button
                                                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-rose-600 rounded-xl p-3 border border-purple-400/50 hover:border-purple-300 transition-all duration-300 shadow-lg disabled:opacity-50"
                                                    onClick={handlePlayPauseWithUpdate}
                                                    disabled={!currentPiece || isLoading}
                                                >
                                                    {isLoading ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    ) : (
                                                        <img
                                                            src={isPlaying ? pauseIcon : playIcon}
                                                            alt={isPlaying ? "Pause" : "Play"}
                                                            className="h-5 w-5 filter brightness-0 invert"
                                                        />
                                                    )}
                                                </button>

                                                <button
                                                    className="group relative overflow-hidden bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-2 border border-gray-500/50 hover:border-purple-400 transition-all duration-300 disabled:opacity-50"
                                                    onClick={handleNext}
                                                    disabled={!currentPiece || pieces.length <= 1}
                                                >
                                                    <img src={nextIcon} alt="Next" className="h-4 w-4 filter brightness-0 invert"/>
                                                </button>

                                                {/* Expand Button */}
                                                <button
                                                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur-sm rounded-xl p-2 border border-emerald-500/50 hover:border-emerald-300 transition-all duration-300 ml-2"
                                                    onClick={toggleAudioControls}
                                                    title="Développer"
                                                >
                                                    <svg
                                                        className="h-4 w-4 text-white transform transition-transform duration-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mini Progress Bar */}
                                        {currentPiece && duration > 0 && (
                                            <div className="mt-3">
                                                <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-400 to-rose-400 transition-all duration-300"
                                                        style={{ width: `${((progress / duration) * 100) || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
