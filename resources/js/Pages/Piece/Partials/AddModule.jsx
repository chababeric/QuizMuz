import { useState, useEffect } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function AddModule({ className = '', courseName }) {
    const [levels, setLevels] = useState([]);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        level_id: '',
        title: '',
        description: '',
    });

    useEffect(() => {
        axios.get(route('levelsFromCourse'), {
            params: {
                course_name: courseName,
            }
        })
            .then(response => {
                setLevels(response.data);
            })
            .catch(error => {
                console.error('Error fetching levels:', error);
            });
    }, [courseName]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('admin.add-module'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onFinish: () => {
                setData({
                    level_id: '',
                    title: '',
                    description: '',
                });
            }
        });
    };

    // Get the appropriate content type based on course
    const getContentType = () => {
        switch (courseName) {
            case "Formation Musicale et Auditive":
                return { single: "formule/accord", plural: "formules et accords" };
            case "Littérature Musicale":
                return { single: "pièce", plural: "pièces" };
            default:
                return { single: "élément", plural: "éléments" };
        }
    };

    const contentType = getContentType();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter un Module</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Créez un nouveau module pour organiser vos {contentType.plural} dans le cours de {courseName}.
                </p>
            </header>

            {errors.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="level_id" value="Niveau" className="dark:text-white"/>
                    <select
                        id="level_id"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        onChange={e => setData('level_id', e.target.value)}
                        value={data.level_id}
                        required
                    >
                        <option value="">Sélectionnez un niveau</option>
                        {levels.map(level => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.level_id} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="title" value="Titre du module" className="dark:text-white"/>
                    <TextInput
                        id="title"
                        type="text"
                        className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="description" value="Description (optionnelle)" className="dark:text-white"/>
                    <textarea
                        id="description"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        rows="3"
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Création en cours...' : 'Créer le module'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-500">Module créé avec succès.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
