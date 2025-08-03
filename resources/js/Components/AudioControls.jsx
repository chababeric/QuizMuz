import React, { memo } from 'react';
import playIcon from "../../icons/play.svg";
import pauseIcon from "../../icons/pause.svg";
import nextIcon from "../../icons/next.svg";
import previousIcon from "../../icons/previous.svg";

const AudioControls = memo(({
                                currentPiece,
                                courseName,
                                pieces,
                                isPlaying,
                                progress,
                                duration,
                                isLoading,
                                onPlayPause,
                                onNext,
                                onPrevious,
                                onProgressChange
                            }) => {
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === 0) return "00:00";
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    const getCurrentPieceIndex = () => {
        return currentPiece ? pieces.findIndex(p => p.id === currentPiece.id) : -1;
    };

    return (
        <div className="bg-white/10 p-2 flex flex-col items-center w-full border border-white rounded-md mb-5">
            {currentPiece && (
                <div className="text-white mb-1 text-center">
                    <h2 className="text-xl font-semibold">
                        {courseName === "Formation Musicale et Auditive" ? (
                            <>
                                <span className="font-bold mr-2">
                                    {getCurrentPieceIndex() + 1}.
                                </span>
                                {currentPiece.chord_name}
                            </>
                        ) : (
                            <>
                                {currentPiece.title}
                                {currentPiece.no_mvt && `, Mvt. ${currentPiece.no_mvt}`}
                                {currentPiece.mvt && `, ${currentPiece.mvt}`}
                            </>
                        )}
                    </h2>
                    {courseName !== "Formation Musicale et Auditive" && currentPiece.composer && (
                        <p className="text-lg">{currentPiece.composer}</p>
                    )}
                    {isLoading && (
                        <p className="text-sm text-gray-300">Chargement...</p>
                    )}
                </div>
            )}

            <input
                type="range"
                value={progress || 0}
                max={duration || 0}
                onChange={onProgressChange}
                disabled={!currentPiece || isLoading}
                className="w-full accent-rose-600 disabled:opacity-50"
            />

            <div className="flex justify-between w-full text-white text-sm mt-2">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            <div className="flex justify-around items-center w-full mt-2">
                <button
                    className="text-white disabled:opacity-50"
                    onClick={onPrevious}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <img src={previousIcon} alt="Previous" className="h-10 w-10"/>
                </button>
                <button
                    className="text-white disabled:opacity-50"
                    onClick={onPlayPause}
                    disabled={!currentPiece || isLoading}
                >
                    <img
                        src={isPlaying ? pauseIcon : playIcon}
                        alt={isPlaying ? "Pause" : "Play"}
                        className="h-10 w-10"
                    />
                </button>
                <button
                    className="text-white disabled:opacity-50"
                    onClick={onNext}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <img src={nextIcon} alt="Next" className="h-10 w-10"/>
                </button>
            </div>
        </div>
    );
});

AudioControls.displayName = 'AudioControls';

export default AudioControls;
