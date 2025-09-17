
import { Head, Link } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import playIcon from "../../icons/play.svg";

export default function OptionsMenu({
                                        auth,
                                        level,
                                        courseId,
                                        courseName,
                                        pieces = [],
                                        modules = [],
                                        nonModulePieces = []
                                    }) {
    const [checkedPieces, setCheckedPieces] = useState([]);
    const [difficulty, setDifficulty] = useState(auth.user.last_difficulty || 1);
    // Memoized values
    const canPlay = useMemo(() => checkedPieces.length >= 2, [checkedPieces.length]);

    const checkText = useMemo(() => {
        const allPieceIds = pieces.map(piece => piece.id);
        const allSelected = allPieceIds.length > 0 && allPieceIds.every(id => checkedPieces.includes(id));
        return allSelected ? "Enlever la sélection" : "Sélectionner tout";
    }, [pieces, checkedPieces]);

    const isLiteratureMusicale = courseName === "Littérature Musicale";
    const isFormationMusicale = courseName === "Formation Musicale et Auditive";

    // Check if there are no pieces at all
    const noPiecesAvailable = useMemo(() => {
        if (isLiteratureMusicale) {
            // For Literature Musicale, check if there are no modules with pieces and no non-module pieces
            const hasModulePieces = modules.some(module => module.pieces && module.pieces.length > 0);
            const hasNonModulePieces = nonModulePieces && nonModulePieces.length > 0;
            return !hasModulePieces && !hasNonModulePieces;
        } else {
            // For other courses, just check pieces array
            return pieces.length === 0;
        }
    }, [pieces, modules, nonModulePieces, isLiteratureMusicale]);

    // API calls (only for difficulty updates)
    const updateDifficulty = useCallback(async (newDifficulty) => {
        try {
            await axios.post('/set-difficulty', {
                difficulty: newDifficulty,
                userId: auth.user.id
            });
        } catch (error) {
            console.error("Error setting difficulty:", error);
        }
    }, [auth.user.id]);

    // Event handlers
    const handleCheckAll = useCallback((event) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            const allPieceIds = pieces.map(piece => piece.id);
            setCheckedPieces(allPieceIds);
        } else {
            setCheckedPieces([]);
        }
    }, [pieces]);

    const handleCheckItem = useCallback((pieceId) => {
        setCheckedPieces(prevState =>
            prevState.includes(pieceId)
                ? prevState.filter(id => id !== pieceId)
                : [...prevState, pieceId]
        );
    }, []);

    const handleCheckModule = useCallback((moduleData, isChecked) => {
        const modulePieceIds = moduleData.pieces.map(piece => piece.id);

        if (isChecked) {
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
            setCheckedPieces(prevState =>
                prevState.filter(id => !modulePieceIds.includes(id))
            );
        }
    }, []);

    const handleDifficultyChange = useCallback((event) => {
        const newDifficulty = parseInt(event.target.value, 10);
        setDifficulty(newDifficulty);
        updateDifficulty(newDifficulty).then(r => {});
    }, [updateDifficulty]);

    // Module helpers
    const isModuleFullyChecked = useCallback((moduleData) => {
        if (!moduleData.pieces || moduleData.pieces.length === 0) return false;
        return moduleData.pieces.every(piece => checkedPieces.includes(piece.id));
    }, [checkedPieces]);

    // Quiz start handler
    const startQuiz = useCallback(() => {
        let gameKey = localStorage.getItem("game_key");

        if (!gameKey) {
            gameKey = uuidv4();
            localStorage.setItem("game_key", gameKey);
        }

        const baseParams = {
            difficulty,
            level_id: level,
            courseId,
            game_key: gameKey,
            course_name: courseName
        };

        if (isFormationMusicale) {
            return route("quizfma", {
                ...baseParams,
                chords_list_id: checkedPieces
            });
        } else {
            return route("quizsolo", {
                ...baseParams,
                pieces_list_id: checkedPieces
            });
        }
    }, [checkedPieces, difficulty, level, courseId, courseName, isFormationMusicale]);

    // Effect to handle difficulty adjustment for Formation Musicale
    useEffect(() => {
        if (isFormationMusicale && difficulty === 2) {
            setDifficulty(1);
            updateDifficulty(1).then(r => {});
        }
    }, [isFormationMusicale, difficulty, updateDifficulty]);

    // Render helpers
    const renderNoPiecesMessage = () => (
        <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-8 py-8 border border-white/10 shadow-2xl">
                <div className="text-6xl mb-6">🎵</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                    Aucune pièce trouvée pour ce niveau
                </h2>
                <p className="text-gray-300 text-lg">
                    Il n'y a actuellement aucune pièce disponible pour ce niveau.
                </p>
                <div className="h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mt-6"></div>
            </div>
        </div>
    );

    const renderModulesPieces = () => (
        <div className="space-y-6">
            {modules.map((moduleData) => (
                <div key={moduleData.module.id} className="bg-gradient-to-r from-rose-900/20 to-pink-900/20 backdrop-blur-sm rounded-2xl border border-rose-400/20 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-rose-600/30 to-pink-600/30 px-6 py-4 border-b border-rose-400/20">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                                <Checkbox
                                    checked={isModuleFullyChecked(moduleData)}
                                    onChange={(e) => handleCheckModule(moduleData, e.target.checked)}
                                />
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📚</span>
                                    <span className="text-xl font-bold text-white group-hover:text-rose-200 transition-colors duration-300">
                                        Module {moduleData.module.order}: {moduleData.module.title}
                                    </span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {moduleData.module.description && (
                        <div className="px-6 py-3 bg-black/20 border-b border-rose-400/10">
                            <p className="text-rose-200 text-sm italic leading-relaxed">
                                {moduleData.module.description}
                            </p>
                        </div>
                    )}

                    <div className="p-2">
                        {moduleData.pieces.map((piece, index) => (
                            <label key={piece.id} className="flex items-center p-3 hover:bg-rose-500/10 cursor-pointer rounded-xl transition-all duration-300 group">
                                <div className="relative">
                                    <Checkbox
                                        checked={checkedPieces.includes(piece.id)}
                                        onChange={() => handleCheckItem(piece.id)}
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <span className="text-white group-hover:text-rose-200 transition-colors duration-300 font-medium">
                                        {index + 1}. {piece.title || piece.chord_name}
                                        {(piece.no_mvt || piece.mvt) && (
                                            <span className="text-rose-200 font-normal">
                                                {piece.no_mvt && ` - Mvt ${piece.no_mvt}`}
                                                {piece.mvt && `: ${piece.mvt}`}
                                            </span>
                                        )}
                                        {piece.composer && (
                                            <span className="text-rose-300 font-normal"> - {piece.composer}</span>
                                        )}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {nonModulePieces && nonModulePieces.length > 0 && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-2xl border border-amber-400/20 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 px-6 py-4 border-b border-amber-400/20">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎼</span>
                            <h3 className="text-xl font-bold text-white">Pièces sans module</h3>
                            <div className="ml-auto bg-amber-500/20 rounded-lg px-3 py-1">
                                <span className="text-sm text-amber-200 font-medium">
                                    {nonModulePieces.length} pièce{nonModulePieces.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        {nonModulePieces.map((piece, index) => (
                            <label key={piece.id} className="flex items-center p-3 hover:bg-amber-500/10 cursor-pointer rounded-xl transition-all duration-300 group">
                                <div className="relative">
                                    <Checkbox
                                        checked={checkedPieces.includes(piece.id)}
                                        onChange={() => handleCheckItem(piece.id)}
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <span className="text-white group-hover:text-amber-200 transition-colors duration-300 font-medium">
                                        {index + 1}. {piece.title || piece.chord_name}
                                        {(piece.no_mvt || piece.mvt) && (
                                            <span className="text-amber-200 font-normal">
                                                {piece.no_mvt && ` - Mvt ${piece.no_mvt}`}
                                                {piece.mvt && `: ${piece.mvt}`}
                                            </span>
                                        )}
                                        {piece.composer && (
                                            <span className="text-amber-300 font-normal"> - {piece.composer}</span>
                                        )}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderRegularPieces = () => (
        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-2xl border border-emerald-400/20 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-6 py-4 border-b border-emerald-400/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎼</span>
                    <h3 className="text-xl font-bold text-white">{courseName}</h3>
                    <div className="ml-auto bg-emerald-500/20 rounded-lg px-3 py-1">
                        <span className="text-sm text-emerald-200 font-medium">
                            {pieces.length} pièce{pieces.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-2">
                {pieces.map((piece, index) => (
                    <label key={piece.id} className="flex items-center p-3 hover:bg-emerald-500/10 cursor-pointer rounded-xl transition-all duration-300 group">
                        <div className="relative">
                            <Checkbox
                                checked={checkedPieces.includes(piece.id)}
                                onChange={() => handleCheckItem(piece.id)}
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <span className="text-white group-hover:text-emerald-200 transition-colors duration-300 font-medium">
                                {index + 1}. {piece.title || piece.chord_name}
                                {(piece.no_mvt || piece.mvt) && (
                                    <span className="text-emerald-200 font-normal">
                                        {piece.no_mvt && ` - Mvt ${piece.no_mvt}`}
                                        {piece.mvt && `: ${piece.mvt}`}
                                    </span>
                                )}
                                {piece.composer && (
                                    <span className="text-emerald-300 font-normal"> - {piece.composer}</span>
                                )}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderDifficultyOptions = () => (
        <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-2xl border border-purple-400/20 overflow-hidden shadow-2xl mb-6">
            <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 px-6 py-4 border-b border-purple-400/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <h3 className="text-xl font-bold text-white">Niveau de difficulté</h3>
                </div>
            </div>
            <div className="p-6">
                <select
                    value={difficulty}
                    onChange={handleDifficultyChange}
                    className="w-full p-4 bg-black/30 backdrop-blur-sm text-white border border-purple-400/30 rounded-xl
                             focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none
                             transition-all duration-300 font-medium text-lg"
                >
                    <option value={1} className="bg-black/90 text-white">🟢 Facile</option>
                    {!isFormationMusicale && <option value={2} className="bg-black/90 text-white">🟡 Moyen</option>}
                    <option value={3} className="bg-black/90 text-white">🔴 Difficile</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="main-app min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="background-container"></div>
            <Head title="Options - QuizMuz"/>

            {/* Header Section */}
            <div className="relative w-full mt-2 mb-4 px-4">
                {/* Back Button - Above title on mobile, beside on desktop */}
                <div className="flex justify-start mb-4 sm:mb-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2 sm:z-10">
                    <Link
                        href={route('mainmenu', { courseId })}
                        className="group"
                    >
                        <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 hover:border-violet-300 transition-all duration-300 shadow-lg hover:shadow-violet-500/30">
                            <div className="flex items-center gap-2 text-white group-hover:text-violet-200">
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-sm font-medium">Retour</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Title - Centered */}
                <div className="flex justify-center">
                    <div className="text-center">
                        <div className="inline-block bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-violet-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">⚙️</span>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                                    Options
                                </h1>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col px-6 w-full">
                {/* Difficulty Options */}
                {renderDifficultyOptions()}

                {/* Show message if no pieces available */}
                {noPiecesAvailable ? (
                    <div className="flex-1 flex items-center justify-center">
                        {renderNoPiecesMessage()}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col space-y-6 mb-6">
                        {/* Select All Checkbox */}
                        {pieces.length > 0 && (
                            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl border border-cyan-400/20 overflow-hidden shadow-2xl">
                                <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 px-6 py-4">
                                    <label className="flex items-center cursor-pointer group">
                                        <div className="relative">
                                            <Checkbox
                                                checked={pieces.length > 0 && pieces.every(piece => checkedPieces.includes(piece.id))}
                                                onChange={handleCheckAll}
                                            />
                                        </div>
                                        <div className="ml-4 flex items-center gap-3">
                                            <span className="text-2xl">✅</span>
                                            <span className="text-white text-lg font-semibold group-hover:text-cyan-200 transition-colors duration-300">
                                                {checkText}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Pieces List */}
                        <div className="flex-1">
                            {isLiteratureMusicale ? renderModulesPieces() : renderRegularPieces()}
                        </div>

                        {/* Start Quiz Button */}
                        <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-6 pb-2">
                            {canPlay ? (
                                <Link
                                    href={startQuiz()}
                                    className="group relative overflow-hidden bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl border border-rose-400/50 hover:border-rose-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl block"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10 flex items-center justify-center gap-3 py-4 px-6">
                                        <img src={playIcon} alt="Play" className="h-6 w-6 filter brightness-0 invert"/>
                                        <span className="text-white text-xl font-bold">
                                            Commencer le quiz
                                        </span>
                                        <div className="ml-auto bg-rose-500/20 rounded-lg px-3 py-1">
                                            <span className="text-sm text-rose-200 font-medium">
                                                {checkedPieces.length} sélectionné{checkedPieces.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl border border-gray-500/50 cursor-not-allowed opacity-75">
                                    <div className="flex items-center justify-center gap-3 py-4 px-6">
                                        <span className="text-2xl">🚫</span>
                                        <span className="text-gray-300 text-xl font-bold">
                                            Sélectionnez au moins 2 éléments
                                        </span>
                                        <div className="ml-auto bg-gray-500/20 rounded-lg px-3 py-1">
                                            <span className="text-sm text-gray-300 font-medium">
                                                {checkedPieces.length}/2 min.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
