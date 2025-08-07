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

    if (!currentPiece) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 text-gray-400">
                    <span className="text-3xl">🎵</span>
                    <span className="text-lg font-medium">Sélectionnez une pièce pour commencer</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Piece Info */}
            <div className="text-center">
                <div className="bg-gradient-to-r from-purple-800/30 to-rose-800/30 rounded-xl p-4 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-2">
                        {courseName === "Formation Musicale et Auditive" ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="bg-gradient-to-r from-purple-400 to-rose-400 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                    {getCurrentPieceIndex() + 1}
                                </span>
                                <span>{currentPiece.chord_name}</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="text-xl font-bold">
                                    {currentPiece.title}
                                    {currentPiece.no_mvt && `, Mvt. ${currentPiece.no_mvt}`}
                                    {currentPiece.mvt && `, ${currentPiece.mvt}`}
                                </div>
                                {currentPiece.composer && (
                                    <div className="text-purple-200 font-medium">
                                        {currentPiece.composer}
                                    </div>
                                )}
                            </div>
                        )}
                    </h2>
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 text-purple-200">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-transparent"></div>
                            <span className="text-sm">Chargement...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="relative">
                    <input
                        type="range"
                        value={progress || 0}
                        max={duration || 0}
                        onChange={onProgressChange}
                        disabled={!currentPiece || isLoading}
                        className="w-full h-3 bg-gray-700/50 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-400 [&::-webkit-slider-thumb]:to-rose-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-purple-400 [&::-moz-range-thumb]:to-rose-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-none"
                        style={{
                            background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(236 72 153) ${((progress / duration) * 100) || 0}%, rgb(55 65 81 / 0.5) ${((progress / duration) * 100) || 0}%, rgb(55 65 81 / 0.5) 100%)`
                        }}
                    />
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-purple-200 bg-black/30 px-2 py-1 rounded">
                        {formatTime(progress)}
                    </span>
                    <span className="text-purple-200 bg-black/30 px-2 py-1 rounded">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center gap-4">
                {/* Previous Button */}
                <button
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-500/50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-gray-500/50"
                    onClick={onPrevious}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                    <img
                        src={previousIcon}
                        alt="Previous"
                        className="h-6 w-6 filter brightness-0 invert relative z-10"
                    />
                </button>

                {/* Play/Pause Button */}
                <button
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-rose-600 rounded-2xl p-5 border-2 border-purple-400/50 hover:border-purple-300 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    onClick={onPlayPause}
                    disabled={!currentPiece || isLoading}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-rose-400/30 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                    <img
                        src={isPlaying ? pauseIcon : playIcon}
                        alt={isPlaying ? "Pause" : "Play"}
                        className="h-8 w-8 filter brightness-0 invert relative z-10"
                    />
                </button>

                {/* Next Button */}
                <button
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-500/50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-gray-500/50"
                    onClick={onNext}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                    <img
                        src={nextIcon}
                        alt="Next"
                        className="h-6 w-6 filter brightness-0 invert relative z-10"
                    />
                </button>
            </div>

            {/* Track Info */}
            {pieces.length > 1 && (
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1 text-sm text-purple-200">
                        <span className="text-lg">📀</span>
                        <span>
                            Piste {getCurrentPieceIndex() + 1} sur {pieces.length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

AudioControls.displayName = 'AudioControls';

export default AudioControls;
