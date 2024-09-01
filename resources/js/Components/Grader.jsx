import React, { useEffect, useState, useRef } from 'react';
import levenshtein from 'js-levenshtein';
import axios from "axios";

export default function Grader({ auth, piece, userAnswers, lastUpdatedTime, elements, updateScore }) {
    const [updateTime, setUpdateTime] = useState(lastUpdatedTime);
    const prevScore = useRef(null);

    useEffect(() => {
        setUpdateTime(lastUpdatedTime);
    }, [lastUpdatedTime]);

    useEffect(() => {
        const gradeAndUpdateScore = async () => {
            let score = 0;
            elements.forEach((element) => {
                const correctAnswer = piece[element.col];
                const userAnswer = userAnswers[element.col];
                if (!correctAnswer) {
                    return;
                }

                let isCorrect = false;
                let similarityPercentage = 0;
                if (element.col === 'composer') {
                    isCorrect = correctAnswer.includes(',')
                        ? compareComposer(correctAnswer, userAnswer)
                        : compareAnswers(correctAnswer, userAnswer);
                    similarityPercentage = correctAnswer.includes(',')
                        ? getComposerSimilarity(correctAnswer, userAnswer)
                        : getSimilarityPercentage(correctAnswer, userAnswer);
                } else if (element.col === 'no_mvt') {
                    isCorrect = compareNumbers(correctAnswer, userAnswer);
                    similarityPercentage = isCorrect ? 100 : 0; // If numbers match, similarity is 100%
                } else {
                    isCorrect = compareAnswers(correctAnswer, userAnswer);
                    similarityPercentage = getSimilarityPercentage(correctAnswer, userAnswer);
                }

                if (isCorrect || similarityPercentage >= 70) {
                    score += 2;
                }
            });

            if (score !== prevScore.current) {
                prevScore.current = score;

                await axios.post('/update-score', {
                    user_id: auth.user.id,
                    score: score
                })
                .then(response => {
                    updateScore(response.data.score);
                })
            }
        };

        gradeAndUpdateScore().then(r => {});
    }, [auth, elements, piece, userAnswers, updateScore]);

    if (!piece) {
        return <div>Loading...</div>;
    }

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const extractLettersAndNumbers = (str) => {
        const letters = removeAccents(str).replace(/[^a-zA-Z]/g, "").toLowerCase();
        const numbers = str.replace(/[^0-9]/g, "");
        return { letters, numbers };
    };

    const getSimilarityPercentage = (correctAnswer, userAnswer) => {
        if (!userAnswer) return 0;
        const { letters: correctLetters } = extractLettersAndNumbers(correctAnswer);
        const { letters: userLetters } = extractLettersAndNumbers(userAnswer);
        const distance = levenshtein(correctLetters, userLetters);
        const maxLength = Math.max(correctLetters.length, userLetters.length);
        return ((maxLength - distance) / maxLength) * 100;
    };

    const compareAnswers = (correctAnswer, userAnswer) => {
        const { letters: correctLetters, numbers: correctNumbers } = extractLettersAndNumbers(correctAnswer);
        const { letters: userLetters, numbers: userNumbers } = extractLettersAndNumbers(userAnswer);

        const similarityPercentage = getSimilarityPercentage(correctLetters, userLetters);
        const numbersMatch = correctNumbers === userNumbers;

        return similarityPercentage >= 70 && numbersMatch;
    };

    const compareNumbers = (correctAnswer, userAnswer) => {
        return parseInt(correctAnswer) === parseInt(userAnswer);
    };

    const getBackgroundColor = (similarityPercentage, numbersMatch) => {
        if (numbersMatch && similarityPercentage === 100) {
            return 'bg-green-600';
        } else if (numbersMatch && similarityPercentage >= 70) {
            return 'bg-yellow-600';
        } else {
            return 'bg-red-600';
        }
    };

    const getComposerSimilarity = (correctAnswer, userAnswer) => {
        if (!userAnswer) return 0;
        const [correctFamilyName, correctName] = correctAnswer.split(',').map(str => str.trim());
        const { letters: correctFamilyLetters } = extractLettersAndNumbers(correctFamilyName);
        const { letters: correctFullLetters } = extractLettersAndNumbers(correctAnswer);
        const { letters: userLetters } = extractLettersAndNumbers(userAnswer);

        const familyNameSimilarity = getSimilarityPercentage(correctFamilyLetters, userLetters);
        const fullNameSimilarity = getSimilarityPercentage(correctFullLetters, userLetters);

        return Math.max(familyNameSimilarity, fullNameSimilarity);
    };

    const compareComposer = (correctAnswer, userAnswer) => {
        if (!userAnswer) return false;
        const [correctFamilyName, correctName] = correctAnswer.split(',').map(str => str.trim());
        const { letters: correctFamilyLetters } = extractLettersAndNumbers(correctFamilyName);
        const { letters: correctFullLetters } = extractLettersAndNumbers(correctAnswer);
        const { letters: userLetters } = extractLettersAndNumbers(userAnswer);

        const familyNameSimilarity = getSimilarityPercentage(correctFamilyLetters, userLetters);
        const fullNameSimilarity = getSimilarityPercentage(correctFullLetters, userLetters);

        return Math.max(familyNameSimilarity, fullNameSimilarity) >= 70;
    };

    return (
        <div className="flex flex-col items-center w-full mt-4">
            <h2 className="text-3xl font-bold text-white mb-4">Correction</h2>
            <table className="table-auto w-11/12 bg-white/80">
                <thead>
                <tr>
                    <th className="px-4 py-2 text-center text-xl w-1/2">Paramètre</th>
                    <th className="px-4 py-2 text-center text-xl w-1/2">Réponse</th>
                </tr>
                </thead>
                <tbody>
                {elements.map((element, index) => {
                    const correctAnswer = piece[element.col];
                    const userAnswer = userAnswers[element.col];
                    if (!correctAnswer) {
                        return null;
                    }

                    let isCorrect;
                    let similarityPercentage;
                    if (element.col === 'composer') {
                        isCorrect = correctAnswer.includes(',')
                            ? compareComposer(correctAnswer, userAnswer)
                            : compareAnswers(correctAnswer, userAnswer);
                        similarityPercentage = correctAnswer.includes(',')
                            ? getComposerSimilarity(correctAnswer, userAnswer)
                            : getSimilarityPercentage(correctAnswer, userAnswer);
                    } else if (element.col === 'no_mvt') {
                        isCorrect = compareNumbers(correctAnswer, userAnswer);
                        similarityPercentage = isCorrect ? 100 : 0;
                    } else {
                        isCorrect = compareAnswers(correctAnswer, userAnswer);
                        similarityPercentage = getSimilarityPercentage(correctAnswer, userAnswer);
                    }

                    const backgroundColor = getBackgroundColor(similarityPercentage, isCorrect);
                    return (
                        <tr key={index} className={`${backgroundColor} text-center border-b border-gray-200 text-lg`}>
                            <td className="px-4 py-2">{element.name}</td>
                            <td className="px-4 py-2">{correctAnswer}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
