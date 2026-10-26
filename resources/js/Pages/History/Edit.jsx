import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import SharedPieceEditor from '@/Components/SharedPieceEditor';

export default function Edit({ auth }) {
    const { user } = auth;
    const [piecesList, setPiecesList] = useState([]);
    const [coursesList, setCoursesList] = useState([]);
    const [piecesInReserve, setPiecesInReserve] = useState([]);
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

        fetchData().then(r => {});
    }, [user.institution_id]);

    const getPiecesInReserve = async () => {
        try {
            const response = await axios.get(route('piecesInReserve'));
            setPiecesInReserve(response.data);
        } catch (error) {
            console.error('Error fetching reserve pieces:', error);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Histoire</h2>}
        >
            <Head title="Histoire" />

            {isLoading ? (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700/70 dark:bg-gray-800 dark:text-gray-400">
                        Chargement des données...
                    </p>
                </div>
            ) : (
                <SharedPieceEditor
                    piecesList={piecesList}
                    setPiecesList={setPiecesList}
                    coursesList={coursesList}
                    mode="history"
                    getPiecesInReserve={getPiecesInReserve}
                    piecesInReserve={piecesInReserve}
                    user={user}
                />
            )}
        </AuthenticatedLayout>
    );
}
