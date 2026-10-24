import React, { useState, useEffect } from "react";
import { PlayIcon, SettingsIcon, StopIcon, VolumeIcon } from '@/Components/AppIcons';
import { quizCard, sectionLabel, transition } from '@/Components/QuizUi';

const Switch = ({ checked, onChange, disabled }) => (
    <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only"/>
        <span aria-hidden="true" className={`w-11 h-6 rounded-full bg-white/[0.15] peer-checked:bg-[#1E9E62] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E0566C] peer-disabled:opacity-50 ${transition}`}></span>
        <span aria-hidden="true" className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow peer-checked:translate-x-5 ${transition}`}></span>
    </span>
);

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

    const settingRow = 'flex items-center justify-between gap-4 min-h-[44px] cursor-pointer';

    return (
        <section aria-labelledby="audio-heading" className={`${quizCard} p-4 md:p-5 flex flex-col gap-4`}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]"></div>

            <div className="relative flex items-center gap-3">
                <span aria-hidden="true" className="w-11 h-11 shrink-0 rounded-[14px] bg-[rgba(162,120,224,0.14)] text-[#BFA0F0] flex items-center justify-center">
                    <VolumeIcon/>
                </span>
                <h2 id="audio-heading" className={`flex-1 ${sectionLabel}`}>Contrôles Audio</h2>
                <button
                    type="button"
                    onClick={toggleSettings}
                    disabled={disabled}
                    aria-expanded={isSettingsOpen}
                    aria-controls="audio-settings"
                    className={`min-h-[44px] -my-1 px-3 inline-flex items-center gap-2 rounded-full text-[14px] font-medium text-[#C9CCDA] hover:text-[#F2F3F8] hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed ${transition}`}
                >
                    <SettingsIcon className="w-4 h-4"/>
                    Paramètres
                </button>
            </div>

            {!isPlaying ? (
                <button
                    type="button"
                    onClick={playMusic}
                    disabled={disabled}
                    className={`relative w-full inline-flex items-center justify-center gap-2 min-h-[56px] rounded-full bg-white text-[#06070D] hover:bg-[#E6E8F0] text-[17px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${transition}`}
                >
                    <PlayIcon className="w-5 h-5"/>
                    {disabled ? 'Chargement...' : 'Jouer'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={stopMusic}
                    disabled={disabled}
                    className={`relative w-full inline-flex items-center justify-center gap-2 min-h-[56px] rounded-full border border-white/[0.2] hover:border-white/[0.35] hover:bg-white/[0.05] text-[17px] font-semibold text-[#F2F3F8] disabled:opacity-60 disabled:cursor-not-allowed ${transition}`}
                >
                    <StopIcon className="w-5 h-5"/>
                    Arrêter
                </button>
            )}

            {isSettingsOpen && (
                <div id="audio-settings" className="relative border-t border-white/[0.08] pt-3 flex flex-col gap-1">
                    <h3 className="text-[13px] font-medium text-[#A9AEC2]">Paramètres Audio</h3>
                    {!disableRandomPosition && (
                        <label className={settingRow}>
                            <span className="text-[15px] text-[#F2F3F8]">Commencer du début</span>
                            <Switch checked={startFromBeginning} onChange={handleStartFromBeginningCheck} disabled={disabled}/>
                        </label>
                    )}
                    <label className={settingRow}>
                        <span className="text-[15px] text-[#F2F3F8]">
                            {disableRandomPosition ? "Jouer chaque accord/formule une seule fois" : "Jouer chaque pièce une seule fois"}
                        </span>
                        <Switch checked={playOnce} onChange={handlePlayOnceCheck} disabled={disabled}/>
                    </label>
                </div>
            )}
        </section>
    );
}
