import React, { memo } from 'react';
import PieceItem from "@/Components/PieceItem.jsx";

const ModuleSection = memo(({
                                moduleData,
                                currentPiece,
                                onPieceClick,
                                courseName
                            }) => {
    return (
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-white bg-rose-900/50 p-2 rounded-t-lg">
                Module {moduleData.module.order}: {moduleData.module.title}
            </h2>

            {moduleData.module.description && (
                <p className="text-gray-300 p-2 bg-black/70 mb-2 italic">
                    {moduleData.module.description}
                </p>
            )}

            <div>
                {moduleData.pieces?.map((piece, pieceIndex) => (
                    <PieceItem
                        key={piece.id}
                        piece={piece}
                        index={pieceIndex}
                        isActive={currentPiece?.id === piece.id}
                        onClick={onPieceClick}
                        courseName={courseName}
                        showComposer={true}
                    />
                ))}
            </div>
        </div>
    );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
