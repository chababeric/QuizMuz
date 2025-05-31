import {Head} from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import AddNewPiece from "@/Pages/Piece/Partials/AddNewPiece.jsx";
import UpdatePiece from "@/Pages/Piece/Partials/UpdatePiece.jsx";
import { useEffect, useState } from "react";
import PiecesReserve from "@/Pages/Piece/Partials/PiecesReserve.jsx";

export default function Edit({ auth, user }) {
    const [pieces, setPieces] = useState([]);
    const [courses, setCourses] = useState([]);
    const [piecesInReserve, setPiecesInReserve] = useState([]);
    const [groupedPieces, setGroupedPieces] = useState({});

    useEffect( () => {
        getAllPieces();
        getPiecesInReserve();
        updateLastActionTime();
    }, []);

    const getAllPieces = () => {
        axios.get(route('allPieces'))
            .then((response) => {
                // Sort the piecesList by order
                const sortedPieces = response.data.sort((a, b) => a.order - b.order);
                setPieces(sortedPieces);
            })
            .catch((error) => {
                console.log(error);
            });

        axios.get(route('allCourses'), {
            params: {
                institution_id: auth.user.institution_id,
            }
        }).then(response => {
            const filteredCourses = response.data.filter(course => !course.name.includes('Formation Musicale et Auditive'));
            setCourses(filteredCourses);
        }).catch(error => {
            console.log(error);
        });
    }

    const getPiecesInReserve = () => {
        axios.get(route('piecesInReserve'))
            .then(response => {
                const pieces = response.data;

                const grouped = pieces.reduce((acc, piece) => {
                    const courseId = piece.level?.course_id;
                    const course = courses.find(course => course.id === courseId);

                    const courseName = course ? course.name : 'Non Catégorisé';

                    if (!acc[courseName]) {
                        acc[courseName] = [];
                    }
                    acc[courseName].push(piece);

                    return acc;
                }, {});

                setPiecesInReserve(pieces);
                setGroupedPieces(grouped);
            })
            .catch(error => {
                console.error('Error fetching pieces:', error);
            });
    }

    const updateLastActionTime = () => {
        axios.post(route('updateLastActionTime'))
            .then(response => {})
            .catch(error => {
                console.error('Error updating last action time:', error);
            });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Pièce</h2>}
        >
            <Head title="Admin - Pièce" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <AddNewPiece
                            className="max-w-xl dark:bg-gray-800"
                            piecesList={pieces}
                            coursesList={courses}
                            updateLastActionTime={updateLastActionTime}
                            getAllPieces={getAllPieces}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <UpdatePiece
                            piecesList={pieces}
                            setPiecesList={setPieces}
                            coursesList={courses}
                            className="dark:bg-gray-800"
                            updateLastActionTime={updateLastActionTime}
                            getPiecesInReserve={getPiecesInReserve}
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg dark:bg-gray-800">
                        <PiecesReserve
                            className="dark:bg-gray-800"
                            updateLastActionTime={updateLastActionTime}
                            coursesList={courses}
                            getAllPieces={getAllPieces}
                            piecesInReserve={piecesInReserve}
                            groupedPieces={groupedPieces}
                            getPiecesInReserve={getPiecesInReserve}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
