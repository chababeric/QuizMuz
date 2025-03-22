import { Link, Head } from '@inertiajs/react';
import React from "react";

export default function Course({ auth, courses }) {
    return (
        <main className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Cours - QuizMuz"/>
            <h1 className="text-4xl font-bold text-white hover:cursor-default mb-4">Bienvenue, {auth.user.username}!</h1>

            <h3 className="text-3xl text-white text-center hover:cursor-default mb-6 mt-10 font-bold">
                Choisissez un cours
            </h3>
            <div className="flex flex-wrap justify-center gap-4 mb-6 w-full flex-col items-center">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={route('mainmenu', {courseId: course.id})}
                        className="game-mode"
                    >
                        {course.name}
                    </Link>
                ))}

                {/*{courses.map((course) => {*/}
                {/*    // If the course name is "FMA", don't display it*/}
                {/*    if (course.name === "Formation Musicale et Auditive") {*/}
                {/*        return null;*/}
                {/*    }*/}

                {/*    // Return the Link component with conditional logic for "Histoire de la musique"*/}
                {/*    return (*/}
                {/*        <Link*/}
                {/*            key={course.id}*/}
                {/*            href={course.name === "Histoire de la musique" ? undefined : route('mainmenu', { courseId: course.id })}*/}
                {/*            className={`game-mode ${course.name === "Histoire de la Musique" ? 'disabled-link' : ''}`}*/}
                {/*            style={{ pointerEvents: course.name === "Histoire de la Musique" ? 'none' : 'auto' }}*/}
                {/*        >*/}
                {/*            {course.name} {course.name === "Histoire de la Musique" && <span className="text-red-600">(Bientôt disponible)</span>}*/}
                {/*        </Link>*/}
                {/*    );*/}
                {/*})}*/}
            </div>

            <div className="mt-4 text-center">
                <Link
                    href={route('welcome')}
                    className="inline-flex items-center justify-center text-white py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-900 mr-4 border border-white"
                >
                    Retour à l'accueil
                </Link>
            </div>
        </main>
);
}
