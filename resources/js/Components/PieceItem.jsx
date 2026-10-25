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
        <button
            type="button"
            aria-current={isActive ? 'true' : undefined}
            onClick={handleClick}
            className={`w-full flex items-start gap-3 min-h-[44px] px-3 py-2.5 rounded-[14px] text-left transition-colors duration-200 motion-reduce:transition-none ${
                isActive ? 'bg-[rgba(224,86,108,0.16)] ring-1 ring-inset ring-[rgba(224,86,108,0.45)]' : 'hover:bg-white/[0.04]'
            }`}
        >
            {showIndex && (
                <span className={`w-7 shrink-0 text-[15px] font-semibold ${isActive ? 'text-[#F07A8D]' : 'text-[#7D8297]'}`}>{index + 1}.</span>
            )}
            <span className="flex-1 min-w-0">
                <span className="block text-[15px] md:text-[16px] font-semibold text-[#F2F3F8]">
                    {courseName === "Formation Musicale et Auditive" ? (
                        piece.chord_name
                    ) : (
                        <>
                            {piece.title}
                            {piece.no_mvt && `, Mvt. ${piece.no_mvt}`}
                            {piece.mvt && `, ${piece.mvt}`}
                        </>
                    )}
                </span>
                {showComposer && piece.composer && courseName !== "Formation Musicale et Auditive" && (
                    <span className="block text-[14px] text-[#A9AEC2]">{piece.composer}</span>
                )}
            </span>
        </button>
    );
});

PieceItem.displayName = 'PieceItem';

export default PieceItem;
