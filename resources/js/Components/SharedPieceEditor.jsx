import React, { useMemo } from 'react';
import axios from 'axios';
import AddModule from '@/Pages/Piece/Partials/AddModule';
import ModuleList from '@/Pages/Piece/Partials/ModuleList';
import UpdatePiece from '@/Pages/Piece/Partials/UpdatePiece';
import AddNewPiece from '@/Pages/Piece/Partials/AddNewPiece';

export default function SharedPieceEditor({
  piecesList = [],
  setPiecesList,
  coursesList = [],
  mode, // 'litmus' or 'history'
  user
}) {

    // Filter pieces based on the mode (litmus or history)
    const filteredPiecesList = useMemo(() => {
        if (!piecesList || !Array.isArray(piecesList)) return [];

        return piecesList.filter(piece => {
            const courseName = piece?.level?.course?.name;
            return mode === 'litmus'
                ? courseName === 'Littérature Musicale'
                : courseName === 'Histoire de la Musique';
        });
    }, [piecesList, mode]);

    // Filter courses based on the mode
    const filteredCoursesList = useMemo(() => {
        if (!coursesList || !Array.isArray(coursesList)) return [];

        return coursesList.filter(course => {
            return mode === 'litmus'
                ? course.name === 'Littérature Musicale'
                : course.name === 'Histoire de la Musique';
        });
    }, [coursesList, mode]);

    // Filter pieces in reserve based on the mode
    // const filteredPiecesInReserve = useMemo(() => {
    //     if (!piecesInReserve || !Array.isArray(piecesInReserve)) return [];
    //
    //     return piecesInReserve.filter(piece => {
    //         const courseName = piece?.level?.course?.name;
    //         return mode === 'litmus'
    //             ? courseName === 'Littérature Musicale'
    //             : courseName === 'Histoire de la Musique';
    //     });
    // }, [piecesInReserve, mode]);

    // Group pieces by level for the PiecesReserve component
    // const groupedPieces = useMemo(() => {
    //     if (!filteredPiecesInReserve || !Array.isArray(filteredPiecesInReserve)) return {};
    //
    //     // Group pieces by level
    //     const grouped = filteredPiecesInReserve.reduce((groups, piece) => {
    //         const level = piece?.level?.name;
    //         if (!level) return groups;
    //
    //         if (!groups[level]) {
    //             groups[level] = [];
    //         }
    //         groups[level].push(piece);
    //         return groups;
    //     }, {});
    //
    //     // Sort each group by order or title
    //     Object.keys(grouped).forEach(level => {
    //         grouped[level].sort((a, b) => {
    //             if (a.order !== undefined && b.order !== undefined) {
    //                 return a.order - b.order;
    //             }
    //             return a.title.localeCompare(b.title);
    //         });
    //     });
    //
    //     return grouped;
    // }, [filteredPiecesInReserve]);

    // This function wraps setPiecesList to ensure we maintain the separation
    const handleSetPiecesList = (newPieces) => {
        if (!piecesList || !Array.isArray(piecesList)) {
            setPiecesList(newPieces);
            return;
        }

        // Keep pieces from the other mode unchanged
        const otherPieces = piecesList.filter(piece => {
            const courseName = piece?.level?.course?.name;
            return mode === 'litmus'
                ? courseName !== 'Littérature Musicale'
                : courseName !== 'Histoire de la Musique';
        });

        // Combine with the updated pieces for this mode
        setPiecesList([...otherPieces, ...newPieces]);
    };

    // Function to get all pieces - needed by both components
    const getAllPieces = () => {
        axios.get(route('allPieces'))
            .then((response) => {
                const sortedPieces = response.data.sort((a, b) => a.order - b.order);
                setPiecesList(sortedPieces);
            })
            .catch((error) => {
                console.error('Error fetching pieces:', error);
            });
    };

    return (
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                <AddNewPiece
                    className="max-w-xl"
                    piecesList={filteredPiecesList || []}
                    setPiecesList={handleSetPiecesList}
                    getAllPieces={getAllPieces}
                    user={user}
                    courseName={mode === 'litmus' ? 'Littérature Musicale' : 'Histoire de la Musique'}
                />
            </div>

            {mode === 'litmus' && (
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                    <AddModule
                        className="max-w-xl"
                        coursesList={filteredCoursesList || []}
                        user={user}
                        courseName={mode === 'litmus' ? 'Littérature Musicale' : 'Histoire de la Musique'}
                    />
                </div>
            )}

            {mode === 'litmus' && (
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                    <ModuleList
                        className="max-w-xl"
                        user={user}
                        courseName={mode === 'litmus' ? 'Littérature Musicale' : 'Histoire de la Musique'}
                    />
                </div>
            )}

            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                <UpdatePiece
                    className="w-full"
                    piecesList={filteredPiecesList || []}
                    setPiecesList={handleSetPiecesList}
                    coursesList={filteredCoursesList || []}
                    // getPiecesInReserve={getPiecesInReserve}
                    getAllPieces={getAllPieces}
                    user={user}
                    courseName={mode === 'litmus' ? 'Littérature Musicale' : 'Histoire de la Musique'}
                />
            </div>
        </div>
    );
}
