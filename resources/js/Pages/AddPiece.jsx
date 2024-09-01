import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/inertia-react';
import axios from "axios";
import MessageDisplay from "@/Components/MessageDisplay.jsx";
import FilterableSelect from "@/Components/FilterableSelect.jsx";
import addIcon from "../../icons/add.svg";
import deleteIcon from "../../icons/delete.svg";

export default function AddPiece({ updateLastActionTime }) {
    const [option, setOption] = useState('');
    const [piecesInReserve, setPiecesInReserve] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [piecesInfo, setPiecesInfo] = useState([]);
    const { data, setData, post, processing, errors, reset } = useForm({
        level: '',
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: '',
        fileName: '',
        audioFile: null,
    });

    useEffect(() => {
        fetch('/api/pieces-in-reserve')
            .then(response => response.json())
            .then(data => {
                // Sort pieces by level_id and order
                const sortedPieces = data.sort((a, b) => {
                    if (a.level_id === b.level_id) {
                        return a.order - b.order; // If level_id is the same, sort by order
                    }
                    return a.level_id - b.level_id; // Otherwise, sort by level_id
                });
                setPiecesInReserve(sortedPieces);
            });

        fetch('/api/levels')
            .then(response => response.json())
            .then(data => setLevels(data));

        fetch(route('piecesInfo'))
            .then(response => response.json())
            .then(data => setPiecesInfo(data));
    }, []);

    const generateFileName = () => {
        const { composer, title, no_mvt, mvt } = data;
        const replaceInvalidChars = (str) => str.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '_').replace(/[^\w_]/g, '');

        const extractFamilyName = (str) => str.split(',')[0] || '0';

        const fileNameParts = [
            replaceInvalidChars(extractFamilyName(composer || '0')),
            replaceInvalidChars(title || '0'),
            replaceInvalidChars(no_mvt || '0'),
            replaceInvalidChars(mvt || '0'),
        ];

        return fileNameParts.join('_') + '.mp3';
    };

    useEffect(() => {
        setData('fileName', generateFileName());
    }, [data.composer, data.title, data.no_mvt, data.mvt]);

    const handleFormSubmit = (e) => {
        updateLastActionTime();
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        axios.post('/new-piece', formData)
            .then(response => {
                setSuccessMessage(response.data.message);
                setErrorMessage('');
                reset();
            })
            .catch(error => {
                setSuccessMessage('');
                setErrorMessage(error.response.data.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleMove = (pieceId) => {
        updateLastActionTime();
        axios.post(`/pieces/${pieceId}/move-to-pieces`)
            .then(response => {
                setPiecesInReserve(prevPiecesInReserve => prevPiecesInReserve.filter(piece => piece.id !== pieceId));
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setSuccessMessage('');
                setErrorMessage(error.response.data.message);
            });
    };

    const handleDelete = (pieceId) => {
        updateLastActionTime();

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette pièce?`)) {
            return;
        }

        axios.post(`/delete-piece/${pieceId}`)
            .then(response => {
                setPiecesInReserve(prevPiecesInReserve => prevPiecesInReserve.filter(piece => piece.id !== pieceId));
                setSuccessMessage(response.data.message);
                setErrorMessage('');
            })
            .catch(error => {
                setSuccessMessage('');
                setErrorMessage(error.response.data.message);
            });
    };

    return (
        <div className="w-full">
            {option === '' && (
                <div className="flex flex-col w-full items-center">
                    <h1 className='text-4xl hover:cursor-default font-bold mb-6'>Ajouter une pièce</h1>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16 flex items-center justify-center"
                        onClick={() => setOption('new')}
                    >
                        Ajouter une nouvelle pièce
                    </button>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 w-96 h-16 flex items-center justify-center"
                        onClick={() => setOption('existing')}
                    >
                        Ajouter une pièce existante en réserve
                    </button>
                </div>
            )}
            {option === 'new' && (
                <div className="flex flex-col w-full items-center justify-center">
                    <h1 className='text-4xl hover:cursor-default font-bold mb-6'>Ajouter une nouvelle pièce</h1>
                    <MessageDisplay successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                    {loading ? (
                        <div className="flex justify-center items-center w-full">
                            <div className="loader"></div>
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="flex flex-col w-full max-w-7xl mt-4" encType="multipart/form-data">
                            <div className="flex flex-col mb-4 w-full">
                                <label htmlFor="level" className="text-lg font-bold mb-2">Niveau</label>
                                <select
                                    id="level"
                                    className="new-piece-input"
                                    value={data.level}
                                    onChange={(e) => setData('level', e.target.value)}
                                >
                                    <option value="">Choisir un niveau</option>
                                    {levels.map(level => (
                                        <option key={level.id} value={level.id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* FilterableSelect for each field */}
                            <FilterableSelect
                                label="Période"
                                value={data.period}
                                onChange={(value) => setData('period', value)}
                                options={piecesInfo.map(piece => piece.period).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Genre"
                                value={data.genre}
                                onChange={(value) => setData('genre', value)}
                                options={piecesInfo.map(piece => piece.genre).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Compositeur"
                                value={data.composer}
                                onChange={(value) => setData('composer', value)}
                                options={piecesInfo.map(piece => piece.composer).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Titre"
                                value={data.title}
                                onChange={(value) => setData('title', value)}
                                options={piecesInfo.map(piece => piece.title).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Elément"
                                value={data.element}
                                onChange={(value) => setData('element', value)}
                                options={piecesInfo.map(piece => piece.element).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="No. Mouvement"
                                value={data.no_mvt}
                                onChange={(value) => setData('no_mvt', value)}
                                options={piecesInfo.map(piece => piece.no_mvt).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Mouvement ou Partie"
                                value={data.mvt}
                                onChange={(value) => setData('mvt', value)}
                                options={piecesInfo.map(piece => piece.mvt).filter(Boolean)}
                            />
                            <FilterableSelect
                                label="Forme"
                                value={data.form}
                                onChange={(value) => setData('form', value)}
                                options={piecesInfo.map(piece => piece.form).filter(Boolean)}
                            />

                            <div className="flex flex-col mb-4 w-full">
                                <label htmlFor="fileName" className="text-lg font-bold mb-2">Nom du fichier audio</label>
                                <span className="text-sm text-red-600">C'est important de suivre la convention de nom suivante:
                                    <span className="text-sm text-gray-500 italic">compositeur_titre_no_mvt_mvt.mp3</span>
                                </span>
                                <ul className="list-disc list-inside text-sm text-gray-500">
                                    <li>Si un des paramètres ne s'applique pas, remplacer par 0</li>
                                    <li>Si un des paramètres contient plus qu'un mot, remplacer les caractères blancs par des underscores (_)</li>
                                    <li>Toutes les lettres doivent être en minusculles</li>
                                    <li>Utiliser seulement le nom de famille du compositeur, à l'exeption des surnoms&nbsp;
                                        <span className="italic">(béatrice_de_die ou vivaldi)</span>
                                    </li>
                                    <li>Ne pas utiliser des accents</li>
                                    <li>Remplacer toute apostrophe par un underscore (_)
                                        <span className="italic">(l_hiver)</span>
                                    </li>
                                    <li>Chaque nom de fichier doit être unique</li>
                                    <li>Le nom doit obligatoirement finir par .mp3 et le fichier doit également avoir cette
                                        extension.&nbsp;
                                        <span className="text-red-500 italic">Attention: les autres formats de fichiers audio
                                            ne sont pas acceptés par le système (ex. .wav, .m4a, etc.)
                                        </span>
                                    </li>
                                    <li>Si le compositeur vient d'une famille de compositeurs et les autres sont également présents dans le logiciel,
                                        ajouter le nom ainsi que le prénom, séparés par un underscore (_). Ex: mendelssohn_felix, mendelssohn_fanny.
                                    </li>
                                    <li>Si plusieurs pieces ont le même nom de fichier, ajouter un underscore avec un numéro à la fin du nom (_1, _2, etc.)</li>
                                </ul>
                                <input
                                    id="fileName"
                                    type="text"
                                    className="new-piece-input"
                                    value={data.fileName}
                                    onChange={(e) => setData('fileName', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col mb-4 w-full">
                                <label htmlFor="audioFile" className="text-lg font-bold mb-2">Fichier audio</label>
                                <input
                                    id="audioFile"
                                    type="file"
                                    className="new-piece-input"
                                    onChange={(e) => setData('audioFile', e.target.files.length ? e.target.files[0] : null)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 w-full"
                                disabled={processing}
                            >
                                Ajouter la pièce
                            </button>
                        </form>
                    )}
                </div>
            )}
            {option === 'existing' && (
                <div className="flex flex-col w-full items-center">
                    <h1 className='text-4xl hover:cursor-default font-bold mb-6'>Ajouter une pièce existante en réserve</h1>

                    <MessageDisplay
                        successMessage={successMessage}
                        errorMessage={errorMessage}
                        setSuccessMessage={setSuccessMessage}
                        setErrorMessage={setErrorMessage}
                    />

                    <table className="min-w-full bg-white mt-4">
                        <thead>
                        <tr>
                            <th className="py-2">Cours</th>
                            <th className="py-2">Période</th>
                            <th className="py-2">Genre</th>
                            <th className="py-2">Compositeur</th>
                            <th className="py-2">Titre</th>
                            <th className="py-2">Élément</th>
                            <th className="py-2">No. Mvt</th>
                            <th className="py-2">Nom Mvt / Partie</th>
                            <th className="py-2">Forme</th>
                            <th className="py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {piecesInReserve.map(piece => (
                            <tr key={piece.id} className="text-center cursor-pointer">
                                <td className="border px-4 py-2">{piece.level.name}</td>
                                <td className="border px-4 py-2">{piece.period}</td>
                                <td className="border px-4 py-2">{piece.genre}</td>
                                <td className="border px-4 py-2">{piece.composer}</td>
                                <td className="border px-4 py-2">{piece.title}</td>
                                <td className="border px-4 py-2">{piece.element}</td>
                                <td className="border px-4 py-2">{piece.no_mvt}</td>
                                <td className="border px-4 py-2">{piece.mvt}</td>
                                <td className="border px-4 py-2">{piece.form}</td>
                                <td className="border px-4 py-2 flex justify-around items-center">
                                    <img
                                        src={addIcon}
                                        alt="add"
                                        className="w-6 h-6 cursor-pointer mx-2"
                                        onClick={() => handleMove(piece.id)}
                                    />
                                    <img
                                        src={deleteIcon}
                                        alt="delete"
                                        className="w-6 h-6 cursor-pointer mx-2"
                                        onClick={() => handleDelete(piece.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
