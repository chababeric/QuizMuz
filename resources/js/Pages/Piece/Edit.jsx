import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import SharedPieceEditor from "@/Components/SharedPieceEditor.jsx";

export default function Edit({ auth }) {
    const { user } = auth;
    const [piecesList, setPiecesList] = useState([]);
    const [coursesList, setCoursesList] = useState([]);
    const [piecesInReserve, setPiecesInReserve] = useState([]);
    const [lastActionTime, setLastActionTime] = useState(Date.now());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Get pieces, courses, and reserve pieces
        const fetchData = async () => {
            try {
                // Get pieces
                const piecesResponse = await axios.get(route('allPieces'));
                const sortedPieces = piecesResponse.data.sort((a, b) => a.order - b.order);
                setPiecesList(sortedPieces);

                // Get courses with institution_id
                const coursesResponse = await axios.get(route('allCourses'), {
                    params: {
                        institution_id: user.institution_id
                    }
                });
                setCoursesList(coursesResponse.data);

                // Get reserve pieces
                await getPiecesInReserve();

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lastActionTime, user.institution_id]);

    const getPiecesInReserve = async () => {
        try {
            const response = await axios.get(route('piecesInReserve'));
            setPiecesInReserve(response.data);
        } catch (error) {
            console.error('Error fetching reserve pieces:', error);
        }
    };

    const updateLastActionTime = () => {
        setLastActionTime(Date.now());
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pièce</h2>}
        >
            <Head title="Pièce" />

            {isLoading ? (
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-center text-gray-500 dark:text-gray-400">Chargement des données...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-12 dark:bg-gray-900">
                    <SharedPieceEditor
                        piecesList={piecesList}
                        setPiecesList={setPiecesList}
                        coursesList={coursesList}
                        mode="litmus"
                        updateLastActionTime={updateLastActionTime}
                        getPiecesInReserve={getPiecesInReserve}
                        piecesInReserve={piecesInReserve}
                        user={user}
                    />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
