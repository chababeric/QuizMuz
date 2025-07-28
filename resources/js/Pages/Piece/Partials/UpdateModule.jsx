import { useState, useEffect } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function UpdateModule({ className = '', courseName }) {
    const [modules, setModules] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, patch, reset, errors } = useForm({
        id: '',
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

    useEffect(() => {
        // Get modules for selected level
        if (data.level_id) {
            fetchModules(data.level_id);
        } else {
            setModules([]);
        }
    }, [data.level_id]);

    useEffect(() => {
        // Fill form with selected module data
        if (selectedModule) {
            const module = modules.find(m => m.id === parseInt(selectedModule));
            if (module) {
                setData({
                    id: module.id,
                    level_id: module.level_id,
                    title: module.title,
                    description: module.description || '',
                });
            }
        }
    }, [selectedModule]);

    const fetchModules = (levelId) => {
        axios.get(`/api/modules/level/${levelId}`)
            .then(response => {
                setModules(response.data);
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
            });
    };

    const handleLevelChange = (e) => {
        setData('level_id', e.target.value);
        setSelectedModule('');
    };

    const handleModuleChange = (e) => {
        setSelectedModule(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        // Use Inertia's patch method instead of axios
        patch(route('admin.update-module'), {
            preserveScroll: true,
            onSuccess: (response) => {
                setSuccessMessage(response.props.flash.message || 'Module mis à jour avec succès.');
                fetchModules(data.level_id);
            },
            onFinish: () => {
                setLoading(false);
                reset();
                setSelectedModule('');
                setData({
                    id: '',
                    level_id: '',
                    title: '',
                    description: '',
                });
            }
        });
    };


    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Modifier un Module</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Sélectionnez un module existant et mettez à jour ses informations.
                </p>
            </header>

            {errors.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.error}
                </div>
            )}

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
                        onChange={handleLevelChange}
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
                    <InputLabel htmlFor="module" value="Module" />
                    <select
                        id="module"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        onChange={handleModuleChange}
                        value={selectedModule}
                        disabled={!data.level_id || modules.length === 0}
                        required
                    >
                        <option value="">Sélectionnez un module</option>
                        {modules.map(module => (
                            <option key={module.id} value={module.id}>
                                {module.title}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedModule && (
                    <>
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
                            <PrimaryButton disabled={loading}>
                                {loading ? 'Mise à jour en cours...' : 'Mettre à jour le module'}
                            </PrimaryButton>
                        </div>
                    </>
                )}
            </form>
        </section>
    );
}
