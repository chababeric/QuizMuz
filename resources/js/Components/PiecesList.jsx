import React, { memo } from 'react';
import PieceItem from "@/Components/PieceItem.jsx";

const PiecesList = memo(({
                             courseName,
                             pieces,
                             modules,
                             nonModulePieces,
                             currentPiece,
                             onPieceClick
                         }) => {
    const isFMA = courseName === "Formation Musicale et Auditive";

    const renderModulesWithItems = () => {
        if (modules.length === 0 && nonModulePieces.length === 0) {
            const itemType = isFMA ? "formule" : "pièce";
            const pluralType = isFMA ? "formules" : "pièces";
            return (
                <div className="text-center py-12">
                    <div className="inline-block bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                        <div className="text-5xl mb-4">🎵</div>
                        <p className="text-lg text-gray-300 font-medium">
                            Aucune {itemType} trouvée pour ce niveau
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Les {pluralType} apparaîtront ici une fois ajoutées
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2 sm:space-y-6">
                {modules.map((moduleData) => {
                    const items = isFMA ? (moduleData.chords || []) : (moduleData.pieces || []);
                    return (
                        <div
                            key={moduleData.module.id}
                            className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg sm:rounded-2xl border border-emerald-400/20 overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-3 py-2 sm:px-6 sm:py-4 border-b border-emerald-400/20">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-lg sm:text-2xl">📦</span>
                                    <h3 className="text-sm sm:text-xl font-bold text-white truncate">
                                        {moduleData.module.title}
                                    </h3>
                                </div>
                            </div>

                            {moduleData.module.description && (
                                <div className="px-3 py-2 sm:px-6 sm:py-3 bg-black/20 border-b border-emerald-400/10">
                                    <p className="text-emerald-200 text-xs sm:text-sm italic leading-relaxed">
                                        {moduleData.module.description}
                                    </p>
                                </div>
                            )}

                            <div className="p-1 sm:p-2 space-y-0 sm:space-y-1">
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <PieceItem
                                            key={item.id}
                                            piece={item}
                                            index={index}
                                            isActive={currentPiece?.id === item.id}
                                            onClick={onPieceClick}
                                            courseName={courseName}
                                            showComposer={!isFMA}
                                        />
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-xs sm:text-sm text-gray-400">
                                        Aucun élément dans ce module.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {nonModulePieces.length > 0 && (
                    <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg sm:rounded-2xl border border-rose-400/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-rose-600/30 to-pink-600/30 px-3 py-2 sm:px-6 sm:py-4 border-b border-rose-400/20">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-lg sm:text-2xl">📚</span>
                                <h3 className="text-sm sm:text-xl font-bold text-white truncate">
                                    {isFMA ? "Formules sans module" : "Pièces sans module"}
                                </h3>
                                <div className="ml-auto bg-rose-500/20 rounded-lg px-2 py-1 sm:px-3">
                                    <span className="text-xs sm:text-sm text-rose-200 font-medium">
                                        {nonModulePieces.length} {isFMA
                                        ? `formule${nonModulePieces.length > 1 ? 's' : ''}`
                                        : `pièce${nonModulePieces.length > 1 ? 's' : ''}`
                                    }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-1 sm:p-2">
                            {nonModulePieces.map((piece, index) => (
                                <PieceItem
                                    key={piece.id}
                                    piece={piece}
                                    index={index}
                                    isActive={currentPiece?.id === piece.id}
                                    onClick={onPieceClick}
                                    courseName={courseName}
                                    showComposer={!isFMA}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFlatList = () => {
        if (pieces.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-block bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                        <div className="text-5xl mb-4">🎵</div>
                        <p className="text-lg text-gray-300 font-medium">
                            Aucune pièce trouvée pour ce niveau
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Les pièces apparaîtront ici une fois ajoutées
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg sm:rounded-2xl border border-emerald-400/20 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-3 py-2 sm:px-6 sm:py-4 border-b border-emerald-400/20">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-lg sm:text-2xl">🎼</span>
                        <h3 className="text-sm sm:text-xl font-bold text-white truncate">
                            {courseName}
                        </h3>
                        <div className="ml-auto bg-emerald-500/20 rounded-lg px-2 py-1 sm:px-3">
                            <span className="text-xs sm:text-sm text-emerald-200 font-medium">
                                {pieces.length} pièce{pieces.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-1 sm:p-2 space-y-0 sm:space-y-1">
                    {pieces.map((piece, index) => (
                        <PieceItem
                            key={piece.id}
                            piece={piece}
                            index={index}
                            isActive={currentPiece?.id === piece.id}
                            onClick={onPieceClick}
                            courseName={courseName}
                            showComposer={!isFMA}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        // Use module grouping for both FMA and LitMus
        if (courseName === "Littérature Musicale" || isFMA) {
            return renderModulesWithItems();
        }
        // Other courses: flat list
        return renderFlatList();
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
    );
});

PiecesList.displayName = 'PiecesList';

export default PiecesList;
