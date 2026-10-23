import { useRef, useState, useCallback } from 'react';
import { AUDIO_BASE_URL } from './audioBaseUrl.js';

export const useQuizAudio = (audioFile, audioType = 'piece') => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getAudioUrl = useCallback((filename) => {
        const baseUrl = audioType === 'chord'
            ? `${AUDIO_BASE_URL}/storage/fma_chords/`
            : `${AUDIO_BASE_URL}/storage/litmus_pieces/`;
        return `${baseUrl}${filename}`;
    }, [audioType]);

    const playAudio = useCallback((startAtRandomPosition = false) => {
        if (!audioFile || isLoading) return;

        setIsLoading(true);
        setIsPlaying(true);

        // Clean up existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const newAudio = new Audio(getAudioUrl(audioFile));

        newAudio.onloadeddata = () => {
            setIsLoading(false);

            if (startAtRandomPosition && audioType === 'piece') {
                const maxRandomStartTime = Math.max(0, newAudio.duration - 20);
                newAudio.currentTime = Math.random() * maxRandomStartTime;
            } else {
                newAudio.currentTime = 0;
            }

            newAudio.play().catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
                setIsLoading(false);
            });
        };

        newAudio.onerror = () => {
            console.error("Error loading audio");
            setIsPlaying(false);
            setIsLoading(false);
        };

        newAudio.onended = () => {
            setIsPlaying(false);
        };

        audioRef.current = newAudio;
        newAudio.load();
    }, [audioFile, audioType, isLoading, getAudioUrl]);

    const stopAudio = useCallback(() => {
        setIsPlaying(false);
        setIsLoading(false);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    const cleanup = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setIsLoading(false);
    }, []);

    return {
        isPlaying,
        isLoading,
        playAudio,
        stopAudio,
        cleanup
    };
};
