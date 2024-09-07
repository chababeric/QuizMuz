import { Link, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MenuFMA({ auth }) {
    return (
        <main className="main-app pb-5">
            <div className="background-container"></div>
            <Head title="Cours - QuizMuz"/>
            <h1 className="text-4xl font-bold text-white hover:cursor-default mb-4">Bienvenue en FMA, {auth.user.username}!</h1>
        </main>
    );
}
