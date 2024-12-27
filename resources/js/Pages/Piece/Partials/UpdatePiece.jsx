import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/inertia-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

export default function UpdatePiece({ className = '', piecesList, coursesList }) {
    const [levelsList, setLevelsList] = useState([]);

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Modifier une pièce</h2>
            </header>

        </section>
    );
}
