
import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary, control, muted } from '@/Components/AdminUi';
import React, { useState, useEffect, useMemo } from "react";
import FilterableSelect from "@/Components/FilterableSelect.jsx";

export default function AddNewPiece({ className = '', piecesList, getAllPieces, courseName }) {
    const [levelsList, setLevelsList] = useState([]);
    const [modules, setModules] = useState([]);
    const [isLitMusCourse, setIsLitMusCourse] = useState(false);

    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({
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
        module_id: '',
        courseName: courseName,
    });

    // Define field configurations based on course
    const fieldConfigs = useMemo(() => {
        const isHistoireDeLaMusique = courseName === 'Histoire de la Musique';

        if (isHistoireDeLaMusique) {
            return [
                { key: 'title', label: 'Titre', dbField: 'title' },
                { key: 'composer', label: 'Compositeur', dbField: 'composer' },
                { key: 'element', label: 'Répertoire', dbField: 'element' },
                { key: 'period', label: 'Date (siècle)', dbField: 'period' },
                { key: 'genre', label: 'Genre', dbField: 'genre' },
                { key: 'form', label: 'Option', dbField: 'form' }
            ];
        } else {
            // Littérature Musicale
            return [
                { key: 'period', label: 'Période', dbField: 'period' },
                { key: 'genre', label: 'Genre', dbField: 'genre' },
                { key: 'composer', label: 'Compositeur', dbField: 'composer' },
                { key: 'title', label: 'Titre', dbField: 'title' },
                { key: 'element', label: 'Élément', dbField: 'element' },
                { key: 'no_mvt', label: 'No. mouvement', dbField: 'no_mvt' },
                { key: 'mvt', label: 'Mouvement / Partie', dbField: 'mvt' },
                { key: 'form', label: 'Forme', dbField: 'form' }
            ];
        }
    }, [courseName]);

    useEffect(() => {
        axios.get(route('levelsFromCourse'), {
            params: {
                course_name: courseName,
            }
        }).then(response => {
            setLevelsList(response.data);
        }).catch(error => {
            console.log(error);
        });

        setIsLitMusCourse(courseName === 'Littérature Musicale');
    }, []);

    useEffect(() => {
        if (data.level && isLitMusCourse) {
            // Fetch modules for this level
            axios.get(`/api/modules/level/${data.level}`)
                .then(response => {
                    setModules(response.data);
                })
                .catch(error => {
                    console.error('Error fetching modules:', error);
                });
        } else {
            setModules([]);
            setData('module_id', '');
        }
    }, [data.level, isLitMusCourse]);

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

    const submitNewPiece = (e) => {
        e.preventDefault();

        post(route('admin.new-piece'), {
            preserveScroll: true,
            onSuccess: () => {
                getAllPieces();
            },
            onFinish: () => {
                reset();
            },
        });
    }

    return (
        <SectionCard id="new-piece-title" title="Ajouter une nouvelle pièce" description={courseName} className={className}>
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={submitNewPiece} className="flex flex-col gap-5 p-5">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                    <AdminField id="new-piece-level" label="Niveau" error={errors.level}>
                        <select
                            id="new-piece-level"
                            className={`${control} w-full`}
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            required
                        >
                            <option value="">Choisir un niveau</option>
                            {levelsList.map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </AdminField>

                    {isLitMusCourse && data.level && (
                        <AdminField id="new-piece-module" label="Module (optionnel)" error={errors.module_id}>
                            <select
                                id="new-piece-module"
                                className={`${control} w-full`}
                                value={data.module_id}
                                onChange={(e) => setData('module_id', e.target.value)}
                            >
                                <option value="">Aucun module</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.title}</option>
                                ))}
                            </select>
                        </AdminField>
                    )}

                    {/* Render fields in the order specified by fieldConfigs */}
                    {fieldConfigs.map((field) => (
                        <AdminField key={field.key} id={`new-piece-${field.key}`} label={field.label} error={errors[field.key]}>
                            <FilterableSelect
                                id={`new-piece-${field.key}`}
                                value={data[field.key]}
                                onChange={(value) => setData(field.key, value)}
                                options={piecesList.map(piece => piece[field.dbField]).filter(Boolean)}
                            />
                        </AdminField>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 border-t border-gray-200 pt-5 md:grid-cols-2 dark:border-gray-700">
                    <div className="flex flex-col gap-3">
                        <AdminField id="new-piece-file-name" label="Nom du fichier audio" error={errors.fileName}>
                            <AdminInput
                                id="new-piece-file-name"
                                className="font-mono"
                                value={data.fileName}
                                onChange={(e) => setData('fileName', e.target.value)}
                            />
                        </AdminField>

                        <details className="group rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                            <summary className="cursor-pointer list-none px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                                C'est important de suivre la convention de nom suivante:{' '}
                                <span className="break-all font-mono italic">compositeur_titre_no_mvt_mvt.mp3</span>
                                <span className="mt-1 block text-xs font-normal underline group-open:hidden">Voir les règles</span>
                                <span className="mt-1 hidden text-xs font-normal underline group-open:block">Masquer les règles</span>
                            </summary>
                            <ul className="list-disc space-y-1 px-4 pb-4 pl-8 text-gray-700 dark:text-gray-300">
                                <li>Si un des paramètres ne s'applique pas, remplacer par 0</li>
                                <li>Si un des paramètres contient plus qu'un mot, remplacer les caractères blancs par des
                                    underscores (_)
                                </li>
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
                                    <span className="font-medium italic text-red-600 dark:text-red-400">Attention: les autres formats de fichiers audio
                                        ne sont pas acceptés par le système (ex. .wav, .m4a, etc.)
                                    </span>
                                </li>
                                <li>Si le compositeur vient d'une famille de compositeurs et les autres sont également présents
                                    dans le logiciel,
                                    ajouter le nom ainsi que le prénom, séparés par un underscore (_). Ex: mendelssohn_felix,
                                    mendelssohn_fanny.
                                </li>
                                <li>Si plusieurs pieces ont le même nom de fichier, ajouter un underscore avec un numéro à la
                                    fin du nom (_1, _2, etc.)
                                </li>
                            </ul>
                        </details>
                    </div>

                    <AdminField id="new-piece-audio" label="Fichier audio" hint="Format .mp3 uniquement" error={errors.audioFile}>
                        <input
                            id="new-piece-audio"
                            type="file"
                            className={`block w-full text-sm ${muted} file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600`}
                            onChange={(e) => setData('audioFile', e.target.files.length ? e.target.files[0] : null)}
                        />
                    </AdminField>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className={buttonPrimary}>Ajouter la pièce</button>
                    <SavedNote show={recentlySuccessful}>Pièce ajoutée!</SavedNote>
                </div>
            </form>
        </SectionCard>
    );
}
