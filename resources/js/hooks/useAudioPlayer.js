import { useRef, useState, useEffect, useCallback } from 'react';
import { AUDIO_BASE_URL } from './audioBaseUrl.js';

// readyState values of a media element
const HAVE_METADATA = 1;
const HAVE_FUTURE_DATA = 3;

const audioUrl = (piece, courseName) => courseName === "Formation Musicale et Auditive"
    ? `${AUDIO_BASE_URL}/storage/fma_chords/${piece.file_name}`
    : `${AUDIO_BASE_URL}/storage/litmus_pieces/${piece.file_name}`;

const releaseAudio = (audioElement) => {
    audioElement.pause();
    audioElement.removeAttribute('src');
    audioElement.load();
};

export const useAudioPlayer = (currentPiece, courseName, onNext, nextPiece = null) => {
    const audioRef = useRef(null);
    // Created once; useRef(new Audio()) would build a throwaway element on every render
    if (audioRef.current === null) {
        audioRef.current = new Audio();
    }
    // Second player that buffers the next piece in the background: { id, audio }
    const preloadRef = useRef(null);
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
        if (currentPiece && currentPieceId !== currentPiece.id) {
            // First, safely pause current audio and cancel any ongoing promises
            safelyPauseAudio();
            setProgress(0);
            setCurrentPieceId(currentPiece.id);

            const preloaded = preloadRef.current;
            if (preloaded && preloaded.id === currentPiece.id) {
                // The next piece is already buffering: switch to that player instead of starting a new download
                releaseAudio(audioRef.current);
                audioRef.current = preloaded.audio;
                preloadRef.current = null;

                const audioElement = audioRef.current;
                audioElement.currentTime = 0;
                setDuration(audioElement.readyState >= HAVE_METADATA ? audioElement.duration : 0);
                setIsLoading(audioElement.readyState < HAVE_FUTURE_DATA);
            } else {
                const audioElement = audioRef.current;
                setDuration(0);
                setIsLoading(true);
                audioElement.src = audioUrl(currentPiece, courseName);
                audioElement.currentTime = 0; // Reset position only for new pieces
            }
        }

        // Listeners go on whichever element is playing now (it may have just been swapped)
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
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.addEventListener('loadstart', handleLoadStart);
            audioElement.addEventListener('ended', handleEnded);
            audioElement.addEventListener('error', handleError);
        }

        return () => {
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.removeEventListener('loadstart', handleLoadStart);
            audioElement.removeEventListener('ended', handleEnded);
            audioElement.removeEventListener('error', handleError);
        };
    }, [currentPiece, courseName, onNext, currentPieceId, safelyPauseAudio]);

    // Buffer the next piece once the current one is ready, so it doesn't compete for bandwidth
    useEffect(() => {
        if (!nextPiece || isLoading || !currentPiece || nextPiece.id === currentPiece.id) return;
        if (preloadRef.current?.id === nextPiece.id) return;

        if (preloadRef.current) {
            releaseAudio(preloadRef.current.audio);
        }

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = audioUrl(nextPiece, courseName);
        audio.load();
        preloadRef.current = { id: nextPiece.id, audio };
    }, [nextPiece, currentPiece, courseName, isLoading]);

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
            if (preloadRef.current) {
                releaseAudio(preloadRef.current.audio);
                preloadRef.current = null;
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

    // Restart the current piece from the beginning. Seek without pausing: the play/pause
    // effect only runs when isPlaying changes, so pausing here while isPlaying is already
    // true would leave the audio paused with the UI still showing it as playing.
    const restartCurrentPiece = useCallback(() => {
        if (currentPiece) {
            const audioElement = audioRef.current;
            audioElement.currentTime = 0;
            setProgress(0);

            if (!isPlaying) {
                setIsPlaying(true);
            } else if (audioElement.paused) {
                audioElement.play().catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error("Error playing audio:", error);
                    }
                    setIsPlaying(false);
                });
            }
        }
    }, [currentPiece, isPlaying]);

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
