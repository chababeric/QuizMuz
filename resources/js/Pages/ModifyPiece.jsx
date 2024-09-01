import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/inertia-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import editIcon from "../../icons/edit.svg";
import deleteIcon from "../../icons/delete-black.svg";
import axios from "axios";
import MessageDisplay from "@/Components/MessageDisplay.jsx";

export default function ModifyPiece() {
    const [pieces, setPieces] = useState([]);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { data, setData, put, delete: destroy, processing } = useForm({
        id: '',
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: '',
        file_name: ''
    });

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const response = await fetch('/api/levels');
                const data = await response.json();
                setLevels(data);
            } catch (error) {
                console.error("There was an error fetching the levels!", error);
            }
        };

        const fetchPieces = async () => {
            try {
                const response = await fetch('/api/all-pieces');
                const data = await response.json();
                setPieces(data);
            } catch (error) {
                console.error("There was an error fetching the pieces!", error);
            }
        };

        fetchLevels().then(r => {});
        fetchPieces().then(r => {});
    }, []);

    const getLevelNameById = (id) => {
        const level = levels.find(level => level.id === id);
        return level ? level.name : 'Niveau inconnu';
    };

    const openModal = (piece) => {
        setSelectedPiece(piece);
        setData({
            id: piece.id || '',
            period: piece.period || '',
            genre: piece.genre || '',
            composer: piece.composer || '',
            title: piece.title || '',
            element: piece.element || '',
            no_mvt: piece.no_mvt || '',
            mvt: piece.mvt || '',
            form: piece.form || '',
            file_name: piece.file_name || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedPiece(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSave = (e) => {
        e.preventDefault();
        axios.put(`/admin/update-piece/${selectedPiece.id}`, data)
            .then(response => {
                setPieces(prevPieces => prevPieces.map(piece =>
                    piece.id === data.id ? { ...piece, ...data } : piece
                ));
                closeModal();

                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setErrorMessage(error.response.data.message || 'An error occurred');
                setSuccessMessage('');
            });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        axios.post(`/pieces/${selectedPiece.id}/move-to-reserve`)
            .then(response => {
                setPieces(prevPieces => prevPieces.filter(piece => piece.id !== selectedPiece.id));
                closeModal();

                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setErrorMessage(error.data.message || 'An error occurred');
                setSuccessMessage('');
            });
    };

    const sortPiecesByLevelAndOrder = (pieces) => {
        return pieces.sort((a, b) => {
            if (a.level_id === b.level_id) {
                return a.order - b.order;
            }
            return a.level_id - b.level_id;
        });
    };

    const filteredPieces = selectedLevel
        ? pieces.filter(piece => piece.level_id === parseInt(selectedLevel))
        : pieces;

    const sortedPieces = sortPiecesByLevelAndOrder(filteredPieces);

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(pieces);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order field and set state
        const updatedItems = items.map((item, index) => ({ ...item, order: index + 1 }));
        setPieces(updatedItems);

        // Update the backend
        axios.post('/admin/update-order', { pieces: updatedItems })
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setErrorMessage('Échec de la mise à jour de l\'ordre');
                setSuccessMessage('');
            });
    };

    return (
        <div className="flex flex-col w-full items-center">
            <h1 className='text-4xl hover:cursor-default font-bold mb-6'>Modifier une pièce</h1>

            <MessageDisplay successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/>

            <div className="flex items-center space-x-2 mt-3">
                {/*<span className="text-gray-700">Filtrer :</span>*/}
                {/*<select*/}
                {/*    className="border border-gray-300 rounded-lg p-2 w-48"*/}
                {/*    onChange={(e) => setSelectedLevel(e.target.value)}*/}
                {/*>*/}
                {/*    <option value="">Cours</option>*/}
                {/*    {levels.map(level => (*/}
                {/*        <option key={level.id} value={level.id}>{level.name}</option>*/}
                {/*    ))}*/}
                {/*</select>*/}
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="pieces">
                    {(provided, snapshot) => (
                        <table
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-w-full bg-white mt-4"
                        >
                            <thead>
                            <tr>
                                <th className="py-2">Niveau</th>
                                <th className="py-2">Période</th>
                                <th className="py-2">Genre</th>
                                <th className="py-2">Compositeur</th>
                                <th className="py-2">Titre</th>
                                <th className="py-2">Élément</th>
                                <th className="py-2">No. Mvt</th>
                                <th className="py-2">Nom Mvt / Partie</th>
                                <th className="py-2">Forme</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedPieces.map((piece, index) => (
                                <Draggable key={piece.id} draggableId={piece.id.toString()} index={index}>
                                    {(provided, snapshot) => (
                                        <tr
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="text-center cursor-pointer"
                                            onClick={() => openModal(piece)}
                                        >
                                            <td className="border px-4 py-2">{getLevelNameById(piece.level_id)}</td>
                                            <td className="border px-4 py-2">{piece.period}</td>
                                            <td className="border px-4 py-2">{piece.genre}</td>
                                            <td className="border px-4 py-2">{piece.composer}</td>
                                            <td className="border px-4 py-2">{piece.title}</td>
                                            <td className="border px-4 py-2">{piece.element}</td>
                                            <td className="border px-4 py-2">{piece.no_mvt}</td>
                                            <td className="border px-4 py-2">{piece.mvt}</td>
                                            <td className="border px-4 py-2">{piece.form}</td>
                                        </tr>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-20">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[80vh] hide-scrollbar overflow-y-auto">
                        <div className="flex flex-row items-center gap-2 mb-4">
                            <h2 className="text-2xl">Modification</h2>
                            <img src={editIcon} alt="Edit Icon" className="h-6 w-6"/>
                        </div>
                        <form className="flex flex-col space-y-4" onSubmit={handleSave}>
                            <label className="flex flex-col">
                                Période :
                                <input
                                    type="text"
                                    name="period"
                                    value={data.period}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Genre :
                                <input
                                    type="text"
                                    name="genre"
                                    value={data.genre}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Compositeur :
                                <input
                                    type="text"
                                    name="composer"
                                    value={data.composer}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Titre :
                                <input
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Élément :
                                <input
                                    type="text"
                                    name="element"
                                    value={data.element}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                No. Mvt :
                                <input
                                    type="text"
                                    name="no_mvt"
                                    value={data.no_mvt}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Nom Mvt ou Partie :
                                <input
                                    type="text"
                                    name="mvt"
                                    value={data.mvt}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Forme :
                                <input
                                    type="text"
                                    name="form"
                                    value={data.form}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1 mb-6"
                                />
                            </label>
                            <label className="flex flex-col">
                                Nom du fichier audio :
                                <input
                                    type="text"
                                    name="file_name"
                                    value={data.file_name}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg p-3 mt-1 mb-6"
                                />
                            </label>
                            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-6">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white rounded-lg p-3 flex justify-center items-center"
                                    disabled={processing}
                                >
                                    Enregistrer
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white rounded-lg p-3 flex justify-center items-center gap-2"
                                    disabled={processing}
                                >
                                    Enlever
                                    <img src={deleteIcon} alt="Delete Icon" className="h-6 w-6"/>
                                </button>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white rounded-lg p-3 flex justify-center items-center"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
