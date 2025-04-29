import { Link, Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import ControlMusic from "@/Components/ControlMusic.jsx";
import axios from 'axios';

export default function QuizFMA({ auth, difficulty, level_id, courseId, selectListData, current_chord_mp3, current_score }) {
    const [isClient, setIsClient] = useState(false);
    const [chordMp3, setChordMp3] = useState(current_chord_mp3);
    const [score, setScore] = useState(current_score);
    const [isPlaying, setIsPlaying] = useState(false);
    const [grading, setGrading] = useState(false);
    const [playChordOnce, setPlayChordOnce] = useState(false);
    const [result, setResult] = useState({ status: '', correctAnswer: '' });
    const [actionText, setActionText] = useState('Vérifier');
    const audioRef = useRef(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [chordCount, setChordCount] = useState(difficulty === '3' ? (selectListData?.chordCount || 0) : 0);
    const [chordInputs, setChordInputs] = useState(Array(chordCount).fill(''));

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Initialize chord inputs when component loads
        if (difficulty === '3' && selectListData?.chordCount) {
            setChordCount(selectListData.chordCount);
            setChordInputs(Array(selectListData.chordCount).fill(''));
        }
    }, []);

    const playMusic = () => {
        if (!isClient) return;

        setIsPlaying(true);
        if (chordMp3) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            const newAudio = new Audio(`https://www.quizmuz.com/storage/fma_chords/${chordMp3}`);
            newAudio.onloadeddata = () => {
                newAudio.currentTime = 0;
                newAudio.play();
            };
            audioRef.current = newAudio;
        }
    };

    const stopMusic = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    const handleChordInputChange = (index, value) => {
        const newInputs = [...chordInputs];
        newInputs[index] = value;
        setChordInputs(newInputs);
        setSelectedAnswer(newInputs.join(' - '));
    };

    const checkAnswer = async () => {
        setResult([]);
        setGrading(true);
        try {
            const payload = { selectedAnswer };
            const response = await axios.post(route('checkFMAAnswers'), payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setResult({
                status: response.data.status,
                correctAnswer: response.data.correctAnswer
            });
            setScore(response.data.score);
        } catch (error) {
            console.error("Error checking answer:", error);
        }
    };

    const getNextChord = async () => {
        setGrading(false);
        try {
            const payload = { playChordOnce };
            const response = await axios.post(route('getNextChord'), payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setChordMp3(response.data.current_chord_mp3);

            // Update chord count for hard difficulty
            if (difficulty === '3' && response.data.chordsData) {
                const newChordCount = response.data.chordsData.chordCount || 0;
                setChordCount(newChordCount);
                setChordInputs(Array(newChordCount).fill(''));
            }
        } catch (error) {
            console.error("Error fetching next chord:", error);
        }
    };

    const grade = (action) => {
        stopMusic();
        switch (action) {
            case 'Vérifier':
                checkAnswer();
                setGrading(true);
                setActionText('Continuer');
                break;
            case 'Continuer':
                setGrading(false);
                setActionText('Vérifier');
                setSelectedAnswer('');
                // Clear the inputs by resetting them to empty strings
                if (difficulty === '3') {
                    setChordInputs(Array(chordCount).fill(''));
                }
                getNextChord();
                break;
        }
    };

    const renderAnswerInput = () => {
        if (difficulty === '3') {
            return (
                <div className="w-full px-4 mt-6">
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center">
                        {Array(chordCount).fill().map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                value={chordInputs[index] || ''}
                                onChange={(e) => handleChordInputChange(index, e.target.value)}
                                className="border border-white p-2.5 text-center bg-black/80 text-white text-lg w-24 h-12 mx-auto rounded-lg"
                                placeholder={`#${index+1}`}
                            />
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center w-full mt-6">
                    <select id={"Réponse"} name={"Réponse"} value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)} className="user-input hover:cursor-pointer">
                        <option className="bg-black/80 text-white" value="">{'Sélectionnez une réponse'}</option>
                        {selectListData.map((item, index) => (
                            <option className="bg-black/80 text-white" key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            );
        }
    };

    return (
        <div className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Quiz - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Quiz</h1>

            <div className="text-white text-center mt-4 text-2xl font-semibold">
                Score: {score}
            </div>
            {chordMp3 && (
                <ControlMusic
                    playMusic={playMusic}
                    stopMusic={stopMusic}
                    setPlayPieceOnce={setPlayChordOnce}
                    isPlaying={isPlaying}
                    disableRandomPosition={true}
                />
            )}

            {!chordMp3 ? (
                <div className="text-white text-center mt-4 text-4xl font-semibold">
                    Toutes les formules ont été jouées!
                </div>
            ) : (
                grading ? (
                    <div className="flex flex-col items-center w-full mt-4">
                        <h2 className="text-3xl font-bold text-white mb-4">Correction</h2>
                        <div className="w-11/12 bg-white/80 rounded-lg overflow-hidden">
                            <table className="table-auto w-full">
                                <thead>
                                <tr>
                                    <th className="px-4 py-2 text-center text-xl w-1/3">Formule</th>
                                    <th className="px-4 py-2 text-center text-xl w-1/3">Réponse</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr
                                    className={`text-center border-b border-gray-200 text-lg ${
                                        result.status === 'correct' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                >
                                    <td className="px-4 py-2">{selectedAnswer}</td>
                                    <td className="px-4 py-2">{result.status === 'correct' ? selectedAnswer : result.correctAnswer}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    renderAnswerInput()
                )
            )}

            <div className="flex justify-center mt-8">
                <Link
                    href={route('mainmenu', { courseId: courseId })}
                    className="flex items-center text-white font-bold py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-900 mr-4 border border-white"
                    onClick={() => {
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                        }
                    }}
                >
                    Retourner au menu
                </Link>

                {chordMp3 && (
                    <button
                        className="w-24 h-12 text-lg text-black bg-blue-400 hover:bg-blue-600 rounded-lg mr-7 border border-black hover:cursor-pointer hover:text-white hover:border-white"
                        onClick={() => grade(actionText)}
                    >
                        {actionText}
                    </button>
                )}
            </div>
        </div>
    );
}
