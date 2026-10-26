import React, { memo } from 'react';
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@/Components/AppIcons';

const transition = 'transition duration-200 motion-reduce:transition-none';
const roundButton = `inline-flex items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed ${transition}`;

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

    if (!currentPiece) {
        return (
            <p className="py-6 text-center text-[16px] text-[#A9AEC2]">
                Sélectionnez une pièce pour commencer
            </p>
        );
    }

    const percent = ((progress / duration) * 100) || 0;

    return (
        <div className="flex flex-col gap-5">
            {/* Current piece */}
            <div>
                {courseName === "Formation Musicale et Auditive" ? (
                    <h2 className="text-[22px] font-bold leading-tight">{currentPiece.chord_name}</h2>
                ) : (
                    <>
                        <h2 className="text-[20px] md:text-[22px] font-bold leading-tight">
                            {currentPiece.title}
                            {currentPiece.no_mvt && `, Mvt. ${currentPiece.no_mvt}`}
                            {currentPiece.mvt && `, ${currentPiece.mvt}`}
                        </h2>
                        {currentPiece.composer && (
                            <p className="mt-1 text-[15px] text-[#C9CCDA]">{currentPiece.composer}</p>
                        )}
                    </>
                )}
                {isLoading && (
                    <p role="status" className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#A9AEC2]">
                        <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-[#A9AEC2] border-t-transparent animate-spin motion-reduce:animate-none"></span>
                        Chargement...
                    </p>
                )}
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2">
                <input
                    type="range"
                    aria-label="Position dans la pièce"
                    value={progress || 0}
                    max={duration || 0}
                    onChange={onProgressChange}
                    disabled={!currentPiece || isLoading}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none"
                    style={{
                        background: `linear-gradient(to right, #E0566C 0%, #E0566C ${percent}%, rgba(255,255,255,0.12) ${percent}%, rgba(255,255,255,0.12) 100%)`
                    }}
                />
                <div className="flex justify-between text-[13px] font-medium tabular-nums text-[#A9AEC2]">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    type="button"
                    aria-label="Pièce précédente"
                    className={`${roundButton} w-12 h-12 text-[#F2F3F8] hover:bg-white/[0.06]`}
                    onClick={onPrevious}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <SkipBackIcon className="w-6 h-6 fill-current"/>
                </button>

                <button
                    type="button"
                    aria-label={isPlaying ? "Pause" : "Lecture"}
                    className={`${roundButton} w-16 h-16 bg-[#B4283F] hover:bg-[#C8304A] text-white`}
                    onClick={onPlayPause}
                    disabled={!currentPiece || isLoading}
                >
                    {isPlaying ? <PauseIcon className="w-7 h-7 fill-current"/> : <PlayIcon className="w-7 h-7 fill-current ml-1"/>}
                </button>

                <button
                    type="button"
                    aria-label="Pièce suivante"
                    className={`${roundButton} w-12 h-12 text-[#F2F3F8] hover:bg-white/[0.06]`}
                    onClick={onNext}
                    disabled={!currentPiece || pieces.length <= 1}
                >
                    <SkipForwardIcon className="w-6 h-6 fill-current"/>
                </button>
            </div>
        </div>
    );
});

AudioControls.displayName = 'AudioControls';

export default AudioControls;
