import React, { useState, useEffect } from "react";
import Checkbox from '@/Components/Checkbox';

export default function ControlMusic({ playMusic, stopMusic, setRandomPosition, setPlayPieceOnce, isPlaying, disabled = false, disableRandomPosition = false }) {
    const [startFromBeginning, setStartFromBeginning] = useState(true);
    const [playOnce, setPlayOnce] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (disableRandomPosition)
            setStartFromBeginning(true);
        else
            setRandomPosition(!startFromBeginning);
    }, [startFromBeginning, setRandomPosition, disableRandomPosition]);

    useEffect(() => {
        setPlayPieceOnce(playOnce);
    }, [playOnce, setPlayPieceOnce]);

    const handleStartFromBeginningCheck = () => {
        setStartFromBeginning(!startFromBeginning);
    };

    const handlePlayOnceCheck = () => {
        setPlayOnce(!playOnce);
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    return (
        <div className="space-y-6">
            {/* Settings Button */}
            <div className="flex justify-center">
                <button
                    onClick={toggleSettings}
                    disabled={disabled}
                    className="group relative overflow-hidden bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm rounded-xl p-3 border border-slate-400/30 hover:border-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-2">
                        <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-sm font-medium">Paramètres</span>
                    </div>
                </button>
            </div>

            {/* Settings Panel */}
            {isSettingsOpen && (
                <div className="bg-gradient-to-r from-slate-800/60 to-purple-800/60 backdrop-blur-sm rounded-xl border border-slate-400/30 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-600/30 to-purple-600/30 px-6 py-4 border-b border-slate-400/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚙️</span>
                                <h3 className="text-lg font-bold text-white">Paramètres Audio</h3>
                            </div>
                            <button
                                onClick={toggleSettings}
                                className="text-slate-300 hover:text-white transition-colors duration-300"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {!disableRandomPosition && (
                            <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🎯</span>
                                    <span className="text-white font-medium group-hover:text-slate-200">
                                        Commencer du début
                                    </span>
                                </div>
                                <Checkbox
                                    checked={startFromBeginning}
                                    onChange={handleStartFromBeginningCheck}
                                    disabled={disabled}
                                />
                            </label>
                        )}
                        <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🔄</span>
                                <span className="text-white font-medium group-hover:text-slate-200">
                                    {disableRandomPosition ? "Jouer chaque accord/formule une seule fois" : "Jouer chaque pièce une seule fois"}
                                </span>
                            </div>
                            <Checkbox
                                checked={playOnce}
                                onChange={handlePlayOnceCheck}
                                disabled={disabled}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Play/Stop Button */}
            <div className="flex justify-center">
                {!isPlaying ? (
                    <button
                        onClick={playMusic}
                        disabled={disabled}
                        className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl px-8 py-4 border border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span className="text-white text-xl font-bold">
                                {disabled ? 'Chargement...' : 'Jouer'}
                            </span>
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={stopMusic}
                        disabled={disabled}
                        className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl px-8 py-4 border border-red-400/50 hover:border-red-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z"/>
                            </svg>
                            <span className="text-white text-xl font-bold">
                                Arrêter
                            </span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
