import { Head } from '@inertiajs/react';
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import axios from "axios";
import { useAudioPlayer } from "@/hooks/useAudioPlayer.js";
import PiecesList from "@/Components/PiecesList.jsx";
import AudioControls from "@/Components/AudioControls.jsx";
import AppHeader from '@/Components/AppHeader';
import { CalendarIcon, ChevronIcon, HeadphonesIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@/Components/AppIcons';

const transition = 'transition duration-200 motion-reduce:transition-none';
const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';
const sectionLabel = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]';
const iconButton = `inline-flex items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed ${transition}`;

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
    const [modules] = useState(modulesList);
    const [nonModulePieces] = useState(nonModulePiecesList);
    const [loading] = useState(initialLoading);
    const [isAudioControlsExpanded, setIsAudioControlsExpanded] = useState(false);

    // Create ordered pieces list that matches the display order
    const pieces = useMemo(() => {
        const isFMA = courseName === "Formation Musicale et Auditive";
        const usesModules = courseName === "Littérature Musicale" || isFMA;

        if (!usesModules) {
            return piecesList;
        }

        // Build ordered list: first all items from modules in order, then non-module items
        const orderedPieces = [];

        // Add items from each module in order
        modules.forEach(moduleData => {
            const items = isFMA ? (moduleData.chords || []) : (moduleData.pieces || []);
            orderedPieces.push(...items);
        });

        // Add non-module items at the end
        orderedPieces.push(...nonModulePieces);

        return orderedPieces;
    }, [courseName, piecesList, modules, nonModulePieces]);

    const [currentPiece, setCurrentPiece] = useState(null);

    // Initialize current piece when pieces are ready
    useEffect(() => {
        if (!currentPiece && pieces.length > 0) {
            setCurrentPiece(pieces[0]);
        }
    }, [pieces, currentPiece]);

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

    const audioControls = (
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
    );

    const playerHeading = (
        <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-11 h-11 shrink-0 rounded-[14px] bg-[rgba(162,120,224,0.14)] text-[#BFA0F0] flex items-center justify-center">
                <HeadphonesIcon/>
            </span>
            <h2 className={`flex-1 ${sectionLabel}`}>Contrôles Audio</h2>
        </div>
    );

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Pratique - QuizMuz"/>
            <AppHeader
                title="Pratique"
                backHref={route('mainmenu', { courseId })}
                backLabel="Retour au menu"
                onBack={handleBackClick}
            />

            {loading ? (
                <main className="flex-1 flex items-center justify-center px-4">
                    <div role="status" className={`${card} flex items-center gap-3 px-6 py-4`}>
                        <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none"></span>
                        <span className="text-[17px] font-semibold">Chargement...</span>
                    </div>
                </main>
            ) : (
                <>
                    <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 md:pt-6 pb-36 lg:pb-12 flex flex-col lg:flex-row lg:items-start gap-4 md:gap-5">
                        {/* Desktop: player stays in view beside the list */}
                        <aside className={`hidden lg:flex lg:w-[380px] lg:shrink-0 lg:sticky lg:top-[88px] ${card} p-5 flex-col gap-5`}>
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]"></div>
                            <div className="relative flex flex-col gap-5">
                                {playerHeading}
                                {audioControls}
                            </div>
                        </aside>

                        <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-5">
                            <div>
                                <h2 className="text-[20px] md:text-[24px] font-bold leading-tight">Liste des Pièces - {courseName}</h2>
                                <p className="mt-1 inline-flex items-center gap-2 text-[14px] text-[#A9AEC2]">
                                    <CalendarIcon className="w-4 h-4"/>
                                    Dernière mise à jour: {formattedLastUpdate}
                                </p>
                            </div>
                            <PiecesList
                                courseName={courseName}
                                pieces={pieces}
                                modules={modules}
                                nonModulePieces={nonModulePieces}
                                currentPiece={currentPiece}
                                onPieceClick={handlePieceClick}
                            />
                        </div>
                    </main>

                    {/* Smaller screens: full player panel, opened from the mini player */}
                    <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 duration-300 motion-reduce:transition-none ${
                        isAudioControlsExpanded ? 'translate-y-0' : 'translate-y-full'
                    } transition-transform`}>
                        <div className={`${card} rounded-b-none border-b-0 bg-[#0B0D18]/95 backdrop-blur-md px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-5`}>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">{playerHeading}</div>
                                <button
                                    type="button"
                                    onClick={toggleAudioControls}
                                    aria-label="Réduire"
                                    aria-expanded={isAudioControlsExpanded}
                                    className={`${iconButton} w-11 h-11 text-[#C9CCDA] hover:bg-white/[0.06]`}
                                >
                                    <ChevronIcon className="w-5 h-5 rotate-90"/>
                                </button>
                            </div>
                            {audioControls}
                        </div>
                    </div>

                    {/* Smaller screens: mini player pinned to the bottom */}
                    <div className={`lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#06070D]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] duration-300 motion-reduce:transition-none ${
                        isAudioControlsExpanded ? 'translate-y-full' : 'translate-y-0'
                    } transition-transform`}>
                        {currentPiece && duration > 0 && (
                            <div aria-hidden="true" className="h-0.5 bg-white/[0.08]">
                                <div className="h-full bg-[#E0566C]" style={{ width: `${((progress / duration) * 100) || 0}%` }}></div>
                            </div>
                        )}
                        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleAudioControls}
                                aria-label="Développer les contrôles audio"
                                aria-expanded={isAudioControlsExpanded}
                                className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-left"
                            >
                                <span aria-hidden="true" className="w-10 h-10 shrink-0 rounded-[12px] bg-[rgba(162,120,224,0.14)] text-[#BFA0F0] flex items-center justify-center">
                                    <ChevronIcon className="w-5 h-5 -rotate-90"/>
                                </span>
                                {currentPiece ? (
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[15px] font-semibold">
                                            {courseName === "Formation Musicale et Auditive" ? currentPiece.chord_name : currentPiece.title}
                                        </span>
                                        {courseName !== "Formation Musicale et Auditive" && currentPiece.composer && (
                                            <span className="block truncate text-[13px] text-[#A9AEC2]">{currentPiece.composer}</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-[14px] text-[#A9AEC2]">Aucune pièce sélectionnée</span>
                                )}
                            </button>

                            <button
                                type="button"
                                aria-label="Pièce précédente"
                                className={`${iconButton} w-11 h-11 text-[#F2F3F8] hover:bg-white/[0.06]`}
                                onClick={handlePrevious}
                                disabled={!currentPiece || pieces.length <= 1}
                            >
                                <SkipBackIcon className="w-5 h-5 fill-current"/>
                            </button>
                            <button
                                type="button"
                                aria-label={isPlaying ? "Pause" : "Lecture"}
                                className={`${iconButton} w-12 h-12 bg-[#B4283F] hover:bg-[#C8304A] text-white`}
                                onClick={handlePlayPauseWithUpdate}
                                disabled={!currentPiece || isLoading}
                            >
                                {isLoading ? (
                                    <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none"></span>
                                ) : isPlaying ? (
                                    <PauseIcon className="w-5 h-5 fill-current"/>
                                ) : (
                                    <PlayIcon className="w-5 h-5 fill-current ml-0.5"/>
                                )}
                            </button>
                            <button
                                type="button"
                                aria-label="Pièce suivante"
                                className={`${iconButton} w-11 h-11 text-[#F2F3F8] hover:bg-white/[0.06]`}
                                onClick={handleNext}
                                disabled={!currentPiece || pieces.length <= 1}
                            >
                                <SkipForwardIcon className="w-5 h-5 fill-current"/>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
