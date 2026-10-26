import ControlMusic from "@/Components/ControlMusic.jsx";
import React, { useState, useEffect, useCallback } from 'react';
import { useQuizAudio } from "@/hooks/useQuizAudio.js";
import { useQuizApi } from "@/hooks/useQuizApi.js";
import { CircleCheckIcon, CircleXIcon } from '@/Components/AppIcons';
import { QuizActionButton, QuizCompleted, QuizError, QuizLayout, QuizScore, fieldClass, quizCard } from '@/Components/QuizUi';

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
    const renderAnswerInput = () => {
        if (isHardDifficulty) {
            return (
                <div className="flex flex-col gap-4">
                    <h3 className="text-[15px] font-semibold text-[#C9CCDA]">Tapez les accords dans l'ordre</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {Array(chordCount).fill().map((_, index) => (
                            <div key={index} className="flex flex-col gap-1.5">
                                <label htmlFor={`chord-${index}`} className="text-[13px] font-medium text-[#A9AEC2]">#{index + 1}</label>
                                <input
                                    id={`chord-${index}`}
                                    type="text"
                                    value={chordInputs[index] || ''}
                                    onChange={(e) => handleChordInputChange(index, e.target.value)}
                                    disabled={isLoading}
                                    className={`${fieldClass} px-2 text-center ${chordInputs[index] ? 'border-[rgba(30,158,98,0.6)]' : 'border-white/[0.12]'}`}
                                    placeholder="?"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // For easy difficulty, show dropdown
        if (Array.isArray(selectListData)) {
            return (
                <div className="flex flex-col gap-2">
                    <label htmlFor="fma-answer" className="text-[15px] font-semibold text-[#C9CCDA]">Sélectionnez la formule</label>
                    <select
                        id="fma-answer"
                        value={selectedAnswer}
                        onChange={handleSelectChange}
                        disabled={isLoading}
                        className={`${fieldClass} cursor-pointer ${selectedAnswer ? 'border-[rgba(30,158,98,0.6)]' : 'border-white/[0.12] hover:border-white/[0.25]'}`}
                    >
                        <option value="" className="bg-[#0B0D18] text-[#F2F3F8]">Sélectionnez une réponse</option>
                        {selectListData.map((item, index) => (
                            <option key={index} value={item} className="bg-[#0B0D18] text-[#F2F3F8]">
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <p className="py-6 text-center text-[16px] text-[#C9CCDA]">Aucune option disponible</p>
        );
    };

    const renderGradingResults = () => {
        const isCorrect = result.status === 'correct';
        const StatusIcon = isCorrect ? CircleCheckIcon : CircleXIcon;
        return (
            <div className={`rounded-[16px] border px-4 py-4 flex flex-col gap-3 ${
                isCorrect
                    ? 'border-[rgba(30,158,98,0.35)] bg-[rgba(30,158,98,0.08)]'
                    : 'border-[rgba(224,86,108,0.35)] bg-[rgba(224,86,108,0.08)]'
            }`}>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-medium text-[#A9AEC2]">Résultat</span>
                    <span className={`inline-flex items-center gap-1.5 text-[15px] font-semibold ${isCorrect ? 'text-[#5FD39A]' : 'text-[#F07A8D]'}`}>
                        <StatusIcon className="w-5 h-5"/>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <dt className="text-[13px] text-[#A9AEC2]">Votre réponse</dt>
                        <dd className="text-[16px] font-semibold text-[#F2F3F8]">{selectedAnswer || 'Aucune réponse'}</dd>
                    </div>
                    <div>
                        <dt className="text-[13px] text-[#A9AEC2]">Réponse correcte</dt>
                        <dd className="text-[16px] font-semibold text-[#F2F3F8]">{result.correctAnswer}</dd>
                    </div>
                </dl>
            </div>
        );
    };

    return (
        <QuizLayout
            headTitle="Quiz FMA - QuizMuz"
            courseId={courseId}
            isLoading={isLoading}
            completed={!hasActiveChord && <QuizCompleted courseId={courseId} message="Toutes les formules ont été jouées !"/>}
            sidebar={
                <>
                    <QuizScore score={score}/>
                    <ControlMusic
                        playMusic={handlePlayMusic}
                        stopMusic={handleStopMusic}
                        setPlayPieceOnce={setPlayChordOnce}
                        isPlaying={isPlaying}
                        disableRandomPosition={true}
                        disabled={isLoading}
                    />
                </>
            }
            action={<QuizActionButton grading={grading} isLoading={isLoading} actionText={actionText} onClick={() => handleGrade(actionText)}/>}
        >
            <QuizError message={error}/>

            <section aria-labelledby="quiz-panel-heading" className={`${quizCard} p-5 md:p-6`}>
                <h2 id="quiz-panel-heading" className="mb-4 text-[20px] font-semibold">
                    {grading ? 'Résultats' : 'Formule Harmonique'}
                </h2>
                {grading ? renderGradingResults() : renderAnswerInput()}
            </section>
        </QuizLayout>
    );
}
