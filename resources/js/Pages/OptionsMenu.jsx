import { Head, Link } from '@inertiajs/react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AppHeader from '@/Components/AppHeader';
import { PlayIcon } from '@/Components/AppIcons';
import { courseStyle } from '@/Components/courseStyles';

const transition = 'transition duration-200 motion-reduce:transition-none';
const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';
const sectionLabel = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]';

const OptionCheckbox = (props) => (
    <input
        type="checkbox"
        className="mt-0.5 w-5 h-5 shrink-0 rounded-md border-white/30 bg-transparent text-[#B4283F] cursor-pointer focus:ring-2 focus:ring-[#E0566C] focus:ring-offset-0"
        {...props}
    />
);

const CountPill = ({ count }) => (
    <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
        {count} pièce{count > 1 ? 's' : ''}
    </span>
);

const PieceRow = ({ piece, index, checked, onToggle }) => (
    <label className={`flex items-start gap-3 min-h-[44px] px-3 py-2.5 rounded-[14px] cursor-pointer hover:bg-white/[0.04] ${transition}`}>
        <OptionCheckbox checked={checked} onChange={onToggle}/>
        <span className="text-[15px] font-medium text-[#F2F3F8]">
            {index + 1}. {piece.title || piece.chord_name}
            {(piece.no_mvt || piece.mvt) && (
                <span className="font-normal text-[#C9CCDA]">
                    {piece.no_mvt && ` - Mvt ${piece.no_mvt}`}
                    {piece.mvt && `: ${piece.mvt}`}
                </span>
            )}
            {piece.composer && (
                <span className="font-normal text-[#A9AEC2]"> - {piece.composer}</span>
            )}
        </span>
    </label>
);

