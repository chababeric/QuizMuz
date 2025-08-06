import { useRef, useState, useEffect, useCallback } from 'react';

export const useAudioPlayer = (currentPiece, courseName, onNext) => {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPieceId, setCurrentPieceId] = useState(null);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleProgressChange = useCallback((e) => {
        const newProgress = e.target.value;
        audioRef.current.currentTime = newProgress;
        setProgress(newProgress);
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
                const audioSrc = courseName === "Formation Musicale et Auditive"
                    ? `https://www.quizmuz.com/storage/fma_chords/${currentPiece.file_name}`
                    : `https://www.quizmuz.com/storage/litmus_pieces/${currentPiece.file_name}`;

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
    }, [currentPiece, courseName, onNext, currentPieceId]);

    // Separate effect for handling play/pause state
    useEffect(() => {
        const audioElement = audioRef.current;

        if (currentPiece) {
            if (isPlaying) {
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Error playing audio:", error);
                        setIsPlaying(false);
                    });
                }
            } else {
                audioElement.pause();
            }
        }
    }, [isPlaying, currentPiece]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const audioElement = audioRef.current;
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
                audioElement.src = '';
            }
        };
    }, []);

    const resetAudio = useCallback(() => {
        const audioElement = audioRef.current;
        audioElement.pause();
        audioElement.currentTime = 0;
        setProgress(0);
        setIsPlaying(false);
    }, []);

    // New function to restart current piece
    const restartCurrentPiece = useCallback(() => {
        if (currentPiece) {
            const audioElement = audioRef.current;
            audioElement.currentTime = 0;
            setProgress(0);
            setIsPlaying(true);
        }
    }, [currentPiece]);

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
