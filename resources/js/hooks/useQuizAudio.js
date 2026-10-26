import { useRef, useState, useCallback, useEffect } from 'react';
import { AUDIO_BASE_URL } from './audioBaseUrl.js';

const HAVE_METADATA = 1;

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

    // One player per piece, created as soon as the piece is known so the file
    // downloads while the student reads the questions. Replays reuse it.
    useEffect(() => {
        if (!audioFile) return;

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = getAudioUrl(audioFile);
        audio.onended = () => setIsPlaying(false);
        audio.load();
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.onended = null;
            audio.onloadedmetadata = null;
            audio.onerror = null;
            audio.removeAttribute('src');
            audio.load();
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            setIsPlaying(false);
            setIsLoading(false);
        };
    }, [audioFile, getAudioUrl]);

    const playAudio = useCallback((startAtRandomPosition = false) => {
        const audio = audioRef.current;
        if (!audio || isLoading) return;

        setIsPlaying(true);

        const start = () => {
            setIsLoading(false);

            if (startAtRandomPosition && audioType === 'piece') {
                const maxRandomStartTime = Math.max(0, audio.duration - 20);
                audio.currentTime = Math.random() * maxRandomStartTime;
            } else {
                audio.currentTime = 0;
            }

            audio.play().catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
                setIsLoading(false);
            });
        };

        audio.onerror = () => {
            console.error("Error loading audio");
            setIsPlaying(false);
            setIsLoading(false);
        };

        // The duration is needed for the random start, so wait for the metadata if it isn't there yet
        if (audio.readyState >= HAVE_METADATA) {
            start();
        } else {
            setIsLoading(true);
            audio.onloadedmetadata = () => {
                audio.onloadedmetadata = null;
                start();
            };
        }
    }, [isLoading, audioType]);

    const stopAudio = useCallback(() => {
        setIsPlaying(false);
        setIsLoading(false);

        const audio = audioRef.current;
        if (audio) {
            audio.onloadedmetadata = null;
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    const cleanup = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.onloadedmetadata = null;
            audio.pause();
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
