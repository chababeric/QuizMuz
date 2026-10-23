import { useRef, useState, useEffect, useCallback } from 'react';
import { AUDIO_BASE_URL } from './audioBaseUrl.js';

export const useAudioPlayer = (currentPiece, courseName, onNext) => {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPieceId, setCurrentPieceId] = useState(null);
    const playPromiseRef = useRef(null); // Track ongoing play promises

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleProgressChange = useCallback((e) => {
        const newProgress = e.target.value;
        audioRef.current.currentTime = newProgress;
        setProgress(newProgress);
    }, []);

    // Helper function to safely pause audio and cancel any ongoing play promises
    const safelyPauseAudio = useCallback(() => {
        const audioElement = audioRef.current;

        // Cancel any ongoing play promise
        if (playPromiseRef.current) {
            playPromiseRef.current.catch(() => {
                // Ignore any errors from cancelled play promises
            });
            playPromiseRef.current = null;
        }

        // Pause the audio
        if (!audioElement.paused) {
            audioElement.pause();
        }
    }, []);

    // Separate effect for handling piece changes vs play/pause
    useEffect(() => {
        const audioElement = audioRef.current;

        const handleTimeUpdate = () => setProgress(audioElement.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audioElement.duration);
            setIsLoading(false);
        };
        const handleCanPlayThrough = () => setIsLoading(false);
        const handleLoadStart = () => setIsLoading(true);
        const handleEnded = () => onNext();
        const handleError = (error) => {
            console.error("Audio loading error:", error);
            setIsLoading(false);
            setIsPlaying(false);
        };

        if (currentPiece) {
            // Check if this is a new piece
            const isNewPiece = currentPieceId !== currentPiece.id;

            if (isNewPiece) {
                // First, safely pause current audio and cancel any ongoing promises
                safelyPauseAudio();

                const audioSrc = courseName === "Formation Musicale et Auditive"
                    ? `${AUDIO_BASE_URL}/storage/fma_chords/${currentPiece.file_name}`
                    : `${AUDIO_BASE_URL}/storage/litmus_pieces/${currentPiece.file_name}`;

                // Only reset states when changing to a new piece
                setProgress(0);
                setDuration(0);
                setIsLoading(true);
                setCurrentPieceId(currentPiece.id);

                audioElement.src = audioSrc;
                audioElement.currentTime = 0; // Reset position only for new pieces
            }

            // Add event listeners (always needed)
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.addEventListener('loadstart', handleLoadStart);
            audioElement.addEventListener('ended', handleEnded);
            audioElement.addEventListener('error', handleError);
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('timeupdate', handleTimeUpdate);
                audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
                audioElement.removeEventListener('loadstart', handleLoadStart);
                audioElement.removeEventListener('ended', handleEnded);
                audioElement.removeEventListener('error', handleError);
            }
        };
    }, [currentPiece, courseName, onNext, currentPieceId, safelyPauseAudio]);

    // Separate effect for handling play/pause state
    useEffect(() => {
        const audioElement = audioRef.current;

        if (currentPiece) {
            if (isPlaying) {
                // Cancel any previous play promise before starting a new one
                if (playPromiseRef.current) {
                    playPromiseRef.current.catch(() => {
                        // Ignore errors from cancelled promises
                    });
                }

                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromiseRef.current = playPromise;
                    playPromise
                        .then(() => {
                            // Play succeeded, clear the promise reference
                            playPromiseRef.current = null;
                        })
                        .catch(error => {
                            // Only log errors that aren't AbortErrors from rapid clicking
                            if (error.name !== 'AbortError') {
                                console.error("Error playing audio:", error);
                            }
                            setIsPlaying(false);
                            playPromiseRef.current = null;
                        });
                }
            } else {
                safelyPauseAudio();
            }
        }
    }, [isPlaying, currentPiece, safelyPauseAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const audioElement = audioRef.current;
            if (audioElement) {
                safelyPauseAudio();
                audioElement.currentTime = 0;
                audioElement.src = '';
            }
        };
    }, [safelyPauseAudio]);

    const resetAudio = useCallback(() => {
        const audioElement = audioRef.current;
        safelyPauseAudio();
        audioElement.currentTime = 0;
        setProgress(0);
        setIsPlaying(false);
    }, [safelyPauseAudio]);

    // New function to restart current piece
    const restartCurrentPiece = useCallback(() => {
        if (currentPiece) {
            const audioElement = audioRef.current;
            safelyPauseAudio();
            audioElement.currentTime = 0;
            setProgress(0);
            setIsPlaying(true);
        }
    }, [currentPiece, safelyPauseAudio]);

    return {
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
    };
};
