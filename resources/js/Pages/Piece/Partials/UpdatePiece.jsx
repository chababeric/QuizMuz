import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/inertia-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import InputLabel from "@/Components/InputLabel.jsx";
import settingsIcon from '../../../../icons/settings-black.svg';
import axios from "axios";

export default function UpdatePiece({ className = '', piecesList, coursesList }) {
    const [levelsList, setLevelsList] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [filterDisplay, setFilterDisplay] = useState(false);

    useEffect(() => {
        if (selectedCourse) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: selectedCourse,
                }
            }).then(response => {
                setLevelsList(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsList([]);
        }
    }, [selectedCourse]);

    const handleOnDragEnd = (result) => {
        // if (!result.destination) return;

        // const items = Array.from(pieces);
        // const [reorderedItem] = items.splice(result.source.index, 1);
        // items.splice(result.destination.index, 0, reorderedItem);
        //
        // // Update order field and set state
        // const updatedItems = items.map((item, index) => ({ ...item, order: index + 1 }));
        // // setPieces(updatedItems);
        //
        // // Update the backend
        // axios.post('/admin/update-order', { pieces: updatedItems })
        //     .then(response => {
        //         // setSuccessMessage(response.data.message);
        //         // setErrorMessage('');
        //     })
        //     .catch(error => {
        //         // setErrorMessage('Échec de la mise à jour de l\'ordre');
        //         // setSuccessMessage('');
        //     });
    };

    return (
        <section className={className}>
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Modifier une pièce</h2>

                <button className="text-white" onClick={() => setFilterDisplay(!filterDisplay)}>
                    <img src={settingsIcon} alt="Previous" className="h-7 w-7"/>
                </button>
            </header>

            {filterDisplay && (
                <div className="mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="course" value="Cours"/>
                        <select
                            id="course"
                            className="mt-1 block w-full rounded-md"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Choisir un cours</option>
                            {coursesList.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="level" value="Niveau"/>
                        <select
                            id="level"
                            className="mt-1 block w-full rounded-md"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="">Choisir un niveau</option>
                            {levelsList.map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-6">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="w-full max-h-[600px] overflow-y-auto mt-4">
                    </div>
                </DragDropContext>
            </div>

        </section>
    );
}
