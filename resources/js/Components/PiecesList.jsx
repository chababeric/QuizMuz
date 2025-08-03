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
                    <p className="text-lg text-gray-400 p-4">
                        Aucune pièce trouvée pour ce niveau.
                    </p>
                );
            }

            return (
                <>
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
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white bg-rose-900/50 p-2 rounded-t-lg">
                                Pièces sans module
                            </h2>
                            <div>
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
                </>
            );
        }

        // For other courses (FMA, History, etc.)
        if (pieces.length === 0) {
            return (
                <p className="text-lg text-gray-400 p-4">
                    Aucune pièce trouvée pour ce niveau.
                </p>
            );
        }

        return pieces.map((piece, index) => (
            <PieceItem
                key={piece.id}
                piece={piece}
                index={index}
                isActive={currentPiece?.id === piece.id}
                onClick={onPieceClick}
                courseName={courseName}
                showComposer={courseName !== "Formation Musicale et Auditive"}
            />
        ));
    };

    return (
        <div className="flex-1 overflow-y-auto w-11/12 mx-auto hide-scrollbar bg-black/50">
            {renderContent()}
        </div>
    );
});

PiecesList.displayName = 'PiecesList';

export default PiecesList;
