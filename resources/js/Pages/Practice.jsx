import { Head, Link } from '@inertiajs/react';
import React, { useState, useMemo, useCallback } from 'react';
import axios from "axios";
import backIcon from "../../icons/back.svg";
import { useAudioPlayer } from "@/hooks/useAudioPlayer.js";
import PiecesList from "@/Components/PiecesList.jsx";
import AudioControls from "@/Components/AudioControls.jsx";

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

    return (
        <div className="main-app flex flex-col h-screen">
            <div className="background-container"></div>
            <Head title="Pratique - QuizMuz"/>

            {/* Header */}
            <div className="relative flex items-center justify-between w-full">
                <Link
                    href={route('mainmenu', { courseId: courseId })}
                    className="hover:cursor-pointer absolute left-3"
                    onClick={handleBackClick}
                >
                    <img src={backIcon} alt="Back" className="h-10 w-10 mb-5"/>
                </Link>
                <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4 mx-auto">
                    Pratique
                </h1>
            </div>

            {/* Last update info */}
            {!loading && (
                <div className="text-sm text-white text-center mb-2">
                    Dernière mise à jour: {formattedLastUpdate}
                </div>
            )}

            {/* Main content */}
            {loading ? (
                <div className="text-white text-center mt-4 text-4xl font-semibold">
                    Chargement...
                </div>
            ) : (
                <>
                    {/* Pieces list */}
                    <PiecesList
                        courseName={courseName}
                        pieces={pieces}
                        modules={modules}
                        nonModulePieces={nonModulePieces}
                        currentPiece={currentPiece}
                        onPieceClick={handlePieceClick}
                    />

                    {/* Audio controls */}
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
                </>
            )}
        </div>
    );
}
