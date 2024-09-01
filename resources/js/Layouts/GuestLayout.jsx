
import { Link } from '@inertiajs/react';
import React from "react";

export default function Guest({ children }) {
    return (
        <div className="main-app">
            <div className="background-container"></div>
            <div>
                <Link href="/">
                    <h1 className="text-6xl font-bold text-white hover:cursor-pointer">QuizMuz</h1>
                </Link>
            </div>
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-black/80 shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
