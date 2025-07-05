import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import playIcon from "../../icons/play.svg";
import pauseIcon from "../../icons/pause.svg";
import nextIcon from "../../icons/next.svg";
import previousIcon from "../../icons/previous.svg";
import backIcon from "../../icons/back.svg";

export default function Practice({ auth, level, courseId, courseName, lastUpdated, piecesList = [], modulesList = [], nonModulePiecesList = [], initialLoading = false }) {
    const [pieces, setPieces] = useState(piecesList);
    const [isPlaying, setIsPlaying] = useState(false);
    const [modules, setModules] = useState(modulesList);
    const [nonModulePieces, setNonModulePieces] = useState(nonModulePiecesList);
    const [currentPiece, setCurrentPiece] = useState(piecesList.length > 0 ? piecesList[0] : null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(initialLoading);
    const audioRef = useRef(new Audio());
    const progressRef = useRef(null);

    const formattedLastUpdate = lastUpdated
        ? new Date(lastUpdated).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Non disponible';

    const sortPiecesByOrder = (pieces) => {
        return pieces.sort((a, b) => {
            return a.order - b.order;
        });
    };

    useEffect(() => {
        const handleTimeUpdate = () => {
            setProgress(audioRef.current.currentTime);
        };

        const handleMetadata = () => {
            setDuration(audioRef.current.duration);
        };

        const handleCanPlayThrough = () => {
            // Set isPlaying to true after ensuring the audio is ready to play
            if (isPlaying) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true); // Update state after play starts
                }).catch(error => {
                    console.error("Error playing the audio:", error);
                });
            }
        };

        const handleEnded = () => {
            handleNext(); // Automatically move to the next piece when the current one ends
        };

        const audioElement = audioRef.current;

        if (currentPiece) {
            if (courseName === "Formation Musicale et Auditive")
                audioElement.src = "https://www.quizmuz.com/storage/fma_chords/" + currentPiece.file_name;
            else
                audioElement.src = "https://www.quizmuz.com/storage/litmus_pieces/" + currentPiece.file_name;
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('loadedmetadata', handleMetadata);
            audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.addEventListener('ended', handleEnded);
        }

        // Cleanup event listeners when the component unmounts or when currentPiece changes
        return () => {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            audioElement.removeEventListener('loadedmetadata', handleMetadata);
            audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.removeEventListener('ended', handleEnded);
        };
    }, [currentPiece]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play().then(e => console.log());
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        };
    }, []);

    const handlePlayPause = () => {
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
        updateLastActionTime();
    };

    const handlePieceClick = (piece) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        setCurrentPiece(piece);

        setTimeout(() => {
            setIsPlaying(true);
        }, 0);

        updateLastActionTime();
    };

    const handleNext = () => {
        updateLastActionTime();
        if (currentPiece) {
            const currentIndex = pieces.findIndex(p => p.id === currentPiece.id);
            const nextIndex = (currentIndex + 1) % pieces.length;

            // Temporarily set isPlaying to false to reset the state
            setIsPlaying(false);

            setCurrentPiece(pieces[nextIndex]);

            // Ensure the audio starts playing automatically for the next piece
            setTimeout(() => {
                setIsPlaying(true); // Update this after the next track is ready to play
            }, 0);
        }
    };

    const handlePrevious = () => {
        updateLastActionTime();
        if (currentPiece) {
            const currentIndex = pieces.findIndex(p => p.id === currentPiece.id);
            const previousIndex = (currentIndex - 1 + pieces.length) % pieces.length;
            setCurrentPiece(pieces[previousIndex]);
            setIsPlaying(true);
        }
    };

    const handleProgressChange = (e) => {
        const newProgress = e.target.value;
        audioRef.current.currentTime = newProgress;
        setProgress(newProgress);
    };

    const updateLastActionTime = () => {
        axios.post(route('updateLastActionTime'))
            .then(response => {})
            .catch(error => {
                console.error('Error updating last action time:', error);
            });
    };

    const renderModulesPieces = () => {
        return (
            <>
                {modules.map((moduleData) => (
                    <div key={moduleData.module.id} className="mb-4">
                        <h2 className="text-2xl font-bold text-white bg-rose-900/50 p-2 rounded-t-lg">
                            Module {moduleData.module.order}: {moduleData.module.title}
                        </h2>

                        {moduleData.module.description && (
                            <p className="text-gray-300 p-2 bg-black/70 mb-2 italic">
                                {moduleData.module.description}
                            </p>
                        )}
                        <div>
                            {moduleData.pieces && moduleData.pieces.map((piece, pieceIndex) => (
                                <div
                                    key={piece.id}
                                    className={`mb-1 rounded-lg p-2 border-b border-gray-600 hover:cursor-pointer ${currentPiece?.id === piece.id ? 'bg-rose-600/70' : ''}`}
                                    onClick={() => handlePieceClick(piece)}
                                >
                                    <h2 className="text-xl font-semibold text-white">
                                        <span className="inline-block w-8 font-bold mr-2">{pieceIndex + 1}.</span>
                                        {piece.title}
                                        {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                                        {piece.mvt && `, ${piece.mvt}`}
                                    </h2>
                                    <p className="text-lg text-gray-300 ml-10">{piece.composer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Render pieces without modules */}
                {nonModulePieces.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-white bg-rose-900/50 p-2 rounded-t-lg">
                            Pièces sans module
                        </h2>
                        <div>
                            {nonModulePieces.map((piece, index) => (
                                <div
                                    key={piece.id}
                                    className={`mb-1 rounded-lg p-2 border-b border-gray-600 hover:cursor-pointer ${currentPiece?.id === piece.id ? 'bg-rose-600/70' : ''}`}
                                    onClick={() => handlePieceClick(piece)}
                                >
                                    <h2 className="text-xl font-semibold text-white">
                                        <span className="inline-block w-8 font-bold mr-2">{index + 1}.</span>
                                        {piece.title}
                                        {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                                        {piece.mvt && `, ${piece.mvt}`}
                                    </h2>
                                    <p className="text-lg text-gray-300 ml-10">{piece.composer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="main-app flex flex-col h-screen">
            <div className="background-container"></div>
            <Head title="Pratique - QuizMuz"/>
            <div className="relative flex items-center justify-between w-full">
                <Link
                    href={route('mainmenu', { courseId: courseId })}
                    className="hover:cursor-pointer absolute left-3"
                    onClick={() => {
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            setIsPlaying(false);
                        }
                    }}
                >
                    <img src={backIcon} alt="Back" className="h-10 w-10 mb-5"/>
                </Link>
                <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4 mx-auto">Pratique</h1>
            </div>

            {!loading && (
                <div className="text-sm text-white text-center mb-2">
                    Dernière mise à jour: {formattedLastUpdate}
                </div>
            )}

            {loading ? (
                <div className="text-white text-center mt-4 text-4xl font-semibold">
                    Chargement...
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto w-11/12 mx-auto hide-scrollbar bg-black/50">
                        {/* Conditional rendering based on course name */}
                        {courseName === "Littérature Musicale" ? (
                            modules.length > 0 || nonModulePieces.length > 0 ? (
                                renderModulesPieces()
                            ) : (
                                <p className="text-lg text-gray-400 p-4">Aucune pièce trouvée pour ce niveau.</p>
                            )
                        ) : (
                            pieces.length > 0 ? (
                                pieces.map((piece, index) => (
                                    courseName === "Formation Musicale et Auditive" ? (
                                        <div
                                            key={piece.id}
                                            className={`mb-1 rounded-lg p-2 border-b border-gray-600 hover:cursor-pointer ${currentPiece?.id === piece.id ? 'bg-rose-600/70' : ''}`}
                                            onClick={() => handlePieceClick(piece)}
                                        >
                                            <h2 className="text-xl font-semibold text-white flex items-center">
                                                <span className="inline-block w-8 font-bold mr-2">{index + 1}.</span>
                                                {piece.chord_name}
                                            </h2>
                                        </div>
                                    ) : (
                                        <div
                                            key={piece.id}
                                            className={`mb-1 rounded-lg p-2 border-b border-gray-600 hover:cursor-pointer ${currentPiece?.id === piece.id ? 'bg-rose-600/70' : ''}`}
                                            onClick={() => handlePieceClick(piece)}
                                        >
                                            <h2 className="text-xl font-semibold text-white">
                                                {piece.title}
                                                {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                                                {piece.mvt && `, ${piece.mvt}`}
                                            </h2>
                                            <p className="text-lg text-gray-300">{piece.composer}</p>
                                        </div>
                                    )
                                ))
                            ) : (
                                <p className="text-lg text-gray-400 p-4">Aucune pièce trouvée pour ce niveau.</p>
                            )
                        )}
                    </div>

                    <div
                        className="bg-white/10 p-2 flex flex-col items-center w-full border border-white rounded-md mb-5">
                        {currentPiece && (
                            <div className="text-white mb-1">
                                <h2 className="text-xl font-semibold">
                                    {courseName === "Formation Musicale et Auditive" ? (
                                        <>
                                            <span className="font-bold mr-2">
                                                {pieces.findIndex(p => p.id === currentPiece.id) + 1}.
                                            </span>
                                            {currentPiece.chord_name}
                                        </>
                                    ) : (
                                        <>
                                            {currentPiece.title}
                                            {currentPiece.no_mvt && `, Mvt. ${currentPiece.no_mvt}`}
                                            {currentPiece.mvt && `, ${currentPiece.mvt}`}
                                        </>
                                    )}
                                </h2>
                                {courseName !== "Formation Musicale et Auditive" && (
                                    <p className="text-lg">{currentPiece.composer}</p>
                                )}
                            </div>
                        )}

                        <input
                            type="range"
                            ref={progressRef}
                            value={progress}
                            max={duration}
                            onChange={handleProgressChange}
                            className="w-full accent-rose-600"
                        />

                        <div className="flex justify-between w-full text-white text-sm mt-2">
                            <span>{new Date(progress * 1000).toISOString().substr(14, 5)}</span>
                            <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                        </div>

                        <div className="flex justify-around items-center w-full">
                            <button className="text-white" onClick={handlePrevious}>
                                <img src={previousIcon} alt="Previous" className="h-10 w-10"/>
                            </button>
                            <button className="text-white" onClick={handlePlayPause}>
                                <img src={isPlaying ? pauseIcon : playIcon} alt={isPlaying ? "Pause" : "Play"}
                                     className="h-10 w-10"/>
                            </button>
                            <button className="text-white" onClick={handleNext}>
                                <img src={nextIcon} alt="Next" className="h-10 w-10"/>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
