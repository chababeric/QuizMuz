import { Head, Link } from '@inertiajs/react';
import ControlMusic from "@/Components/ControlMusic.jsx";
import SelectOption from "@/Components/SelectOption.jsx";
import Grader from "@/Components/Grader.jsx";
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function QuizSolo({ auth, pieces, difficulty, level }) {
    const [lastCheckTime, setLastCheckTime] = useState(0);
    const [piecesData, setPiecesData] = useState([]);
    const [selectListData, setSelectListData] = useState([]);
    const [randomPiece, setRandomPiece] = useState(null);
    const [grading, setGrading] = useState(false);
    const [actionText, setActionText] = useState('Vérifier');
    const [startRandomPosition, setStartRandomPosition] = useState(false);
    const [playPieceOnce, setPlayPieceOnce] = useState(false);
    const [playedPieces, setPlayedPieces] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(null);
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
    const audioRef = useRef(null);

    useEffect(() => {
        fetchScore().then(r => {});
        const fetchInitialData = async () => {
            if (pieces.length > 0) {
                await fetchPiecesData();
            }

            if (difficulty === '2') {
                await fetchSelectListData();
            }

            if (piecesData.length > 0) {
                fetchRandomPiece();
            }
        };

        fetchInitialData().then(r => {});
    }, [pieces, difficulty, level, piecesData.length, playedPieces.length]);

    const fetchScore = async () => {
        try {
            const response = await axios.get(route('userScore'));
            setScore(response.data.score);
        } catch (error) {
            console.error('Error fetching the score!', error);
        }
    }

    const fetchPiecesData = async () => {
        try {
            const response = await axios.get(`/api/pieces/`, {
                params: {
                    id: pieces
                }
            });
            setPiecesData(response.data);
            setSelectListData(response.data);

            // After piecesData is set, fetchRandomPiece can be called safely here if piecesData.length > 0
            if (response.data.length > 0) {
                fetchRandomPiece();
            }
        } catch (error) {
            console.error("There was an error fetching the pieces data!", error);
        }
    };

    const fetchSelectListData = async () => {
        try {
            const response = await axios.get(`/api/pieces/level/${level}`);
            setSelectListData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching the pieces data!', error);
        }
    };

    const fetchRandomPiece = () => {
        const availablePieces = piecesData.filter(piece => !playedPieces.includes(piece.id));
        setLoading(false);
        if (availablePieces.length === 0) {
            setRandomPiece(null);
            return;
        }
        const randomIndex = Math.floor(Math.random() * availablePieces.length);
        setRandomPiece(availablePieces[randomIndex]);
    };

    const getPieceUrl = () => {
        return randomPiece ? `https://www.quizmuz.com/storage/litmus_pieces/${randomPiece.file_name}` : null;
    };

    const playMusic = () => {
        setIsPlaying(true);
        const songUrl = getPieceUrl();
        if (songUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            const newAudio = new Audio(songUrl);
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
                    console.error("There was an error playing the music!", error);
                });
            };
            newAudio.load(); // Ensure the audio file is loaded
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

    const incrementTotalPiecesPlayed = async () => {
        try {
            await axios.post('/increment-total-pieces-played',
                { userId: auth.user.id }
            );
        } catch (error) {
            console.error('Error incrementing total pieces played:', error);
        }
    };

    const grade = (action) => {
        stopMusic();
        switch (action) {
            case 'Vérifier':
                updateLastActionTime().then(r => {});
                incrementTotalPiecesPlayed().then(r => {});
                setGrading(true);
                setActionText('Continuer');
                break;
            case 'Continuer':
                if (playPieceOnce && randomPiece) {
                    setPlayedPieces(prevPlayedPieces => [...prevPlayedPieces, randomPiece.id]);
                }
                fetchRandomPiece();
                setGrading(false);
                setLastCheckTime(new Date().getTime());
                setActionText('Vérifier');
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

    const filterElements = () => {
        if (difficulty === '1' && randomPiece) {
            return elements.filter(element => randomPiece[element.col] !== null && randomPiece[element.col] !== '');
        }
        return elements;
    };

    const filteredElements = filterElements();

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    return (
        <div className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Quiz Solo - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Quiz</h1>

            {loading ? (
                <div className="text-white text-center mt-4 text-4xl font-semibold">
                    Chargement...
                </div>
            ) : (
                <>
                    <div className="text-white text-center mt-4 text-2xl font-semibold">
                        Score: {score}
                    </div>
                    {playedPieces.length !== piecesData.length && (
                        <ControlMusic
                            playMusic={playMusic}
                            stopMusic={stopMusic}
                            setRandomPosition={setStartRandomPosition}
                            setPlayPieceOnce={setPlayPieceOnce}
                            isPlaying={isPlaying}
                        />
                    )}

                    {playedPieces.length === piecesData.length ? (
                        <div className="text-white text-center mt-4 text-4xl font-semibold">
                            Toutes les pièces ont été jouées!
                        </div>
                    ) : (
                        grading ? (
                            <Grader
                                auth={auth}
                                piece={randomPiece}
                                userAnswers={selectedAnswers}
                                lastUpdatedTime={lastCheckTime}
                                elements={elements}
                                updateScore={setScore}
                            />
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                {filteredElements.map((element, index) => (
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
                            href={route('mainmenu', { courseId: 3 })}
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

                        {playedPieces.length !== piecesData.length && (
                            <button
                                className="w-24 h-12 text-lg text-black bg-blue-400 hover:bg-blue-600 rounded-lg mr-7 border border-black hover:cursor-pointer hover:text-white hover:border-white"
                                onClick={() => grade(actionText)}
                            >
                                {actionText}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
