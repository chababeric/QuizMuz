import React, { useEffect, useState, useRef } from "react";
import Modal from "@/Components/Modal.jsx";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import DangerButton from "@/Components/DangerButton.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";

export default function PiecesReserve({ className = '', updateLastActionTime, coursesList, getAllPieces, piecesInReserve, groupedPieces, getPiecesInReserve }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const currentPiece = useRef(piecesInReserve[0] || null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        getPiecesInReserve();
    }, [coursesList]);

    const groupAndSortPiecesByLevel = (pieces) => {
        // Group pieces by level
        const groupedPieces = pieces.reduce((groups, piece) => {
            const level = piece.level.name; // Using level.name as the key
            if (!groups[level]) {
                groups[level] = [];
            }
            groups[level].push(piece);
            return groups;
        }, {});

        // Sort each group by order (if available) or any other criteria
        Object.keys(groupedPieces).forEach(level => {
            groupedPieces[level].sort((a, b) => {
                // If order property exists, use it for sorting
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                // Otherwise, sort by title as a fallback
                return a.title.localeCompare(b.title);
            });
        });

        return groupedPieces;
    };

    // Group pieces by level
    const piecesByLevel = groupAndSortPiecesByLevel(piecesInReserve);

    const openAddModal = (piece) => {
        currentPiece.current = piece;
        setIsAddModalOpen(true);
    }

    const openDeleteModal = (piece) => {
        currentPiece.current = piece;
        setIsDeleteModalOpen(true);
    }

    const handleMove = (id) => {
        updateLastActionTime();

        axios.post(`/pieces/${id}/move-to-pieces`)
            .then(response => {
                getPiecesInReserve();
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                setIsAddModalOpen(false);
                getAllPieces();
            })
            .catch(error => {
                console.error('Error moving piece:', error);
                setErrorMessage('Une erreur s\'est produite lors du déplacement de la pièce.');
                setSuccessMessage('');
            });
    };

    const handleDelete = (id) => {
        updateLastActionTime();

        axios.post(`/delete-piece/${id}`)
            .then(response => {
                getPiecesInReserve();
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                setIsDeleteModalOpen(false);
                getAllPieces();
            })
            .catch(error => {
                console.error('Error deleting piece:', error);
                setErrorMessage('Une erreur s\'est produite lors de la suppression de la pièce.');
                setSuccessMessage('');
            });
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter une pièce de la réserve</h2>
            </header>

            <MessageDisplay successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <Modal show={isDeleteModalOpen} close={() => setIsDeleteModalOpen(false)}>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Supprimer une pièce</h3>
                    <p className="text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer la pièce <span className="font-semibold">{currentPiece.current?.title}</span>
                        &nbsp;de <span className="font-semibold">{currentPiece.current?.composer}</span> du
                        niveau <span className="font-semibold">{currentPiece.current?.level.name}</span> ?
                    </p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            type="button"
                        >
                            Annuler
                        </button>

                        <DangerButton onClick={() => handleDelete(currentPiece.current?.id)}>
                            Supprimer
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={isAddModalOpen} close={() => setIsAddModalOpen(false)}>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter une pièce</h3>
                    <p className="text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir ajouter la pièce <span className="font-semibold">{currentPiece.current?.title}</span>
                        &nbsp;de <span className="font-semibold">{currentPiece.current?.composer}</span> du
                        niveau <span className="font-semibold">{currentPiece.current?.level.name}</span> ?
                    </p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            type="button"
                        >
                            Annuler
                        </button>

                        <PrimaryButton className="dark:bg-blue-500 dark:hover:bg-blue-600" onClick={() => handleMove(currentPiece.current?.id)}>
                            Ajouter
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <div className="w-full max-h-[600px] overflow-y-auto mt-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                {Object.entries(piecesByLevel).map(([levelName, levelPieces]) => (
                    <div key={levelName}>
                        <h3
                            className="w-fit text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-2 ml-1"
                        >
                            Niveau: {levelName}
                        </h3>
                        <ul className="w-full divide-y divide-gray-300 dark:divide-neutral-700">
                            {levelPieces.map((piece, index) => (
                                <li
                                    key={piece.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-3 bg-white dark:bg-gray-800 space-y-2 sm:space-y-0 sm:space-x-4"
                                >
                                    <span
                                        className="w-9 font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-y-2 sm:gap-y-0 sm:gap-x-6">
                                        <span
                                            className="w-full sm:w-12 truncate font-semibold text-gray-900 dark:text-gray-100"
                                        >
                                            {piece.level.name}
                                        </span>
                                        <span className="truncate text-gray-800 dark:text-gray-300">
                                            {piece.title} &nbsp;&nbsp;
                                        </span>
                                        <span className="truncate text-gray-600 dark:text-gray-400">
                                            {piece.composer} &nbsp;&nbsp;
                                        </span>
                                        {piece.no_mvt && (
                                            <span className="truncate text-gray-500 dark:text-gray-400">
                                                Mvt: {piece.no_mvt} &nbsp;&nbsp;
                                            </span>
                                        )}
                                        {piece.mvt && (
                                            <span className="truncate text-gray-500 dark:text-gray-400">
                                                {piece.mvt}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openAddModal(piece)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Ajouter
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(piece)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
