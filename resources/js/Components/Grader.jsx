import React from 'react';

export default function Grader({ results, elements }) {
    const normalizeString = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD') // Normalize the string into decomposed form
            .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics (accents)
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

    return (
        <div className="flex flex-col items-center w-full mt-4">
            <h2 className="text-3xl font-bold text-white mb-4">Correction</h2>
            <div className="w-11/12 bg-white/80 rounded-lg overflow-hidden">
                <table className="table-auto w-full">
                    <thead>
                    <tr>
                        <th className="px-4 py-2 text-center text-xl w-1/3">Paramètre</th>
                        <th className="px-4 py-2 text-center text-xl w-1/3">Réponse</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredResults.map((result, index) => (
                        <tr
                            key={index}
                            className={`text-center border-b border-gray-200 text-lg ${
                                result.isCorrect
                                    ? result.normalizedCorrectAnswer !== result.normalizedUserAnswer
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    : 'bg-red-500'
                            }`}
                        >
                            <td className="px-4 py-2">{result.parameterName}</td>
                            <td className="px-4 py-2">{result.correctAnswer}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
