import React, { memo } from 'react';

const PieceItem = memo(({
                            piece,
                            index,
                            isActive,
                            onClick,
                            courseName,
                            showComposer = true,
                            showIndex = true
                        }) => {
    const handleClick = () => onClick(piece);

    return (
        <div
            className={`mb-0 sm:mb-1 rounded-none sm:rounded-lg p-2 border-b border-gray-600 hover:cursor-pointer transition-colors duration-200 ${
                isActive ? 'bg-rose-600/70' : 'hover:bg-white/10'
            }`}
            onClick={handleClick}
        >
            <h2 className="text-base sm:text-xl font-semibold text-white">
                {courseName === "Formation Musicale et Auditive" ? (
                    <>
                        {showIndex && (
                            <span className="inline-block w-6 sm:w-8 font-bold mr-1 sm:mr-2 text-sm sm:text-base">{index + 1}.</span>
                        )}
                        {piece.chord_name}
                    </>
                ) : (
                    <>
                        {showIndex && (
                            <span className="inline-block w-6 sm:w-8 font-bold mr-1 sm:mr-2 text-sm sm:text-base">{index + 1}.</span>
                        )}
                        {piece.title}
                        {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                        {piece.mvt && `, ${piece.mvt}`}
                    </>
                )}
            </h2>
            {showComposer && piece.composer && courseName !== "Formation Musicale et Auditive" && (
                <p className="text-sm sm:text-lg text-gray-300 ml-7 sm:ml-10">{piece.composer}</p>
            )}
        </div>
    );
});

PieceItem.displayName = 'PieceItem';

export default PieceItem;
