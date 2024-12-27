import {Head} from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import AddNewPiece from "@/Pages/Piece/Partials/AddNewPiece.jsx";
import UpdatePiece from "@/Pages/Piece/Partials/UpdatePiece.jsx";
import { useEffect, useState } from "react";

export default function Edit({ auth, user }) {
    const [pieces, setPieces] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect( () => {
        axios.get(route('allPieces'))
            .then(response => {
                setPieces(response.data);
        }).catch(error => {
            console.log(error);
        });

        axios.get(route('allCourses'), {
            params: {
                institution_id: auth.user.institution_id,
            }
        }).then(response => {
            setCourses(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pièce</h2>}
        >
            <Head title="Admin - Pièce" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <AddNewPiece className="max-w-xl" piecesList={pieces} coursesList={courses}/>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdatePiece className="max-w-xl" piecesList={pieces} coursesList={courses}/>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
