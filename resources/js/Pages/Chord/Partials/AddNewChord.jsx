import { useForm } from '@inertiajs/react';
import { AdminField, AdminInput, SavedNote, SectionCard, buttonPrimary, control, muted } from '@/Components/AdminUi';
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddNewChord({ className = '', levelsList, getAllChords }) {
    const [modules, setModules] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');

    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({
        level: '',
        module: '',
        chord_name: '',
        audioFile: null,
    });

    // Fetch modules when level changes
    useEffect(() => {
        if (selectedLevel) {
            axios.get(`/api/modules/level/${selectedLevel}`)
                .then(response => {
                    setModules(response.data);
                })
                .catch(error => {
                    console.error('Error fetching modules:', error);
                    setModules([]);
                });
        } else {
            setModules([]);
        }
    }, [selectedLevel]);

    const handleLevelChange = (e) => {
        const levelValue = e.target.value;
        setData('level', levelValue);
        setSelectedLevel(levelValue);
        // Reset module selection when level changes
        setData('module', '');
    };

    const submitNewChord = (e) => {
        e.preventDefault();

        post(route('admin.new-chord'), {
            preserveScroll: true,
            onSuccess: () => {
                getAllChords();
            },
            onFinish: () => {
                reset();
                setSelectedLevel('');
                setModules([]);
                setData({
                        level: '',
                        module: '',
                        chord_name: '',
                        audioFile: null,
                });
            }
        });
    }

    return (
        <SectionCard id="new-chord-title" title="Ajouter une nouvelle formule harmonique" description="Formation Musicale et Auditive" className={className}>
            {errors.error && (
                <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {errors.error}
                </p>
            )}

            <form onSubmit={submitNewChord} className="flex flex-col gap-5 p-5">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                    <AdminField id="new-chord-level" label="Niveau" error={errors.level}>
                        <select
                            id="new-chord-level"
                            className={`${control} w-full`}
                            value={data.level}
                            onChange={handleLevelChange}
                            required
                        >
                            <option value="">Choisir un niveau</option>
                            {levelsList.map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </AdminField>

                    <AdminField
                        id="new-chord-module"
                        label="Module (optionnel)"
                        hint={selectedLevel && modules.length === 0 ? 'Aucun module disponible pour ce niveau' : null}
                        error={errors.module}
                    >
                        <select
                            id="new-chord-module"
                            className={`${control} w-full`}
                            value={data.module}
                            onChange={(e) => setData('module', e.target.value)}
                            disabled={!selectedLevel || modules.length === 0}
                        >
                            <option value="">Aucun module</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id}>{module.title}</option>
                            ))}
                        </select>
                    </AdminField>

                    <AdminField id="new-chord-name" label="Accord / Formule" error={errors.chord_name}>
                        <AdminInput
                            id="new-chord-name"
                            value={data.chord_name}
                            onChange={(e) => setData('chord_name', e.target.value)}
                            required
                        />
                    </AdminField>

                    <AdminField id="new-chord-audio" label="Fichier audio" error={errors.audioFile}>
                        <input
                            id="new-chord-audio"
                            type="file"
                            className={`block w-full text-sm ${muted} file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600`}
                            onChange={(e) => setData('audioFile', e.target.files.length ? e.target.files[0] : null)}
                        />
                    </AdminField>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className={buttonPrimary}>Ajouter l'accord</button>
                    <SavedNote show={recentlySuccessful}>Accord ajouté!</SavedNote>
                </div>
            </form>
        </SectionCard>
    );
}
