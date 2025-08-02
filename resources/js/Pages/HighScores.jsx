import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Head, Link } from "@inertiajs/react";
import { useSwipeable } from 'react-swipeable';
import ScoreCard from "@/Components/ScoreCard.jsx";

export default function HighScores({ auth, courseId }) {
    const [scores, setScores] = useState([]);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
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
                });//.slice(0, 10); // Only keep top 10 scores
                setScores(rankedScores);
            })
            .catch(error => {
                console.error('There was an error fetching the scores!', error);
            });
    }, []);

    const nextScore = () => {
        setRotation((prevRotation) => prevRotation - (360 / scores.length));
    };

    const prevScore = () => {
        setRotation((prevRotation) => prevRotation + (360 / scores.length));
    };

    const getCardStyle = (index) => {
        const totalCards = scores.length;
        const angle = index * (360 / totalCards);

        return {
            transform: `rotateY(${angle}deg) translateZ(200px)`,
        };
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => nextScore(),
        onSwipedRight: () => prevScore(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    return (
        <div className="main-app h-screen overflow-hidden">
            <div className="background-container"></div>
            <Head title="Meilleurs Scores - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Meilleurs Scores</h1>

            <div
                {...handlers}
                className="perspective-1000 px-10 w-full h-72 flex items-center flex-col relative cursor-grab overflow-hidden"
            >
                <div
                    className="transform-style-preserve-3d transform-origin-center flex justify-center items-center relative"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transition: 'transform 0.5s ease',
                        transform: `rotateY(${rotation}deg)`,
                        userSelect: 'none'
                    }}
                >
                    {scores.map((score, index) => (
                        <div key={index} className="score-card" style={getCardStyle(index)}>
                            <ScoreCard rank={score.rank} username={score.user.username} score={score.score}
                                       user={auth.user.username}/>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <Link
                    href={route('mainmenu', { courseId: courseId })}
                    className="inline-flex items-center justify-center text-white py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-900 border border-white"
                    style={{userSelect: 'none'}}
                >
                    Retour au menu
                </Link>
            </div>
        </div>
    );
}
