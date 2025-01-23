import Checkbox from '@/Components/Checkbox';
import { Link, Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OptionsMenu({ auth, level, courseId, courseName }) {
    const [pieces, setPieces] = useState([]);
    const [checkedPieces, setCheckedPieces] = useState([]);
    const [checkText, setCheckText] = useState("Sélectionner tout");
    const [difficulty, setDifficulty] = useState(auth.user.last_difficulty || 1);
    const [canPlay, setCanPlay] = useState(false);

    useEffect(() => {
        if (level) {
            if (courseName === "Formation Musicale et Auditive") {
                axios.get(`/api/chords/level/${level}`)
                    .then(response => {
                        const sortedPieces = sortPiecesByOrder(response.data);
                        setPieces(sortedPieces);
                    })
                    .catch(error => {
                        console.error("There was an error fetching the chords!", error);
                    });
            }
            else {
                axios.get(`/api/pieces/level/${level}`)
                    .then(response => {
                        const sortedPieces = sortPiecesByOrder(response.data);
                        setPieces(sortedPieces);
                    })
                    .catch(error => {
                        console.error("There was an error fetching the pieces!", error);
                    });
            }
        }
    }, [level]);

    const sortPiecesByOrder = (pieces) => {
        return pieces.sort((a, b) => {
            return a.order - b.order;
        });
    };

    useEffect(() => {
        setCanPlay(checkedPieces.length >= 2);
    }, [checkedPieces]);

    const handleCheckAll = (event) => {
        if (event.target.checked) {
            const allPieceIds = pieces.map(piece => piece.id);
            setCheckedPieces(allPieceIds);
        } else {
            setCheckedPieces([]);
        }
        setCheckText(event.target.checked ? "Enlever la sélection" : "Sélectionner tout");
    };

    const handleCheckItem = (pieceId) => {
        setCheckedPieces(prevState =>
            prevState.includes(pieceId)
                ? prevState.filter(id => id !== pieceId)
                : [...prevState, pieceId]
        );
    };

    useEffect(() => {
        axios.post('/set-difficulty', {difficulty: difficulty, userId: auth.user.id})
            .then(() => {
            })
            .catch(error => {
                console.error("There was an error setting the difficulty!", error);
            });
    }, [difficulty]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(route('quizsolo.store'), {
                pieces_list_id: checkedPieces,
                difficulty: parseInt(difficulty),
                level: level,
                courseId: courseId
            });

            window.location.href = route('quizsolo', {
                pieces: checkedPieces,
                difficulty: difficulty,
                level: level,
                courseId: courseId
            });
        } catch (error) {
            console.error("There was an error starting the quiz!", error);
        }
    };

    return (
        <div className="main-app">
            <div className="background-container"></div>
            <Head title="Paramètres - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Paramètres</h1>

            <div
                className="block mt-4 bg-white/50 p-4 rounded-lg w-11/12 max-h-96 overflow-y-auto text-center hide-scrollbar">
                <span className="text-black text-3xl mb-4 block hover:cursor-default">
                    Choisir les pièces à inclure dans le quiz
                </span>
                {pieces.length > 0 ? (
                    <>
                        <label className="flex items-center mb-5">
                            <Checkbox onChange={handleCheckAll}/>
                            <span className="ml-2 text-lg text-black">{checkText}</span>
                        </label>
                        <ul>
                            {pieces.map(piece => (
                                <li key={piece.id}>
                                    <label className="flex items-center w-full mb-3">
                                        <Checkbox
                                            checked={checkedPieces.includes(piece.id)}
                                            onChange={() => handleCheckItem(piece.id)}
                                        />
                                        <span className="ml-2 text-lg text-black text-left">
                                            {courseName === "Formation Musicale et Auditive" ? piece.chord_name :
                                                <>
                                                    {piece.composer} - {piece.title}
                                                    {piece.element && ` - ${piece.element}`}
                                                    {piece.no_mvt && ` - Mvt.${piece.no_mvt}`}
                                                    {piece.mvt && ` - ${piece.mvt}`}
                                                </>
                                            }
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-black text-2xl hover:cursor-default">
                        Il n'y a pas de pièces trouvées pour ce niveau.
                    </p>
                )}
            </div>

            <div className="w-full px-4 text-center mt-6">
                <span className="text-white text-3xl mb-4 block hover:cursor-default">
                    Choisir le niveau de difficulté
                </span>

                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        className={`border-2 border-white p-2.5 text-center cursor-pointer bg-black text-white text-lg w-18 max-w-24 mx-auto rounded-lg hover:bg-opacity-80 hover:shadow-greenGlow
                        ${difficulty === 1 && 'bg-black text-black shadow-greenGlow'}`}
                        onClick={() => setDifficulty(1)}
                    >
                        Facile
                    </button>
                    {courseName !== "Formation Musicale et Auditive" && (
                        <button
                            className={`border-2 border-white p-2.5 text-center cursor-pointer bg-black text-white text-lg w-18 max-w-24 mx-auto rounded-lg hover:bg-opacity-80 hover:shadow-greenGlow
                            ${difficulty === 2 && 'bg-black text-black shadow-greenGlow'}`}
                            onClick={() => setDifficulty(2)}
                        >
                            Moyen
                        </button>
                    )}
                    <button
                        className={`border-2 border-white p-2.5 text-center cursor-pointer bg-black text-white text-lg w-18 max-w-24 mx-auto rounded-lg hover:bg-opacity-80 hover:shadow-greenGlow
                        ${difficulty === 3 && 'bg-black text-black shadow-greenGlow'}`}
                        onClick={() => setDifficulty(3)}
                    >
                        Difficile
                    </button>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <Link
                    href={route('mainmenu', { courseId: courseId })}
                    className="text-white font-bold py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-900 mt-4 mr-4 border border-white">
                    Retourner au menu
                </Link>

                {canPlay ? (
                    courseName === "Formation Musicale et Auditive" ? (
                        <Link
                            href={route('quizfma', {chords: checkedPieces, difficulty: difficulty, level: level, courseId: courseId})}
                            className="text-white font-bold py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-800 mt-4"
                        >
                            Commencer le quiz
                        </Link>
                    ) : (
                        // <Link
                        //     href={route('quizsolo', {pieces: checkedPieces, difficulty: difficulty, level: level, courseId: courseId})}
                        //     className="text-white font-bold py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-800 mt-4"
                        // >
                        //     Commencer le quiz
                        // </Link>
                        <button
                            onClick={handleSubmit}
                            className="text-white font-bold py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-800 mt-4"
                        >
                            Commencer le quiz
                        </button>
                    )
                ) : (
                    <button
                        className="text-white font-bold py-2 px-4 rounded-lg bg-gray-400 mt-4"
                        disabled
                    >
                        Commencer le quiz
                    </button>
                )}
            </div>
        </div>
    );
}
