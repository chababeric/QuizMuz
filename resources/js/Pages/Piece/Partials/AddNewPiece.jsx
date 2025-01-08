import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import React, { useState, useEffect } from "react";
import FilterableSelect from "@/Components/FilterableSelect.jsx";

export default function AddNewPiece({ className = '', piecesList, coursesList, updateLastActionTime, getAllPieces }) {
    // const user = usePage().props.auth.user;
    const [levelsList, setLevelsList] = useState([]);

    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({
        course: '',
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
        if (data.course) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: data.course,
                }
            }).then(response => {
                setLevelsList(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsList([]);
        }
    }, [data.course]);

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
        updateLastActionTime();

        post(route('admin.new-piece'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                getAllPieces();
            },
            onError: (errors) => {
                if (errors.level) {
                    reset('course', 'level', 'period', 'genre', 'composer', 'title', 'element', 'no_mvt', 'mvt', 'form', 'fileName', 'audioFile');
                }
            },
        });
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter une nouvelle pièce</h2>
            </header>

            <form onSubmit={submitNewPiece} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="course" value="Cours" className="dark:text-white"/>
                    <select
                        id="course"
                        className="mt-1 block w-full rounded-md dark:bg-gray-700 dark:text-white"
                        value={data.course}
                        onChange={(e) => setData('course', e.target.value)}
                        required
                    >
                        <option value="">Choisir un cours</option>
                        {coursesList.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.course}/>
                </div>

                <div>
                    <InputLabel htmlFor="level" value="Niveau" className="dark:text-white"/>
                    <select
                        id="level"
                        className="mt-1 block w-full rounded-md dark:bg-gray-700 dark:text-white"
                        value={data.level}
                        onChange={(e) => setData('level', e.target.value)}
                        required
                    >
                        <option value="">Choisir un niveau</option>
                        {levelsList.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.level}/>
                </div>

                <div>
                    <InputLabel htmlFor="period" value="Période" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.period}
                        onChange={(value) => setData('period', value)}
                        options={piecesList.map(piece => piece.period).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.period}/>
                </div>

                <div>
                    <InputLabel htmlFor="genre" value="Genre" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.genre}
                        onChange={(value) => setData('genre', value)}
                        options={piecesList.map(piece => piece.genre).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.genre}/>
                </div>

                <div>
                    <InputLabel htmlFor="composer" value="Compositeur" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.composer}
                        onChange={(value) => setData('composer', value)}
                        options={piecesList.map(piece => piece.composer).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.composer}/>
                </div>

                <div>
                    <InputLabel htmlFor="title" value="Titre" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.title}
                        onChange={(value) => setData('title', value)}
                        options={piecesList.map(piece => piece.title).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.title}/>
                </div>

                <div>
                    <InputLabel htmlFor="element" value="Élément" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.element}
                        onChange={(value) => setData('element', value)}
                        options={piecesList.map(piece => piece.element).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.element}/>
                </div>

                <div>
                    <InputLabel htmlFor="no_mvt" value="No. mouvement" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.no_mvt}
                        onChange={(value) => setData('no_mvt', value)}
                        options={piecesList.map(piece => piece.no_mvt).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.no_mvt}/>
                </div>

                <div>
                    <InputLabel htmlFor="mvt" value="Mouvement / Partie" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.mvt}
                        onChange={(value) => setData('mvt', value)}
                        options={piecesList.map(piece => piece.mvt).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.mvt}/>
                </div>

                <div>
                    <InputLabel htmlFor="form" value="Forme" className="dark:text-white"/>
                    <FilterableSelect
                        value={data.form}
                        onChange={(value) => setData('form', value)}
                        options={piecesList.map(piece => piece.form).filter(Boolean)}
                    />
                    <InputError className="mt-2" message={errors.form}/>
                </div>

                <div className="flex flex-col mb-4 w-full">
                    <InputLabel htmlFor="fileName" value="Nom du fichier audio" className="dark:text-white"/>
                    <span className="text-sm text-red-600">C'est important de suivre la convention de nom suivante:
                    <span
                        className="text-sm text-gray-500 italic dark:text-white">compositeur_titre_no_mvt_mvt.mp3</span>
                    </span>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-white">
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
                            <span className="text-red-500 italic">Attention: les autres formats de fichiers audio
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
                    <input
                        id="fileName"
                        type="text"
                        className="new-piece-input dark:bg-gray-700 dark:text-white"
                        value={data.fileName}
                        onChange={(e) => setData('fileName', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.fileName}/>
                </div>

                <div className="flex flex-col mb-4 w-full">
                    <InputLabel htmlFor="audioFile" value="Fichier audio" className="dark:text-white"/>
                    <input
                        id="audioFile"
                        type="file"
                        className="new-piece-input dark:bg-gray-700 dark:text-white"
                        onChange={(e) => setData('audioFile', e.target.files.length ? e.target.files[0] : null)}
                    />
                    <InputError className="mt-2" message={errors.audioFile}/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton type="submit" disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Ajouter la pièce</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-green-500 text-sm">Pièce ajoutée!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
