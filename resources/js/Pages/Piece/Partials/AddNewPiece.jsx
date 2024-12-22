import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputError from '@/Components/InputError.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import TextInput from "@/Components/TextInput.jsx";
import { useState, useEffect } from "react";

export default function AddNewPiece({ className = '', piecesList }) {
    const user = usePage().props.auth.user;
    const [coursesList, setCoursesList] = useState([]);
    const [levelsList, setLevelsList] = useState([]);
    const [periodsList, setPeriodsList] = useState([]);

    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({
        course: '',
        level: '',
        period: '',
        genre: '',
        composer: '',
        title: '',
        element: '',
        no_mvt: '',
        mvt: '',
        form: '',
        fileName: '',
        audioFile: null,
    });

    useEffect(() => {
        axios.get(route('allCourses'), {
            params: {
                institution_id: user.institution_id,
            }
        }).then(response => {
            setCoursesList(response.data);
        }).catch(error => {
            console.log(error);
        });

        if (piecesList && Array.isArray(piecesList)) {
            const uniquePeriods = [...new Set(piecesList.map((piece) => piece.period))];
            setPeriodsList(uniquePeriods);
            console.log(uniquePeriods);
        }
    }, []);

    useEffect(() => {
        if (data.course) {
            axios.get(route('levelsFromCourse'), {
                params: {
                    course_id: data.course,
                }
            }).then(response => {
                setLevelsList(response.data);
            }).catch(error => {
                console.log(error);
            });
        } else {
            setLevelsList([]);
        }
    }, [data.course]);

    const submitNewPiece = (e) => {
        e.preventDefault();

        post(route('piece.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.level) {
                    reset('course', 'level', 'period', 'genre', 'composer', 'title', 'element', 'no_mvt', 'mvt', 'form', 'fileName', 'audioFile');
                }
            },
        });
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Ajouter une nouvelle pièce</h2>
            </header>

            <form onSubmit={submitNewPiece} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="course" value="Cours" />
                    <select
                        id="course"
                        className="mt-1 block w-full rounded-md"
                        value={data.course}
                        onChange={(e) => setData('course', e.target.value)}
                        required
                    >
                        <option value="">Choisir un cours</option>
                        {coursesList.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.course} />
                </div>

                <div>
                    <InputLabel htmlFor="level" value="Niveau" />
                    <select
                        id="level"
                        className="mt-1 block w-full rounded-md"
                        value={data.level}
                        onChange={(e) => setData('level', e.target.value)}
                        required
                    >
                        <option value="">Choisir un niveau</option>
                        {levelsList.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.level} />
                </div>

                <div>
                    <InputLabel htmlFor="period" value="Période" />

                </div>
            </form>
        </section>
    );
}
