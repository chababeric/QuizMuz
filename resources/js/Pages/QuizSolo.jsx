import { Head, Link } from '@inertiajs/react';
import SelectOption from "@/Components/SelectOption.jsx";
import Grader from "@/Components/Grader.jsx";
import React, { useEffect, useRef, useState } from 'react';
import ControlMusic from "@/Components/ControlMusic.jsx";
import axios from "axios";

export default function QuizSolo({ auth, difficulty, level, courseId, current_piece_mp3, selectListData, current_score, parameters_to_display, game_key }) {
    const [pieceMp3, setPieceMp3] = useState(current_piece_mp3);
    const [score, setScore] = useState(current_score);
    const [parametersToDisplay, setParametersToDisplay] = useState([]);
    const [lastCheckTime, setLastCheckTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startRandomPosition, setStartRandomPosition] = useState(false);
    const [playPieceOnce, setPlayPieceOnce] = useState(false);
    const [grading, setGrading] = useState(false);
    const [actionText, setActionText] = useState('Vérifier');
    const audioRef = useRef(null);
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
    const elements = [
        { name: "Période", col: "period" },
        { name: "Genre", col: "genre" },
        { name: "Compositeur", col: "composer" },
        { name: "Titre", col: "title" },
        { name: "Élément", col: "element" },
        { name: "No. mouvement", col: "no_mvt" },
        { name: "Nom mouvement ou partie", col: "mvt" },
        { name: "Forme", col: "form" }
    ];

    console.log('parameters_to_display:', parameters_to_display);
    console.log('elements:', selectListData);

    useEffect(() => {
        // Filter out parameters that are null or empty for the current difficulty
        const filteredParameters = elements.filter(element => parameters_to_display.includes(element.col));
        setParametersToDisplay(filteredParameters);
    }, [parameters_to_display]);

    // useEffect(() => {
    //     if (game_key) {
    //         localStorage.setItem("game_key", game_key); // Save the key to localStorage
    //     }
    // }, [game_key]);

    const playMusic = () => {
        setIsPlaying(true);
        if (pieceMp3) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            const newAudio = new Audio(`https://www.quizmuz.com/storage/litmus_pieces/${pieceMp3}`);
            newAudio.onloadeddata = () => {
                if (startRandomPosition) {
                    const maxRandomStartTime = newAudio.duration - 20;
                    newAudio.currentTime = Math.random() * maxRandomStartTime;
                } else {
                    newAudio.currentTime = 0;
                }
                newAudio.play().then(() => {
                    audioRef.current = newAudio;
                }).catch(error => {
                    console.error("There was an error playing the audio!", error);
                })
            };
            newAudio.load();
        }
    };

    const stopMusic = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleAnswerChange = (col, value) => {
        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            [col]: col === 'no_mvt' ? parseInt(value, 10) : value
        }));
    };

    const updateLastActionTime = async () => {
        try {
            await axios.post('/update-last-action-time');
        } catch (error) {
            console.error('Error updating last action time:', error);
        }
    };

    const checkAnswers = async () => {
        try {
            const payload = {
                selectedAnswers,
                playPieceOnce,
            };
            const response = await axios.post(route('checkAnswers'), payload, {
                headers: {
                    'Content-Type': 'application/json', // Explicitly set the Content-Type header
                },
            });
            setScore(response.data.score);
            setPieceMp3(response.data.current_piece_mp3);
            console.log('Response:', response.data);
            // return response.data;
        } catch (error) {
            console.error('Error checking answers:', error.response?.data || error.message);
        }
    };


    const grade = (action) => {
        stopMusic();
        switch (action) {
            case 'Vérifier':
                checkAnswers().then(response => {});
                updateLastActionTime().then(r => {});
                setGrading(true);
                setActionText('Continuer');
                break;
            case 'Continuer':
                setGrading(false);
                setActionText('Vérifier');
                setLastCheckTime(new Date().getTime());
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
            {pieceMp3 && (
                <ControlMusic
                    playMusic={playMusic}
                    stopMusic={stopMusic}
                    setRandomPosition={setStartRandomPosition}
                    setPlayPieceOnce={setPlayPieceOnce}
                    isPlaying={isPlaying}
                />
            )}

            {!pieceMp3 ? (
                <div className="text-white text-center mt-4 text-4xl font-semibold">
                    Toutes les pièces ont été jouées!
                </div>
            ) : (
                grading ? (
                    <Grader
                    />
                ) : (
                    <div className="flex flex-col items-center w-full">
                        {parametersToDisplay.map((element, index) => (
                            <SelectOption
                                key={index}
                                name={element.name}
                                col={element.col}
                                data={selectListData}
                                onChange={(value) => handleAnswerChange(element.col, value)}
                                lastUpdatedTime={lastCheckTime}
                                difficulty={difficulty}
                            />
                        ))}
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

                {pieceMp3 && (
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
};
