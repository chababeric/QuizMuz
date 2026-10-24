import { Link, Head } from '@inertiajs/react';
import React from "react";
import AppHeader from '@/Components/AppHeader';
import { BookOpenIcon, ChevronIcon, ListMusicIcon, MusicIcon } from '@/Components/AppIcons';

const formatNumber = (value) => value.toLocaleString('fr-FR');

// Accent per card, cycling crimson → plum → amber
const accents = [
    { glow: 'bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.16),transparent_60%)]', tile: 'bg-[rgba(224,86,108,0.14)] text-[#F07A8D]', value: 'text-[#F07A8D]' },
    { glow: 'bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]', tile: 'bg-[rgba(162,120,224,0.14)] text-[#BFA0F0]', value: 'text-[#BFA0F0]' },
    { glow: 'bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]', tile: 'bg-[rgba(242,185,75,0.12)] text-[#F2B94B]', value: 'text-[#F2B94B]' },
];

const courseIcon = (name) => {
    if (name.includes('Littérature')) return BookOpenIcon;
    if (name.includes('Formation')) return MusicIcon;
    return ListMusicIcon;
};

export default function Course({ auth, courses, lastCourseId }) {
    const transition = 'transition duration-200 motion-reduce:transition-none';
    const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Cours - QuizMuz"/>
            <AppHeader title="QuizMuz"/>

            <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-8 md:pt-10 flex flex-col gap-5 md:gap-8">
                <div>
                    <h1 className="text-[28px] md:text-[40px] font-bold leading-tight">
                        Bonjour, {auth.user.first_name || auth.user.username}
                    </h1>
                    <p className="mt-1 text-[15px] md:text-[17px] text-[#C9CCDA]">Choisissez un cours pour continuer.</p>
                </div>

                {courses.length === 0 ? (
                    <div className={`${card} p-6 md:p-8 max-w-xl`}>
                        <h2 className="text-[22px] font-semibold">Aucun cours disponible</h2>
                        <p className="mt-1 text-[15px] text-[#C9CCDA]">
                            Votre établissement n'a pas encore ouvert de cours pour votre profil.
                        </p>
                    </div>
                ) : (
                    <section aria-label="Cours" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        {courses.map((course, index) => {
                            const accent = accents[index % accents.length];
                            const CourseIcon = courseIcon(course.name);
                            return (
                                <Link
                                    key={course.id}
                                    href={route('mainmenu', {courseId: course.id})}
                                    className={`group ${card} hover:border-white/[0.18] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 p-4 md:p-6 flex flex-col gap-4 md:gap-5 ${transition}`}
                                >
                                    <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${accent.glow}`}></div>
                                    <div className="relative flex items-start gap-4">
                                        <span className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-[14px] flex items-center justify-center ${accent.tile}`}>
                                            <CourseIcon/>
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-[18px] md:text-[22px] font-semibold leading-snug">{course.name}</h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-[15px] text-[#C9CCDA]">
                                                    {course.levelCount > 0
                                                        ? `${course.levelCount} ${course.levelCount > 1 ? 'niveaux' : 'niveau'}`
                                                        : 'Aucun niveau ouvert'}
                                                    {course.score > 0 && (
                                                        <span className={`md:hidden font-semibold ${accent.value}`}>
                                                            {` · ${formatNumber(course.score)} pts`}{course.rank && ` · ${course.rank}ᵉ`}
                                                        </span>
                                                    )}
                                                </span>
                                                {course.id === lastCourseId && (
                                                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
                                                        Dernier cours
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronIcon className="w-5 h-5 text-[#A9AEC2] group-hover:text-[#F2F3F8]"/>
                                    </div>

                                    <div className="relative rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 hidden md:flex items-center justify-between gap-3">
                                        {course.score > 0 ? (
                                            <>
                                                <span className="text-[15px] text-[#C9CCDA]">Votre score</span>
                                                <span className={`text-[17px] font-semibold ${accent.value}`}>
                                                    {formatNumber(course.score)} pts{course.rank && ` · ${course.rank}ᵉ`}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[15px] text-[#A9AEC2]">Pas encore commencé</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
}
