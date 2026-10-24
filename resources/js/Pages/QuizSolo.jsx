import SelectOption from "@/Components/SelectOption.jsx";
import Grader from "@/Components/Grader.jsx";
import ControlMusic from "@/Components/ControlMusic.jsx";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuizAudio } from "@/hooks/useQuizAudio.js";
import { useQuizApi } from "@/hooks/useQuizApi.js";
import { QuizActionButton, QuizCompleted, QuizError, QuizLayout, QuizScore, quizCard } from '@/Components/QuizUi';

export default function QuizSolo({
                                     auth,
                                     difficulty,
                                     level,
                                     courseId,
                                     courseName,
                                     current_piece_mp3,
                                     selectListData,
                                     current_score,
                                     parameters_to_display
                                 }) {
    // State management
    const [pieceMp3, setPieceMp3] = useState(current_piece_mp3);
    const [score, setScore] = useState(current_score);
    const [parametersToDisplay, setParametersToDisplay] = useState([]);
    const [startRandomPosition, setStartRandomPosition] = useState(false);
    const [playPieceOnce, setPlayPieceOnce] = useState(false);
    const [grading, setGrading] = useState(false);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedAnswers, setSelectedAnswers] = useState({
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: ''
    });

    // Custom hooks
    const { isPlaying, playAudio, stopAudio, cleanup } = useQuizAudio(pieceMp3, 'piece');
    const { makeApiCall } = useQuizApi();

    // Constants
    const elements = useMemo(() => {
        const isHistoireDeLaMusique = courseName === 'Histoire de la Musique';

        if (isHistoireDeLaMusique) {
            return [
                { name: "Titre", col: "title" },
                { name: "Compositeur", col: "composer" },
                { name: "Répertoire", col: "element" },
                { name: "Date (siècle)", col: "period" },
                { name: "Genre", col: "genre" },
                { name: "Option", col: "form" }
            ];
        } else {
            // Littérature Musicale or default
            return [
                { name: "Période", col: "period" },
                { name: "Genre", col: "genre" },
                { name: "Compositeur", col: "composer" },
                { name: "Titre", col: "title" },
                { name: "Élément", col: "element" },
                { name: "No. mouvement", col: "no_mvt" },
                { name: "Nom mouvement", col: "mvt" },
                { name: "Forme", col: "form" }
            ];
        }
    }, [courseName]);

    const actionText = grading ? 'Continuer' : 'Vérifier';
    const hasActivePiece = Boolean(pieceMp3);

    // Event handlers
    const handlePlayMusic = useCallback(() => {
        playAudio(startRandomPosition);
    }, [playAudio, startRandomPosition]);

    const handleStopMusic = useCallback(() => {
        stopAudio();
    }, [stopAudio]);

    const handleAnswerChange = useCallback((col, value) => {
        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            // [col]: col === 'no_mvt' ? parseInt(value, 10) || '' : value
            [col]: value
        }));
    }, []);

    const resetAnswers = useCallback(() => {
        setSelectedAnswers({
            period: '',
            genre: '',
            composer: '',
            title: '',
            element: '',
            no_mvt: '',
            mvt: '',
            form: ''
        });
    }, []);

    // API calls
    const checkAnswers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const response = await makeApiCall(route('checkAnswers'), { selectedAnswers });
        if (response.success) {
            setScore(response.data.score);
            setResults(response.data.results);
        } else {
            setError('Erreur lors de la vérification des réponses');
        }

        setIsLoading(false);
    }, [selectedAnswers, makeApiCall]);

    const getNextPiece = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const response = await makeApiCall(route('getNextPiece'), { playPieceOnce });

        if (response.success) {
            setPieceMp3(response.data.current_piece_mp3);

            if (response.data.parameters_to_display) {
                const filteredParameters = elements.filter(element =>
                    response.data.parameters_to_display.includes(element.col)
                );
                setParametersToDisplay(filteredParameters);
            }
        } else {
            setError('Erreur lors du chargement de la pièce suivante');
        }

        setIsLoading(false);
    }, [playPieceOnce, makeApiCall, elements]);

    const handleGrade = useCallback(async (action) => {
        handleStopMusic();

        if (action === 'Vérifier') {
            await checkAnswers();
            setGrading(true);
        } else if (action === 'Continuer') {
            setGrading(false);
            setResults([]);
            setError(null);
            resetAnswers();
            await getNextPiece();
        }
    }, [checkAnswers, getNextPiece, resetAnswers, handleStopMusic]);

    // Effects
    useEffect(() => {
        const filteredParameters = elements.filter(element =>
            parameters_to_display.includes(element.col)
        );
        setParametersToDisplay(filteredParameters);
    }, [parameters_to_display, elements]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const questionCount = parametersToDisplay.length;

    return (
        <QuizLayout
            headTitle="Quiz - QuizMuz"
            courseId={courseId}
            isLoading={isLoading}
            completed={!hasActivePiece && <QuizCompleted courseId={courseId} message="Toutes les pièces ont été jouées !"/>}
            sidebar={
                <>
                    <QuizScore score={score}/>
                    <ControlMusic
                        playMusic={handlePlayMusic}
                        stopMusic={handleStopMusic}
                        setRandomPosition={setStartRandomPosition}
                        setPlayPieceOnce={setPlayPieceOnce}
                        isPlaying={isPlaying}
                        disabled={isLoading}
                    />
                </>
            }
            action={<QuizActionButton grading={grading} isLoading={isLoading} actionText={actionText} onClick={() => handleGrade(actionText)}/>}
        >
            <QuizError message={error}/>

            {/* Questions, then results after checking */}
            <section aria-labelledby="quiz-panel-heading" className={`${quizCard} p-5 md:p-6`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="quiz-panel-heading" className="text-[20px] font-semibold">{grading ? 'Résultats' : 'Questions'}</h2>
                    {!grading && (
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
                            {questionCount} question{questionCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                {grading ? (
                    <Grader results={results} elements={elements} />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {parametersToDisplay.map((element, index) => (
                            <SelectOption
                                key={element.col}
                                name={element.name}
                                col={element.col}
                                data={selectListData}
                                value={selectedAnswers[element.col]}
                                onChange={handleAnswerChange}
                                disabled={isLoading}
                                difficulty={difficulty}
                                lastUpdatedTime={index}
                            />
                        ))}
                    </div>
                )}
            </section>
        </QuizLayout>
    );
}
