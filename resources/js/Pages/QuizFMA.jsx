import { Link, Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import ControlMusic from "@/Components/ControlMusic.jsx";
import axios from 'axios';
import Grader from "@/Components/Grader.jsx";

export default function QuizFMA({ auth, difficulty, level_id, courseId, selectListData, current_chord_mp3, current_score }) {
    const [chordMp3, setChordMp3] = useState(current_chord_mp3);
    const [score, setScore] = useState(current_score);
    const [lastCheckTime, setLastCheckTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [grading, setGrading] = useState(false);
    const [playChordOnce, setPlayChordOnce] = useState(false);
    const [result, setResult] = useState([]);
    const [actionText, setActionText] = useState('Vérifier');
    const audioRef = useRef(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');

    const playMusic = () => {
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

    const checkAnswer = async () => {
        setResult([]);
        setGrading(true);
        try {
            const payload = { selectedAnswer };
            const response = await axios.post(route('checkFMAAnswers'), payload, {
                headers: {
                    'Content-Type': 'application/json', // Explicitly set the Content-Type header
                },
            });
            setResult(response.data.status);
            setScore(response.data.score);
            console.log(response.data);
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
                    'Content-Type': 'application/json', // Explicitly set the Content-Type header
                },
            });

            setChordMp3(response.data.current_chord_mp3);
        } catch (error) {
            console.error("Error fetching next chord:", error);
        }
    };

    const grade = (action) => {
        stopMusic();
        switch (action) {
            case 'Vérifier':
                checkAnswer().then(r => {});
                setGrading(true);
                setActionText('Continuer');
                break;
            case 'Continuer':
                setGrading(false);
                setActionText('Vérifier');
                setLastCheckTime(new Date().getTime());
                setSelectedAnswer('');
                getNextChord().then(r => {});
                break;
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
                    <div className="flex justify-center mt-6">
                        <table className="border-collapse">
                            <thead>
                            <tr>
                                <th className="border border-white text-white px-4 py-2">Votre réponse</th>
                                <th className="border border-white text-white px-4 py-2">Bonne réponse</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className={`border border-white px-4 py-2 ${result === 'correct' ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                                    <span className="text-white">{selectedAnswer}</span>
                                </td>
                                <td className="border border-white px-4 py-2">
                                    <span className="text-white">{result === 'correct' ? selectedAnswer : result}</span>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full mt-6">
                        <select id={"Réponse"} name={"Réponse"} value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)} className="user-input hover:cursor-pointer">
                            <option className="bg-black/80 text-white" value="">{'Sélectionnez une réponse'}</option>
                            {selectListData.map((item, index) => (
                                <option className="bg-black/80 text-white" key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                )
            )}

            <div className="flex justify-center mt-5">
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
