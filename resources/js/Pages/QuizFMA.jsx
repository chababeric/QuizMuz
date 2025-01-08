import { Link, Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuizFMA({ auth, chords, difficulty, level, courseId }) {
    const [lastCheckTime, setLastCheckTime] = useState(0);
    const [chordsData, setChordsData] = useState([]);

    return (
        <main className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Quiz - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Quiz</h1>


        </main>
    );
}
