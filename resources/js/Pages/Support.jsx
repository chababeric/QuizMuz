import React from "react";
import { Link, Head } from '@inertiajs/react';

export default function Support() {
    return (
        <div className="main-app">
            <div className="background-container"></div>
            <Head title="Support - QuizMuz"/>
            <h1 className="text-6xl font-bold text-white hover:cursor-default mb-4">Support</h1>

            <div
                className="block mt-4 bg-black/50 p-4 rounded-lg w-11/12 max-h-96 overflow-y-auto text-center hide-scrollbar">
                <span className="text-white text-3xl mb-4 block hover:cursor-default">
                    Besoin d'aide?
                </span>
                <p className="text-white text-lg">
                    Pour toute question, problème ou suggestion, veuillez&nbsp;
                    <a href="mailto:chababeric@quizmuz.com" className="text-rose-600 hover:underline">
                        me contacter.
                    </a>
                </p>

                <p className="text-white text-lg mt-3">
                    Si le lien ci-dessus ne fonctionne pas, vous pouvez copier l'adresse e-mail suivante:&nbsp;
                    <span className="text-rose-600">
                        chababeric@quizmuz.com
                    </span>
                </p>

                <p className="text-white text-lg mt-8">
                    Vous pouvez également me contacter par Mio ou n'importe quel réseau social.
                </p>
            </div>

            <Link
                href={route('welcome')}
                className="inline-flex items-center justify-center text-white py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-900 mr-4 border border-white mt-8"
            >
                Retour à l'accueil
            </Link>
        </div>
    )
}
