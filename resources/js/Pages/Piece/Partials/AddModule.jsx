import { useState, useEffect } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function AddModule({ className = '', courseName }) {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
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
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        // Submit the form data to create a new module
        axios.post(route('admin.add-module'), data)
            .then(response => {
                setSuccessMessage(response.data.message);
                reset();
            })
            .catch(error => {
                console.error('Error creating module:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter un Module</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Créez un nouveau module pour organiser vos pièces dans le cours de Littérature Musicale.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="level_id" value="Niveau" />
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
                    <InputLabel htmlFor="title" value="Titre du module" />
                    <TextInput
                        id="title"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="description" value="Description (optionnelle)" />
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
                    <PrimaryButton disabled={processing || loading}>
                        {loading ? 'Création en cours...' : 'Créer le module'}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
