import React from 'react';
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon } from '@/Components/AppIcons';

// Correct (exact), partially correct (accepted but spelled differently) or incorrect
const statusStyles = {
    correct: { label: 'Correct', Icon: CircleCheckIcon, text: 'text-[#5FD39A]', box: 'border-[rgba(30,158,98,0.35)] bg-[rgba(30,158,98,0.08)]' },
    partial: { label: 'Partiellement', Icon: CircleAlertIcon, text: 'text-[#F2B94B]', box: 'border-[rgba(242,185,75,0.35)] bg-[rgba(242,185,75,0.08)]' },
    incorrect: { label: 'Incorrect', Icon: CircleXIcon, text: 'text-[#F07A8D]', box: 'border-[rgba(224,86,108,0.35)] bg-[rgba(224,86,108,0.08)]' },
};

export default function Grader({ results, elements }) {
    const normalizeString = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    };

    const filteredResults = elements
        .map((element) => {
            const matchingResult = results.find((result) => result.parameter === element.col);
            if (matchingResult) {
                return {
                    parameterName: element.name,
                    correctAnswer: matchingResult.correct_answer,
                    userAnswer: matchingResult.user_answer,
                    isCorrect: matchingResult.is_correct,
                    normalizedCorrectAnswer: normalizeString(matchingResult.correct_answer),
                    normalizedUserAnswer: normalizeString(matchingResult.user_answer),
                };
            }
            return null;
        }).filter(Boolean);

    const getStatus = (result) => {
        if (result.isCorrect) {
            return result.normalizedCorrectAnswer !== result.normalizedUserAnswer ? 'partial' : 'correct';
        }
        return 'incorrect';
    };

    const correctCount = filteredResults.filter(r => r.isCorrect).length;
    const totalCount = filteredResults.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
        <div className="flex flex-col gap-4">
            {/* Summary */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-[16px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-[15px] text-[#C9CCDA]">
                    <span className="text-[24px] font-bold text-[#F2F3F8]">{correctCount}/{totalCount}</span>
                    {' '}correct{correctCount > 1 ? 's' : ''} ({percentage}%)
                </p>
                <p className="text-[15px] font-semibold text-[#F2F3F8]">
                    {percentage >= 80
                        ? 'Excellent travail !'
                        : percentage >= 60
                            ? 'Bon travail ! Continuez ainsi !'
                            : 'Continuez à vous entraîner !'
                    }
                </p>
            </div>

            {/* One row per answer */}
            <ul className="grid gap-3 md:grid-cols-2">
                {filteredResults.map((result, index) => {
                    const status = statusStyles[getStatus(result)];
                    return (
                        <li key={index} className={`rounded-[16px] border px-4 py-3 ${status.box}`}>
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-[15px] font-semibold text-[#F2F3F8]">{result.parameterName}</h3>
                                <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${status.text}`}>
                                    <status.Icon className="w-4 h-4"/>
                                    {status.label}
                                </span>
                            </div>
                            <p className="mt-1 text-[14px] text-[#C9CCDA]">
                                Réponse correcte: <span className="font-semibold text-[#F2F3F8]">{result.correctAnswer}</span>
                            </p>
                            {result.userAnswer && result.userAnswer !== result.correctAnswer && (
                                <p className="mt-0.5 text-[14px] text-[#A9AEC2]">
                                    Votre réponse: <span className="font-semibold line-through">{result.userAnswer}</span>
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
