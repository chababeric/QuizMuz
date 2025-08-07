import React, { memo } from 'react';
import PieceItem from "@/Components/PieceItem.jsx";
import ModuleSection from "@/Components/ModuleSection.jsx";

const PiecesList = memo(({
                             courseName,
                             pieces,
                             modules,
                             nonModulePieces,
                             currentPiece,
                             onPieceClick
                         }) => {
    const renderContent = () => {
        if (courseName === "Littérature Musicale") {
            if (modules.length === 0 && nonModulePieces.length === 0) {
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
                <div className="space-y-6">
                    {modules.map((moduleData) => (
                        <ModuleSection
                            key={moduleData.module.id}
                            moduleData={moduleData}
                            currentPiece={currentPiece}
                            onPieceClick={onPieceClick}
                            courseName={courseName}
                        />
                    ))}

                    {nonModulePieces.length > 0 && (
                        <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-2xl border border-rose-400/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-rose-600/30 to-pink-600/30 px-6 py-4 border-b border-rose-400/20">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📚</span>
                                    <h3 className="text-xl font-bold text-white">
                                        Pièces sans module
                                    </h3>
                                    <div className="ml-auto bg-rose-500/20 rounded-lg px-3 py-1">
                                        <span className="text-sm text-rose-200 font-medium">
                                            {nonModulePieces.length} pièce{nonModulePieces.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2">
                                {nonModulePieces.map((piece, index) => (
                                    <PieceItem
                                        key={piece.id}
                                        piece={piece}
                                        index={index}
                                        isActive={currentPiece?.id === piece.id}
                                        onClick={onPieceClick}
                                        courseName={courseName}
                                        showComposer={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // For other courses (FMA, History, etc.)
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
            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-2xl border border-emerald-400/20 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-6 py-4 border-b border-emerald-400/20">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎼</span>
                        <h3 className="text-xl font-bold text-white">
                            {courseName}
                        </h3>
                        <div className="ml-auto bg-emerald-500/20 rounded-lg px-3 py-1">
                            <span className="text-sm text-emerald-200 font-medium">
                                {pieces.length} pièce{pieces.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-2 space-y-1">
                    {pieces.map((piece, index) => (
                        <PieceItem
                            key={piece.id}
                            piece={piece}
                            index={index}
                            isActive={currentPiece?.id === piece.id}
                            onClick={onPieceClick}
                            courseName={courseName}
                            showComposer={courseName !== "Formation Musicale et Auditive"}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
    );
});

PiecesList.displayName = 'PiecesList';

export default PiecesList;
