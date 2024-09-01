import React, { useState, useEffect } from "react";
import Checkbox from '@/Components/Checkbox';
import settingsIcon from '../../icons/settings.svg';

export default function ControlMusic({ playMusic, stopMusic, setRandomPosition, setPlayPieceOnce, isPlaying }) {
    const [startFromBeginning, setStartFromBeginning] = useState(true);
    const [playOnce, setPlayOnce] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setRandomPosition(!startFromBeginning);
    }, [startFromBeginning]);

    useEffect(() => {
        setPlayPieceOnce(playOnce);
    }, [playOnce]);

    const handleStartFromBeginningCheck = () => {
        setStartFromBeginning(!startFromBeginning);
    };

    const handlePlayOnceCheck = () => {
        setPlayOnce(!playOnce);
    };

    const toggleSettings = () => {
        if (isSettingsOpen) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsSettingsOpen(false);
                setIsAnimating(false);
            }, 300); // Duration of the slide-up animation
        } else {
            setIsSettingsOpen(true);
        }
    };

    const saveSettings = () => {
        toggleSettings();
    };

    return (
        <>
            <div className="flex flex-col items-end w-full mr-6">
                <img src={settingsIcon} className="w-8 h-8 hover:cursor-pointer mr-3" onClick={toggleSettings} />
            </div>

            {isSettingsOpen && (
                <div className={`overlay ${isAnimating ? 'slide-up' : 'slide-down'}`} onClick={toggleSettings}>
                    <div className="popup text-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col justify-center items-center">
                            <h3 className="text-3xl mb-6">Paramètres</h3>
                        </div>
                        <label className="flex items-center text-lg hover:cursor-pointer mb-2">
                            Commencer du début
                            <Checkbox checked={startFromBeginning} onChange={handleStartFromBeginningCheck} className="ml-2 hover:cursor-pointer"/>
                        </label>
                        <label className="flex items-center text-lg hover:cursor-pointer">
                            Jouer chaque pièce une seule fois
                            <Checkbox checked={playOnce} onChange={handlePlayOnceCheck} className="ml-2 hover:cursor-pointer"/>
                        </label>

                        <div className="flex flex-col justify-center items-center">
                            <button
                                className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-800"
                                onClick={saveSettings}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center mt-8">
                {!isPlaying ? (
                    <button
                        className="w-24 h-12 text-lg text-black bg-green-500 hover:bg-green-700 rounded-lg border border-black hover:cursor-pointer hover:text-white hover:border-white"
                        onClick={playMusic}
                    >
                        Jouer
                    </button>
                ) : (
                    <button
                        className="w-24 h-12 text-lg text-black bg-red-600 hover:bg-red-800 rounded-lg border border-black hover:cursor-pointer hover:text-white hover:border-white"
                        onClick={stopMusic}
                    >
                        Arrêter
                    </button>
                )}
            </div>
        </>
    );
}