export default function OptionsMenu({
                                        auth,
                                        level,
                                        levelName,
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

        if (isLiteratureMusicale || isFormationMusicale) {
            // select all from modules + nonModulePieces
            const moduleIds = modules.flatMap(m => (m.pieces || []).map(p => p.id));
            const nonIds = (nonModulePieces || []).map(p => p.id);
            const allIds = [...moduleIds, ...nonIds];
            setCheckedPieces(isChecked ? allIds : []);
            return;
        }

        // fallback (non-module courses)
        if (isChecked) {
            const allPieceIds = pieces.map(piece => piece.id);
            setCheckedPieces(allPieceIds);
        } else {
            setCheckedPieces([]);
        }
    }, [pieces, modules, nonModulePieces, isLiteratureMusicale, isFormationMusicale]);

    const handleCheckItem = useCallback((pieceId) => {
        setCheckedPieces(prevState =>
            prevState.includes(pieceId)
                ? prevState.filter(id => id !== pieceId)
                : [...prevState, pieceId]
        );
    }, []);

    const handleCheckModule = useCallback((moduleData, isChecked) => {
        const ids = (moduleData.pieces || []).map(p => p.id);
        if (isChecked) {
            setCheckedPieces(prev => Array.from(new Set([...prev, ...ids])));
        } else {
            setCheckedPieces(prev => prev.filter(id => !ids.includes(id)));
        }
    }, []);

    const handleDifficultyChange = useCallback((newDifficulty) => {
        setDifficulty(newDifficulty);
        updateDifficulty(newDifficulty).then(r => {});
    }, [updateDifficulty]);

    // Module helpers
    const isModuleFullyChecked = useCallback((moduleData) => {
        const arr = moduleData.pieces || [];
        if (arr.length === 0) return false;
        return arr.every(piece => checkedPieces.includes(piece.id));
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

    const difficulties = [
        { value: 1, label: 'Facile' },
        ...(!isFormationMusicale ? [{ value: 2, label: 'Moyen' }] : []),
        { value: 3, label: 'Difficile' },
    ];
    const courseLook = courseStyle(courseName, courseId);

    // Render helpers
    const renderNoPiecesMessage = () => (
        <div className={`${card} p-6 md:p-8`}>
            <h2 className="text-[22px] font-semibold">Aucune pièce trouvée pour ce niveau</h2>
            <p className="mt-1 text-[15px] text-[#C9CCDA]">
                Il n'y a actuellement aucune pièce disponible pour ce niveau.
            </p>
        </div>
    );

    const renderGroup = ({ key, title, description, groupPieces, groupCheckbox }) => (
        <section key={key} aria-labelledby={`group-${key}`} className={`${card} p-2 md:p-3`}>
            <div className="flex items-start gap-3 px-3 pt-3 pb-2">
                {groupCheckbox ? (
                    <label className="flex-1 min-w-0 flex items-start gap-3 cursor-pointer">
                        {groupCheckbox}
                        <span id={`group-${key}`} className="text-[17px] font-semibold leading-snug">{title}</span>
                    </label>
                ) : (
                    <h3 id={`group-${key}`} className="flex-1 min-w-0 text-[17px] font-semibold leading-snug">{title}</h3>
                )}
                <CountPill count={groupPieces.length}/>
            </div>
            {description && (
                <p className="px-3 pb-2 text-[14px] leading-relaxed text-[#A9AEC2]">{description}</p>
            )}
            <div className="mt-1 border-t border-white/[0.06] pt-1">
                {groupPieces.map((piece, index) => (
                    <PieceRow
                        key={piece.id}
                        piece={piece}
                        index={index}
                        checked={checkedPieces.includes(piece.id)}
                        onToggle={() => handleCheckItem(piece.id)}
                    />
                ))}
            </div>
        </section>
    );

    const renderModulesPieces = () => (
        <>
            {modules.map((moduleData) => renderGroup({
                key: moduleData.module.id,
                title: `Module ${moduleData.module.order}: ${moduleData.module.title}`,
                description: moduleData.module.description,
                groupPieces: moduleData.pieces,
                groupCheckbox: (
                    <OptionCheckbox
                        checked={isModuleFullyChecked(moduleData)}
                        onChange={(e) => handleCheckModule(moduleData, e.target.checked)}
                    />
                ),
            }))}

            {nonModulePieces && nonModulePieces.length > 0 && renderGroup({
                key: 'non-module',
                title: 'Pièces sans module',
                groupPieces: nonModulePieces,
            })}
        </>
    );

    const renderRegularPieces = () => renderGroup({
        key: 'all',
        title: courseName,
        groupPieces: pieces,
    });

    const renderDifficultyOptions = () => (
        <section aria-labelledby="difficulty-heading" className={`${card} p-4 md:p-5`}>
            <h2 id="difficulty-heading" className={`${sectionLabel} mb-3`}>Niveau de difficulté</h2>
            <div role="radiogroup" aria-labelledby="difficulty-heading" className="flex gap-1 rounded-[16px] border border-white/[0.08] bg-white/[0.03] p-1">
                {difficulties.map(option => {
                    const isSelected = difficulty === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleDifficultyChange(option.value)}
                            className={`flex-1 min-h-[44px] rounded-[12px] text-[15px] font-semibold ${transition} ${
                                isSelected ? 'bg-white text-[#06070D]' : 'text-[#F2F3F8] hover:bg-white/[0.05]'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );

    const renderStartAction = () => canPlay ? (
        <Link
            href={startQuiz()}
            className={`w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white ${transition}`}
        >
            <PlayIcon className="w-5 h-5"/>
            Commencer le quiz
            <span className="ml-1 shrink-0 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 text-[13px] font-medium">
                {checkedPieces.length} sélectionné{checkedPieces.length > 1 ? 's' : ''}
            </span>
        </Link>
    ) : (
        <div aria-disabled="true" className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-full border border-white/[0.1] bg-white/[0.04] px-4 text-[14px] font-semibold text-[#A9AEC2] cursor-not-allowed">
            Sélectionnez au moins 2 éléments
            <span className="ml-1 shrink-0 whitespace-nowrap rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[13px] font-medium">
                {checkedPieces.length}/2 min.
            </span>
        </div>
    );

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Options - QuizMuz"/>
            <AppHeader title="Options" backHref={route('mainmenu', { courseId })} backLabel="Retour au menu"/>

            <main className={`w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 md:pt-6 ${noPiecesAvailable ? 'pb-8' : 'pb-32 lg:pb-12'} flex flex-col lg:flex-row lg:items-start gap-4 md:gap-5`}>

                {/* Left column: context, difficulty and start */}
                <div className="lg:w-[340px] lg:shrink-0 lg:sticky lg:top-6 flex flex-col gap-4 md:gap-5">
                    <section aria-labelledby="options-course" className={`${card} p-3 md:p-4 flex items-center gap-3`}>
                        <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${courseLook.glow}`}></div>
                        <span className={`relative w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-[14px] flex items-center justify-center ${courseLook.tile}`}>
                            <courseLook.Icon/>
                        </span>
                        <div className="relative min-w-0">
                            <h2 id="options-course" className="text-[17px] font-semibold leading-snug">{courseName}</h2>
                            {levelName && <p className="text-[14px] text-[#C9CCDA]">Niveau {levelName}</p>}
                        </div>
                    </section>

                    {renderDifficultyOptions()}

                    {!noPiecesAvailable && (
                        <div className="hidden lg:block">{renderStartAction()}</div>
                    )}
                </div>

                {/* Right column: pieces */}
                <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-5">
                    {noPiecesAvailable ? renderNoPiecesMessage() : (
                        <>
                            {pieces.length > 0 && (
                                <label className={`${card} flex items-center gap-3 min-h-[56px] px-5 py-3 cursor-pointer hover:border-white/[0.18] ${transition}`}>
                                    <OptionCheckbox
                                        checked={pieces.length > 0 && pieces.every(piece => checkedPieces.includes(piece.id))}
                                        onChange={handleCheckAll}
                                    />
                                    <span className="text-[16px] font-semibold">{checkText}</span>
                                </label>
                            )}

                            {(isLiteratureMusicale || isFormationMusicale) ? renderModulesPieces() : renderRegularPieces()}
                        </>
                    )}
                </div>
            </main>

            {/* Phones and tablets: start button pinned to the bottom */}
            {!noPiecesAvailable && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.07] bg-[#06070D]/95 backdrop-blur-md px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                    {renderStartAction()}
                </div>
            )}
        </div>
    );
}
