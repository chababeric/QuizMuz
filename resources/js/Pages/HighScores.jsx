import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Head } from "@inertiajs/react";
import AppHeader from '@/Components/AppHeader';
import { CircleAlertIcon, TrophyIcon } from '@/Components/AppIcons';

const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';
const formatNumber = (value) => Number(value).toLocaleString('fr-FR');

// Podium accents for ranks 1 to 3: gold, silver, bronze
const podium = {
    1: { text: 'text-[#F2B94B]', tile: 'bg-[rgba(242,185,75,0.14)]', border: 'border-[rgba(242,185,75,0.35)]', glow: 'bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.18),transparent_60%)]' },
    2: { text: 'text-[#C9CCDA]', tile: 'bg-white/[0.08]', border: 'border-white/[0.16]', glow: 'bg-[radial-gradient(circle_at_top_right,rgba(201,204,218,0.12),transparent_60%)]' },
    3: { text: 'text-[#D9A27A]', tile: 'bg-[rgba(217,162,122,0.14)]', border: 'border-[rgba(217,162,122,0.35)]', glow: 'bg-[radial-gradient(circle_at_top_right,rgba(217,162,122,0.16),transparent_60%)]' },
};

const YouPill = () => (
    <span className="shrink-0 rounded-full bg-[rgba(242,185,75,0.16)] px-2 py-0.5 text-[12px] font-semibold text-[#F2B94B]">Vous</span>
);

export default function HighScores({ auth, courseId }) {
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        axios.get('/all-scores', {params: {course_id: courseId}})
            .then(response => {
                const sortedScores = response.data.sort((a, b) => b.score - a.score);
                const rankedScores = sortedScores.map((score, index, arr) => {
                    if (index === 0) {
                        score.rank = 1;
                    } else if (score.score === arr[index - 1].score) {
                        score.rank = arr[index - 1].rank;
                    } else {
                        score.rank = index + 1;
                    }
                    return score;
                });
                setScores(rankedScores);
                setError(null);
            })
            .catch(error => {
                console.error('There was an error fetching the scores!', error);
                setError('Erreur lors du chargement des scores');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [courseId]);

    const isCurrentUser = (score) => score.user.username === auth.user.username;
    const topThree = scores.slice(0, 3);
    const others = scores.slice(3);

    const renderLoadingState = () => (
        <div role="status" className={`${card} self-center flex items-center gap-3 px-6 py-4`}>
            <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none"></span>
            <span className="text-[17px] font-semibold">Chargement des scores...</span>
        </div>
    );

    const renderErrorState = () => (
        <div role="alert" className={`${card} border-[rgba(224,86,108,0.4)] p-6 flex items-start gap-3`}>
            <CircleAlertIcon className="w-6 h-6 text-[#F07A8D]"/>
            <div>
                <h2 className="text-[20px] font-semibold">Erreur</h2>
                <p className="text-[15px] text-[#C9CCDA]">{error}</p>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className={`${card} p-6 md:p-10 text-center flex flex-col items-center gap-4`}>
            <span aria-hidden="true" className="w-12 h-12 rounded-[14px] bg-[rgba(242,185,75,0.12)] text-[#F2B94B] flex items-center justify-center">
                <TrophyIcon className="w-6 h-6"/>
            </span>
            <h2 className="text-[24px] md:text-[28px] font-bold">Aucun score disponible</h2>
            <p className="text-[16px] leading-relaxed text-[#C9CCDA]">
                Soyez le premier à jouer un quiz<br/>
                et à apparaître sur ce tableau !
            </p>
        </div>
    );

    const renderScores = () => (
        <>
            {/* Podium */}
            <ol aria-label="Podium" className="grid grid-cols-3 gap-3 md:gap-5">
                {topThree.map((score) => {
                    const style = podium[score.rank] ?? podium[3];
                    const isYou = isCurrentUser(score);
                    return (
                        <li key={score.id ?? score.user.username} className={`${card} ${style.border} p-3 md:p-6 flex flex-col items-center md:items-start gap-2 md:gap-4 text-center md:text-left`}>
                            <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${style.glow}`}></div>
                            <div className="relative w-full flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                                <span className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-[14px] flex items-center justify-center ${style.tile} ${style.text}`}>
                                    <TrophyIcon/>
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[13px] font-semibold ${style.text}`}>{score.rank === 1 ? '1er' : `${score.rank}e`}</div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 min-w-0">
                                        <span className="truncate text-[15px] md:text-[18px] font-semibold">{score.user.username}</span>
                                        {isYou && <span className="hidden md:inline"><YouPill/></span>}
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="text-[18px] md:text-[28px] font-bold leading-none">{formatNumber(score.score)}</span>
                                <span className="ml-1 text-[13px] md:text-[15px] text-[#A9AEC2]">pts</span>
                            </div>
                            {isYou && <span className="relative md:hidden"><YouPill/></span>}
                        </li>
                    );
                })}
            </ol>

            {/* Everyone else */}
            {others.length > 0 && (
                <section aria-labelledby="ranking-heading" className={`${card} p-2 md:p-3`}>
                    <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
                        <h2 id="ranking-heading" className="text-[17px] font-semibold">Classement</h2>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
                            {scores.length} score{scores.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <ol className="border-t border-white/[0.06] pt-1">
                        {others.map((score) => {
                            const isYou = isCurrentUser(score);
                            return (
                                <li
                                    key={score.id ?? score.user.username}
                                    className={`flex items-center gap-3 min-h-[48px] px-3 py-2 rounded-[14px] ${
                                        isYou ? 'bg-[rgba(242,185,75,0.10)] ring-1 ring-inset ring-[rgba(242,185,75,0.35)]' : ''
                                    }`}
                                >
                                    <span className={`w-8 shrink-0 text-[15px] font-bold tabular-nums ${isYou ? 'text-[#F2B94B]' : 'text-[#A9AEC2]'}`}>{score.rank}</span>
                                    <span className="flex-1 min-w-0 flex items-center gap-2">
                                        <span className="truncate text-[15px] md:text-[16px] font-medium">{score.user.username}</span>
                                        {isYou && <YouPill/>}
                                    </span>
                                    <span className="text-[15px] font-semibold tabular-nums text-[#C9CCDA]">{formatNumber(score.score)} pts</span>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}
        </>
    );

    const renderContent = () => {
        if (isLoading) return renderLoadingState();
        if (error) return renderErrorState();
        if (scores.length === 0) return renderEmptyState();
        return renderScores();
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Meilleurs Scores - QuizMuz"/>
            <AppHeader title="Meilleurs scores" backHref={route('mainmenu', { courseId: courseId })} backLabel="Retour au menu"/>

            <main className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-5 pb-10 md:pt-8 md:pb-14 flex flex-col gap-4 md:gap-5">
                {renderContent()}
            </main>
        </div>
    );
}
