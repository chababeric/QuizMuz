import { Link, Head } from '@inertiajs/react';
import React from "react";
import AppHeader from '@/Components/AppHeader';
import { BookOpenIcon, ChevronIcon, ClockIcon, ListMusicIcon, MusicIcon } from '@/Components/AppIcons';

const formatNumber = (value) => value.toLocaleString('fr-FR');

const accents = {
    crimson: {
        border: 'border-[rgba(224,86,108,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.16),transparent_60%)]',
        tile: 'bg-[rgba(224,86,108,0.14)] text-[#F07A8D]',
    },
    plum: {
        border: 'border-[rgba(162,120,224,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]',
        tile: 'bg-[rgba(162,120,224,0.14)] text-[#BFA0F0]',
    },
    amber: {
        border: 'border-[rgba(242,185,75,0.28)]',
        glow: 'bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]',
        tile: 'bg-[rgba(242,185,75,0.12)] text-[#F2B94B]',
    },
};

// Accent and icon per course; courses not listed here cycle through the accents
const courseStyles = {
    'Formation Musicale et Auditive': { accent: 'crimson', Icon: MusicIcon },
    'Histoire de la Musique': { accent: 'plum', Icon: ListMusicIcon },
    'Littérature Musicale': { accent: 'amber', Icon: BookOpenIcon },
};
const fallbackAccents = ['crimson', 'plum', 'amber'];

const courseStyle = (course, index) => {
    const style = courseStyles[course.name] ?? { accent: fallbackAccents[index % fallbackAccents.length], Icon: MusicIcon };
    return { ...accents[style.accent], Icon: style.Icon };
};

const Stat = ({ label, value, large = false }) => (
    <div>
        <div className="text-[13px] text-[#A9AEC2]">{label}</div>
        <div className={`${large ? 'text-[32px]' : 'text-[22px]'} font-bold leading-tight`}>{value}</div>
    </div>
);

export default function Course({ auth, courses, lastLevel }) {
    const transition = 'transition duration-200 motion-reduce:transition-none';
    const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border';

    const lastIndex = lastLevel ? courses.findIndex(course => course.id === lastLevel.courseId) : -1;
    const lastCourse = lastIndex >= 0 && courses[lastIndex].played ? courses[lastIndex] : null;
    const lastStyle = lastCourse && courseStyle(lastCourse, lastIndex);

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Cours - QuizMuz"/>
            <AppHeader title="QuizMuz"/>

            <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 pb-10 md:pt-10 md:pb-14 flex flex-col gap-6 md:gap-8">
                <div>
                    <h1 className="text-[32px] md:text-[44px] font-bold leading-tight">
                        Bonjour, {auth.user.first_name || auth.user.username}
                    </h1>
                    <p className="mt-1 text-[16px] md:text-[18px] text-[#C9CCDA]">Choisissez un cours pour continuer.</p>
                </div>

                {/* Resume the most recently played course */}
                {lastCourse && (
                    <section aria-labelledby="resume-heading" className={`${card} ${lastStyle.border} p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10`}>
                        <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${lastStyle.glow}`}></div>

                        <div className="relative flex-1 min-w-0 flex flex-col gap-5">
                            <span className="self-start inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[13px] font-medium text-[#C9CCDA]">
                                <ClockIcon className="w-4 h-4"/>
                                Reprendre où vous en étiez
                            </span>
                            <div>
                                <div className="flex items-center gap-4">
                                    <span className={`w-12 h-12 shrink-0 rounded-[14px] flex items-center justify-center ${lastStyle.tile}`}>
                                        <lastStyle.Icon className="w-6 h-6"/>
                                    </span>
                                    <h2 id="resume-heading" className="text-[26px] md:text-[40px] font-bold leading-tight">{lastCourse.name}</h2>
                                </div>
                                <p className="mt-3 text-[17px] text-[#C9CCDA]">Niveau {lastLevel.name}</p>
                            </div>
                            <div>
                                <Link
                                    href={route('mainmenu', {courseId: lastCourse.id})}
                                    className={`inline-flex items-center gap-1 min-h-[48px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white ${transition}`}
                                >
                                    Continuer <ChevronIcon/>
                                </Link>
                            </div>
                        </div>

                        <div className="relative grid grid-cols-2 gap-4 lg:w-[360px] lg:shrink-0">
                            <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-5">
                                <Stat label="Classement" value={lastCourse.rank ? `${lastCourse.rank}ᵉ` : '—'} large/>
                            </div>
                            <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-5">
                                <Stat label="Points" value={formatNumber(lastCourse.score)} large/>
                            </div>
                        </div>
                    </section>
                )}

                {/* All courses */}
                <section aria-labelledby="courses-heading" className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="courses-heading" className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]">
                            Tous les cours
                        </h2>
                        <span className="text-[13px] text-[#A9AEC2]">{courses.length} cours</span>
                    </div>

                    {courses.length === 0 ? (
                        <div className={`${card} border-white/[0.08] p-6 md:p-8`}>
                            <h3 className="text-[22px] font-semibold">Aucun cours disponible</h3>
                            <p className="mt-1 text-[15px] text-[#C9CCDA]">
                                Votre établissement n'a pas encore ouvert de cours pour votre profil.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
                            {courses.map((course, index) => {
                                const style = courseStyle(course, index);
                                return (
                                    <Link
                                        key={course.id}
                                        href={route('mainmenu', {courseId: course.id})}
                                        className={`group ${card} border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 p-6 flex flex-col gap-5 ${transition}`}
                                    >
                                        <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${style.glow}`}></div>
                                        <div className="relative flex items-center gap-3">
                                            <span className={`w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center ${style.tile}`}>
                                                <style.Icon/>
                                            </span>
                                            <span className="flex-1"></span>
                                            {lastCourse && course.id === lastCourse.id && (
                                                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
                                                    Dernier cours
                                                </span>
                                            )}
                                            <ChevronIcon className="w-5 h-5 text-[#A9AEC2] group-hover:text-[#F2F3F8]"/>
                                        </div>

                                        <div className="relative">
                                            <h3 className="text-[24px] font-bold leading-tight">{course.name}</h3>
                                            <p className="mt-1 text-[16px] text-[#C9CCDA]">
                                                {course.levelCount > 0
                                                    ? `${course.levelCount} ${course.levelCount > 1 ? 'niveaux' : 'niveau'}`
                                                    : 'Aucun niveau ouvert'}
                                            </p>
                                        </div>

                                        <div className="relative border-t border-white/[0.08] pt-4 grid grid-cols-2 gap-4">
                                            {course.score > 0 ? (
                                                <>
                                                    <Stat label="Classement" value={course.rank ? `${course.rank}ᵉ` : '—'}/>
                                                    <Stat label="Points" value={formatNumber(course.score)}/>
                                                </>
                                            ) : (
                                                <>
                                                    <Stat label="Classement" value="—"/>
                                                    <div className="self-end text-[15px] text-[#A9AEC2]">Pas encore commencé</div>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
