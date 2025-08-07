import React from 'react';

export default function Grader({ results, elements }) {
    const normalizeString = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
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

    const getResultIcon = (result) => {
        if (result.isCorrect) {
            return result.normalizedCorrectAnswer !== result.normalizedUserAnswer ? '🟡' : '✅';
        }
        return '❌';
    };

    const getResultColor = (result) => {
        if (result.isCorrect) {
            return result.normalizedCorrectAnswer !== result.normalizedUserAnswer
                ? 'from-yellow-600/80 to-amber-600/80 border-yellow-400/50'
                : 'from-emerald-600/80 to-green-600/80 border-emerald-400/50';
        }
        return 'from-red-600/80 to-rose-600/80 border-red-400/50';
    };

    const getTextColor = (result) => {
        if (result.isCorrect) {
            return result.normalizedCorrectAnswer !== result.normalizedUserAnswer
                ? 'text-yellow-100'
                : 'text-emerald-100';
        }
        return 'text-red-100';
    };

    const correctCount = filteredResults.filter(r => r.isCorrect).length;
    const totalCount = filteredResults.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-slate-800/60 to-indigo-800/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-indigo-400/30 shadow-xl">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📊</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Résultats</h2>
                            <p className="text-indigo-200">
                                {correctCount}/{totalCount} correct{correctCount > 1 ? 's' : ''} ({percentage}%)
                            </p>
                        </div>
                        <div className="text-4xl ml-4">
                            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Cards */}
            <div className="space-y-3">
                {filteredResults.map((result, index) => (
                    <div key={index} className={`bg-gradient-to-r ${getResultColor(result)} backdrop-blur-sm rounded-xl border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getResultIcon(result)}</span>
                                    <div>
                                        <h3 className={`font-bold text-lg ${getTextColor(result)}`}>
                                            {result.parameterName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-sm ${getTextColor(result)} opacity-80`}>
                                                Réponse correcte:
                                            </span>
                                            <span className={`font-semibold ${getTextColor(result)}`}>
                                                {result.correctAnswer}
                                            </span>
                                        </div>
                                        {result.userAnswer && result.userAnswer !== result.correctAnswer && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-sm ${getTextColor(result)} opacity-80`}>
                                                    Votre réponse:
                                                </span>
                                                <span className={`font-semibold ${getTextColor(result)} line-through`}>
                                                    {result.userAnswer}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                        result.isCorrect
                                            ? result.normalizedCorrectAnswer !== result.normalizedUserAnswer
                                                ? 'bg-yellow-500/20 text-yellow-200'
                                                : 'bg-emerald-500/20 text-emerald-200'
                                            : 'bg-red-500/20 text-red-200'
                                    }`}>
                                        {result.isCorrect
                                            ? result.normalizedCorrectAnswer !== result.normalizedUserAnswer
                                                ? 'Partiellement'
                                                : 'Correct'
                                            : 'Incorrect'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Message */}
            <div className="text-center mt-8">
                <div className={`inline-block backdrop-blur-sm rounded-xl px-6 py-4 border shadow-xl ${
                    percentage >= 80
                        ? 'bg-gradient-to-r from-emerald-800/60 to-green-800/60 border-emerald-400/30'
                        : percentage >= 60
                            ? 'bg-gradient-to-r from-blue-800/60 to-indigo-800/60 border-blue-400/30'
                            : 'bg-gradient-to-r from-orange-800/60 to-red-800/60 border-orange-400/30'
                }`}>
                    <p className={`font-semibold text-lg ${
                        percentage >= 80
                            ? 'text-emerald-200'
                            : percentage >= 60
                                ? 'text-blue-200'
                                : 'text-orange-200'
                    }`}>
                        {percentage >= 80
                            ? 'Excellent travail ! 🌟'
                            : percentage >= 60
                                ? 'Bon travail ! Continuez ainsi ! 👏'
                                : 'Continuez à vous entraîner ! 💪'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
