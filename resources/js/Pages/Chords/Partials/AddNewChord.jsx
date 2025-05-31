import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import React, { useState, useEffect } from "react";

export default function AddNewChord({ className = '', levelsList, updateLastActionTime, getAllChords }) {
    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({
        level: '',
        chord_name: '',
        audioFile: null,
    });

    const submitNewChord = (e) => {
        e.preventDefault();
        updateLastActionTime();

        post(route('admin.new-chord'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                getAllChords();
            },
            onError: (errors) => {
                if (errors.level) {
                    reset('course', 'level', 'chord_name', 'file_name', 'audioFile');
                }
            },
        });
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter une nouvelle formule hormonique</h2>
            </header>

            <form onSubmit={submitNewChord} className="mt-6 space-y-6">
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
                    <InputLabel htmlFor="chord_name" value="Nom de l'accord" className="dark:text-white"/>
                    <input
                        id="chord_name"
                        type="text"
                        className="mt-1 block w-full rounded-md dark:bg-gray-700 dark:text-white"
                        value={data.chord_name}
                        onChange={(e) => setData('chord_name', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.chord_name}/>
                </div>

                <div className="flex flex-col mb-4 w-full">
                    <InputLabel htmlFor="audioFile" value="Fichier audio" className="dark:text-white"/>
                    <input
                        id="audioFile"
                        type="file"
                        className="new-chord-input dark:bg-gray-700 dark:text-white"
                        onChange={(e) => setData('audioFile', e.target.files.length ? e.target.files[0] : null)}
                    />
                    <InputError className="mt-2" message={errors.audioFile}/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton type="submit" disabled={processing} className="dark:bg-blue-500 dark:hover:bg-blue-700">Ajouter l'accord</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-green-500 text-sm">Accord ajouté!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
