import Checkbox from '@/Components/Checkbox';
import { Link, Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";

export default function OptionsMenu({ auth, level, courseId, courseName }) {
    const [pieces, setPieces] = useState([]);
    const [modules, setModules] = useState([]);
    const [nonModulePieces, setNonModulePieces] = useState([]);
    const [checkedPieces, setCheckedPieces] = useState([]);
    const [checkText, setCheckText] = useState("Sélectionner tout");
    const [difficulty, setDifficulty] = useState(auth.user.last_difficulty || 1);
    const [canPlay, setCanPlay] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (level) {
            if (courseName === "Formation Musicale et Auditive") {
                axios.get(`/api/chords/level/${level}`)
                    .then(response => {
                        const sortedPieces = sortPiecesByOrder(response.data);
                        setPieces(sortedPieces);
                        setLoading(false);
                    })
                    .catch(error => {
                        console.error("There was an error fetching the chords!", error);
                        setLoading(false);
                    });
            }
            else if (courseName === "Littérature Musicale") {
                // First get all pieces for the level, including those without modules
                axios.get(`/api/pieces/level/${level}`)
                    .then(response => {
                        const piecesData = response.data;

                        // Sort all pieces by order
                        const sortedPieces = sortPiecesByOrder(piecesData);

                        // Group pieces by module_id
                        const groupedByModule = {};
                        const nonModulePieces = [];

                        // Identify pieces without modules
                        sortedPieces.forEach(piece => {
                            if (piece.module_id) {
                                if (!groupedByModule[piece.module_id]) {
                                    groupedByModule[piece.module_id] = {
                                        module: {
                                            id: piece.module_id,
                                            title: '', // Will be updated when we find module data
                                            order: 0,  // Will be updated when we find module data
                                            description: ''
                                        },
                                        pieces: []
                                    };
                                }
                                groupedByModule[piece.module_id].pieces.push(piece);
                            } else {
                                nonModulePieces.push(piece);
                            }
                        });

                        // Fetch modules data to get titles and order
                        axios.get(`/api/modules/level/${level}`)
                            .then(modulesResponse => {
                                const modulesData = modulesResponse.data;

                                // Update module information in grouped pieces
                                modulesData.forEach(module => {
                                    if (groupedByModule[module.id]) {
                                        groupedByModule[module.id].module = {
                                            id: module.id,
                                            title: module.title,
                                            order: module.order,
                                            description: module.description
                                        };
                                    }
                                });

                                // Convert to array and sort by module order
                                const modulesArray = Object.values(groupedByModule)
                                    .sort((a, b) => a.module.order - b.module.order);

                                setModules(modulesArray);
                                setNonModulePieces(nonModulePieces);

                                // Combine all pieces for general use
                                const allPieces = [
                                    ...modulesArray.flatMap(m => m.pieces),
                                    ...nonModulePieces
                                ];

                                setPieces(allPieces);
                                setLoading(false);
                            })
                            .catch(error => {
                                console.error("Error fetching modules:", error);
                                setLoading(false);
                            });
                    })
                    .catch(error => {
                        console.error("There was an error fetching the pieces!", error);
                        setLoading(false);
                    });
            }
            else {
                axios.get(`/api/pieces/level/${level}`)
                    .then(response => {
                        const sortedPieces = sortPiecesByOrder(response.data);
                        setPieces(sortedPieces);
                        setLoading(false);
                    })
                    .catch(error => {
                        console.error("There was an error fetching the pieces!", error);
                        setLoading(false);
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

    const handleCheckModule = (moduleData, isChecked) => {
        const modulePieceIds = moduleData.pieces.map(piece => piece.id);

        if (isChecked) {
            // Add all module pieces that aren't already checked
            setCheckedPieces(prevState => {
                const newCheckedPieces = [...prevState];
                modulePieceIds.forEach(id => {
                    if (!newCheckedPieces.includes(id)) {
                        newCheckedPieces.push(id);
                    }
                });
                return newCheckedPieces;
            });
        } else {
            // Remove all module pieces
            setCheckedPieces(prevState =>
                prevState.filter(id => !modulePieceIds.includes(id))
            );
        }
    };

    // Check if all pieces in a module are selected
    const isModuleFullyChecked = (moduleData) => {
        if (!moduleData.pieces || moduleData.pieces.length === 0) return false;
        return moduleData.pieces.every(piece => checkedPieces.includes(piece.id));
    };

    // Check if some but not all pieces in a module are selected
    const isModulePartiallyChecked = (moduleData) => {
        if (!moduleData.pieces || moduleData.pieces.length === 0) return false;
        const hasChecked = moduleData.pieces.some(piece => checkedPieces.includes(piece.id));
        return hasChecked && !isModuleFullyChecked(moduleData);
    };

    useEffect(() => {
        axios.post('/set-difficulty', {difficulty: difficulty, userId: auth.user.id})
            .then(() => {
            })
            .catch(error => {
                console.error("There was an error setting the difficulty!", error);
            });
    }, [difficulty]);

    const startQuiz = () => {
        let gameKey = localStorage.getItem("game_key");

        if (!gameKey) {
            gameKey = uuidv4();
            localStorage.setItem("game_key", gameKey);
        }

        if (courseName === "Formation Musicale et Auditive") {
            return route("quizfma", {
                chords_list_id: checkedPieces,
                difficulty,
                level_id: level,
                courseId,
                game_key: gameKey
            });
        }
        else {
            return route("quizsolo", {
                pieces_list_id: checkedPieces,
                difficulty,
                level_id: level,
                courseId,
                game_key: gameKey
            });
        }
    };

    const renderModulesPieces = () => {
        return (
            <>
                {modules.map((moduleData) => (
                    <div key={moduleData.module.id} className="mb-4">
                        <div className="bg-rose-900/50 p-2 rounded-t-lg">
                            <label className="flex items-center">
                                <Checkbox
                                    checked={isModuleFullyChecked(moduleData)}
                                    onChange={(e) => handleCheckModule(moduleData, e.target.checked)}
                                />
                                <span className="ml-2 text-xl font-bold text-white">
                                    Module {moduleData.module.order}: {moduleData.module.title}
                                </span>
                            </label>
                        </div>

                        {moduleData.module.description && (
                            <p className="text-gray-900 p-2 bg-white/30 mb-2 italic text-left">
                                {moduleData.module.description}
                            </p>
                        )}

                        <div>
                            {moduleData.pieces && moduleData.pieces.map((piece, pieceIndex) => (
                                <div key={piece.id} className="mb-1 p-2 border-b border-gray-600">
                                    <label className="flex items-center w-full">
                                        <Checkbox
                                            checked={checkedPieces.includes(piece.id)}
                                            onChange={() => handleCheckItem(piece.id)}
                                        />
                                        <span className="ml-2 text-lg text-black text-left">
                                            <span className="inline-block w-8 font-bold mr-2">{pieceIndex + 1}.</span>
                                            {piece.composer} - {piece.title}
                                            {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                                            {piece.mvt && `, ${piece.mvt}`}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Render pieces without modules */}
                {nonModulePieces.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-white bg-rose-900/50 p-2 rounded-t-lg">
                            Pièces sans module
                        </h2>
                        <div>
                            {nonModulePieces.map((piece, index) => (
                                <div key={piece.id} className="mb-1 p-2 border-b border-gray-600">
                                    <label className="flex items-center w-full">
                                        <Checkbox
                                            checked={checkedPieces.includes(piece.id)}
                                            onChange={() => handleCheckItem(piece.id)}
                                        />
                                        <span className="ml-2 text-lg text-black text-left">
                                            <span className="inline-block w-8 font-bold mr-2">{index + 1}.</span>
                                            {piece.composer} - {piece.title}
                                            {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                                            {piece.mvt && `, ${piece.mvt}`}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
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

                {loading ? (
                    <div className="text-black text-2xl py-4">
                        Chargement...
                    </div>
                ) : pieces.length > 0 ? (
                    <>
                        <label className="flex items-center mb-5">
                            <Checkbox onChange={handleCheckAll}/>
                            <span className="ml-2 text-lg text-black">{checkText}</span>
                        </label>

                        {courseName === "Littérature Musicale" ? (
                            modules.length > 0 || nonModulePieces.length > 0 ? (
                                renderModulesPieces()
                            ) : (
                                <p className="text-black text-2xl hover:cursor-default">
                                    Il n'y a pas de pièces trouvées pour ce niveau.
                                </p>
                            )
                        ) : (
                            <ul>
                                {pieces.map((piece, index) => (
                                    <li key={piece.id}>
                                        <label className="flex items-center w-full mb-3">
                                            <Checkbox
                                                checked={checkedPieces.includes(piece.id)}
                                                onChange={() => handleCheckItem(piece.id)}
                                            />
                                            <span className="ml-2 text-lg text-black text-left">
                                                {courseName === "Formation Musicale et Auditive" ? (
                                                    <span>
                                                        <strong className="mr-2">{index + 1}.</strong>
                                                        {piece.chord_name}
                                                    </span>
                                                ) : (
                                                    <>
                                                        {piece.composer} - {piece.title}
                                                        {piece.element && ` - ${piece.element}`}
                                                        {piece.no_mvt && ` - ${piece.no_mvt}`}
                                                        {piece.mvt && ` - ${piece.mvt}`}
                                                    </>
                                                )}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                    <Link
                        href={startQuiz()}
                        className="text-white font-bold py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-800 mt-4"
                    >
                        Commencer le quiz
                    </Link>
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
