import { useState, useEffect } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function UpdateModule({ className = '', coursesList, updateLastActionTime }) {
    const [modules, setModules] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, reset, errors } = useForm({
        id: '',
        level_id: '',
        title: '',
        description: '',
        order: '',
    });

    useEffect(() => {
        // Get levels for the selected course
        if (selectedCourse) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: selectedCourse,
                }
            })
                .then(response => {
                    setLevels(response.data);
                })
                .catch(error => {
                    console.error('Error fetching levels:', error);
                });
        } else {
            setLevels([]);
            setModules([]);
        }
    }, [selectedCourse]);

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
                    order: module.order,
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

    const handleCourseChange = (e) => {
        setSelectedCourse(e.target.value);
        setData('level_id', '');
        setSelectedModule('');
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

        // First, update the last action time
        updateLastActionTime();

        // Submit the form data to update the module
        axios.patch(route('admin.update-module'), data)
            .then(response => {
                setSuccessMessage(response.data.message);
                fetchModules(data.level_id); // Refresh the modules list
            })
            .catch(error => {
                console.error('Error updating module:', error);
            })
            .finally(() => {
                setLoading(false);
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="course" value="Cours" />
                    <select
                        id="course"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        onChange={handleCourseChange}
                        value={selectedCourse}
                        required
                    >
                        <option value="">Sélectionnez un cours</option>
                        {coursesList.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <InputLabel htmlFor="level_id" value="Niveau" />
                    <select
                        id="level_id"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        onChange={handleLevelChange}
                        value={data.level_id}
                        disabled={!selectedCourse}
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

                        <div>
                            <InputLabel htmlFor="order" value="Ordre" />
                            <TextInput
                                id="order"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.order}
                                onChange={e => setData('order', e.target.value)}
                                min="1"
                                required
                            />
                            <InputError message={errors.order} className="mt-2" />
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
