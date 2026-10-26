import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SectionCard, Toast, buttonPrimary, control, muted, textarea } from '@/Components/AdminUi';

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
        <SectionCard
            id="edit-module-title"
            title="Modifier un Module"
            description="Sélectionnez un module existant et mettez à jour ses informations."
            className={className}
        >
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                <AdminField id="edit-module-level" label="Niveau" error={errors.level_id}>
                    <select
                        id="edit-module-level"
                        className={`${control} w-full`}
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
                </AdminField>

                <AdminField id="edit-module-module" label="Module">
                    <select
                        id="edit-module-module"
                        className={`${control} w-full`}
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
                </AdminField>

                {selectedModule ? (
                    <>
                        <AdminField id="edit-module-title-input" label="Titre du module" error={errors.title}>
                            <AdminInput
                                id="edit-module-title-input"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                required
                            />
                        </AdminField>

                        <AdminField id="edit-module-description" label="Description (optionnelle)" error={errors.description}>
                            <textarea
                                id="edit-module-description"
                                className={textarea}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="3"
                            />
                        </AdminField>

                        <div className="mt-auto flex items-center gap-4 pt-1">
                            <button type="submit" disabled={loading} className={buttonPrimary}>
                                {loading ? 'Mise à jour en cours...' : 'Mettre à jour le module'}
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={`rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm dark:border-gray-600 ${muted}`}>
                        Choisissez un niveau puis un module pour le modifier.
                    </p>
                )}
            </form>

            <Toast successMessage={successMessage} setSuccessMessage={setSuccessMessage} errorMessage="" setErrorMessage={() => {}}/>
        </SectionCard>
    );
}
