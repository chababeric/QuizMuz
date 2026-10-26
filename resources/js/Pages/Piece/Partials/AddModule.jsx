import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary, control, textarea } from '@/Components/AdminUi';

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
        <SectionCard
            id="add-module-title"
            title="Ajouter un Module"
            description={`Créez un nouveau module pour organiser vos ${contentType.plural} dans le cours de ${courseName}.`}
            className={className}
        >
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                <AdminField id="add-module-level" label="Niveau" error={errors.level_id}>
                    <select
                        id="add-module-level"
                        className={`${control} w-full`}
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
                </AdminField>

                <AdminField id="add-module-title-input" label="Titre du module" error={errors.title}>
                    <AdminInput
                        id="add-module-title-input"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        required
                    />
                </AdminField>

                <AdminField id="add-module-description" label="Description (optionnelle)" error={errors.description}>
                    <textarea
                        id="add-module-description"
                        className={textarea}
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        rows="3"
                    />
                </AdminField>

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className={buttonPrimary}>
                        {processing ? 'Création en cours...' : 'Créer le module'}
                    </button>
                    <SavedNote show={recentlySuccessful}>Module créé avec succès.</SavedNote>
                </div>
            </form>
        </SectionCard>
    );
}
