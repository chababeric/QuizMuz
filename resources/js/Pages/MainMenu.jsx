
import { Link, Head, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Outlined 2px stroke icons (paths from Lucide, ISC license)
const Icon = ({ className = 'w-5 h-5', children }) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
        {children}
    </svg>
);
const ChevronIcon = (props) => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>;
const HomeIcon = (props) => <Icon {...props}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>;
const LogoutIcon = (props) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></Icon>;
const MusicIcon = (props) => <Icon {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></Icon>;
const LockIcon = (props) => <Icon {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
const HelpIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></Icon>;
const HeadphonesIcon = (props) => <Icon {...props}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></Icon>;
const TrophyIcon = (props) => <Icon {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></Icon>;

const formatNumber = (value) => value.toLocaleString('fr-FR');
const rankColors = ['text-[#F2B94B]', 'text-[#C9CCDA]', 'text-[#D9A27A]'];

export default function MainMenu({ auth }) {
    const { levels } = usePage().props;
    const { courseId } = usePage().props;
    const { courseName } = usePage().props;
    const { modulesByLevel, leaderboard, userStats } = usePage().props;
    const [selectedLevel, setSelectedLevel] = useState(auth.user.last_level);
    const [saveError, setSaveError] = useState(false);

    const currentLevel = levels.find(level => level.id === selectedLevel);
    const hasEnabledLevel = levels.some(level => level.is_enabled);
    const hasLockedLevel = levels.some(level => !level.is_enabled);
    const canPlay = Boolean(currentLevel && currentLevel.is_enabled);
    const modules = (canPlay && modulesByLevel[currentLevel.id]) || [];
    const userInTop = leaderboard.some(entry => entry.userId === auth.user.id);

    useEffect(() => {
        if (!currentLevel || !currentLevel.is_enabled) {
            const firstEnabledLevel = levels.find(level => level.is_enabled);
            if (firstEnabledLevel) {
                setSelectedLevel(firstEnabledLevel.id);
            }
        }
    }, [levels, selectedLevel]);

    useEffect(() => {
        if (auth.user.last_level !== selectedLevel && canPlay) {
            setSaveError(false);
            axios.post(route('updateLastLevel'), {
                level: selectedLevel,
                userId: auth.user.id
            }).then(r => {}
            ).catch(e => {
                console.error("There was an error updating the last level!", e);
                setSaveError(true);
            });
        }
    }, [selectedLevel]);

    useEffect(() => {
        localStorage.removeItem("game_key");
    }, []);

    // Mode entries only link somewhere when an enabled level is selected
    const ModeLink = canPlay ? Link : 'div';
    const modeProps = (routeName) => canPlay
        ? { href: route(routeName, {level: selectedLevel, courseId: courseId, courseName: courseName}) }
        : { 'aria-disabled': true };
    const unavailable = canPlay ? '' : 'opacity-50 cursor-not-allowed';
    const transition = 'transition duration-200 motion-reduce:transition-none';
    const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border';
    const featureCard = `group ${card} border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 p-6 flex flex-col gap-5 ${transition}`;

    return (
        <div className="min-h-[100dvh] bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Menu principal - QuizMuz"/>

            <header className="border-b border-white/[0.07]">
                <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
                    <Link href={route('welcome')} className="flex-1 min-w-0 flex items-center gap-3 min-h-[44px]">
                        <span className="w-8 h-8 shrink-0 rounded-[10px] bg-[#B4283F] text-white flex items-center justify-center">
                            <MusicIcon className="w-[18px] h-[18px]"/>
                        </span>
                        <span className="truncate text-[20px] font-semibold">{courseName}</span>
                    </Link>
                    <Link
                        href={route('welcome')}
                        aria-label="Accueil"
                        className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 flex items-center justify-center gap-2 rounded-full bg-white/[0.06] text-[#F2F3F8] hover:bg-white/10 ${transition}`}
                    >
                        <HomeIcon/>
                        <span className="hidden sm:inline text-[15px] font-medium">Accueil</span>
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        aria-label="Déconnexion"
                        className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 flex items-center justify-center gap-2 rounded-full text-[#A9AEC2] hover:text-[#F2F3F8] hover:bg-white/[0.05] ${transition}`}
                    >
                        <LogoutIcon/>
                        <span className="hidden sm:inline text-[15px] font-medium">Déconnexion</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8 pb-12 flex flex-col lg:flex-row gap-6">

                {/* Sidebar: levels */}
                <aside aria-labelledby="levels-heading" className={`${card} border-white/[0.08] p-4 lg:w-[280px] lg:shrink-0 lg:self-start`}>
                    <h2 id="levels-heading" className="px-2 mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]">
                        Niveaux
                    </h2>

                    {!hasEnabledLevel ? (
                        <p className="px-2 text-[15px] text-[#C9CCDA]">
                            Aucun niveau n'est disponible pour ce cours pour le moment. Contactez votre établissement pour qu'il ouvre un niveau.
                        </p>
                    ) : (
                        <div role="group" aria-labelledby="levels-heading" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-1 gap-1">
                            {levels.map(level => {
                                const isSelected = selectedLevel === level.id;
                                const moduleCount = (modulesByLevel[level.id] || []).length;
                                return (
                                    <button
                                        key={level.id}
                                        aria-pressed={isSelected}
                                        disabled={!level.is_enabled}
                                        onClick={() => level.is_enabled && setSelectedLevel(level.id)}
                                        className={`min-h-[44px] px-3 py-2.5 rounded-[14px] flex items-center justify-between gap-3 text-left ${transition} ${
                                            isSelected
                                                ? 'bg-white text-[#06070D]'
                                                : level.is_enabled
                                                    ? 'text-[#F2F3F8] hover:bg-white/[0.05]'
                                                    : 'text-[#7D8297] cursor-not-allowed'
                                        }`}
                                    >
                                        <span className="text-[16px] font-semibold">{level.name}</span>
                                        {level.is_enabled ? (
                                            moduleCount > 0 && (
                                                <span className={`hidden lg:inline text-[13px] ${isSelected ? 'text-[#3A3F52]' : 'text-[#A9AEC2]'}`}>
                                                    {moduleCount} {moduleCount > 1 ? 'modules' : 'module'}
                                                </span>
                                            )
                                        ) : (
                                            <span role="img" aria-label="Verrouillé"><LockIcon className="w-4 h-4"/></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {saveError ? (
                        <p role="status" className="mt-4 px-2 text-[13px] text-[#F07A8D]">
                            Votre niveau n'a pas pu être enregistré. L'ancien niveau sera sélectionné à votre prochaine visite.
                        </p>
                    ) : hasEnabledLevel && hasLockedLevel && (
                        <p className="mt-4 px-2 text-[13px] text-[#A9AEC2]">
                            Les niveaux verrouillés n'ont pas encore été ouverts par votre établissement.
                        </p>
                    )}
                </aside>

                <div className="flex-1 min-w-0 flex flex-col gap-6">

                    {/* Quiz hero */}
                    <section aria-labelledby="quiz-heading" className={`${card} border-[rgba(224,86,108,0.28)] p-6 sm:p-8`}>
                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.18),transparent_60%)]"></div>
                        <div
                            aria-hidden="true"
                            className="hidden md:block absolute inset-y-0 right-0 w-[45%] pointer-events-none bg-[url('/images/main_background.jpg')] bg-cover bg-center [mask-image:linear-gradient(to_left,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_left,black_45%,transparent)]"
                        ></div>

                        <div className="relative md:max-w-[60%] flex flex-col gap-6">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[13px] font-medium text-[#C9CCDA]">
                                    {canPlay ? `Niveau ${currentLevel.name}` : 'Aucun niveau sélectionné'}
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center gap-4">
                                    <span className="w-12 h-12 shrink-0 rounded-[14px] bg-[rgba(224,86,108,0.14)] text-[#F07A8D] flex items-center justify-center">
                                        <HelpIcon className="w-6 h-6"/>
                                    </span>
                                    <h2 id="quiz-heading" className="text-[40px] sm:text-[48px] font-bold leading-none">Quiz</h2>
                                </div>
                                <p className="mt-3 text-[17px] text-[#C9CCDA]">
                                    {canPlay ? 'Testez vos connaissances et gagnez des points.' : 'Choisissez un niveau pour commencer.'}
                                </p>
                            </div>

                            {userStats.quizCount > 0 || userStats.score > 0 ? (
                                <dl className="flex flex-wrap gap-x-10 gap-y-4">
                                    <div>
                                        <dt className="text-[13px] text-[#A9AEC2]">Score total</dt>
                                        <dd className="text-[22px] font-bold">{formatNumber(userStats.score)} pts</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[13px] text-[#A9AEC2]">Quiz joués</dt>
                                        <dd className="text-[22px] font-bold">{formatNumber(userStats.quizCount)}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-[15px] text-[#A9AEC2]">Pas encore de tentative</p>
                            )}

                            <div>
                                <ModeLink
                                    {...modeProps('optionsmenu')}
                                    className={`inline-flex items-center gap-1 min-h-[48px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white ${transition} ${unavailable}`}
                                >
                                    Commencer le quiz <ChevronIcon/>
                                </ModeLink>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Practice */}
                        <ModeLink {...modeProps('practice')} className={`${featureCard} ${unavailable}`}>
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]"></div>
                            <div className="relative flex items-start justify-between">
                                <span className="w-11 h-11 rounded-[14px] bg-[rgba(162,120,224,0.14)] text-[#BFA0F0] flex items-center justify-center">
                                    <HeadphonesIcon/>
                                </span>
                                <ChevronIcon className="w-5 h-5 text-[#A9AEC2] group-hover:text-[#F2F3F8]"/>
                            </div>
                            <div className="relative">
                                <h3 className="text-[22px] font-semibold">Pratique</h3>
                                <p className="text-[15px] text-[#C9CCDA]">Entraînez-vous sans pression</p>
                            </div>
                            {modules.length > 0 && (
                                <ul aria-label="Modules du niveau" className="relative flex flex-wrap gap-2">
                                    {modules.map(title => (
                                        <li key={title} className="rounded-full border border-[rgba(191,160,240,0.35)] px-3 py-1 text-[13px] text-[#C9CCDA]">
                                            {title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="relative mt-auto rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between">
                                <span className="text-[15px] text-[#C9CCDA]">Séances de pratique</span>
                                <span className="text-[17px] font-semibold text-[#BFA0F0]">
                                    {userStats.practiceCount > 0 ? formatNumber(userStats.practiceCount) : 'Aucune'}
                                </span>
                            </div>
                        </ModeLink>

                        {/* High scores */}
                        <Link href={route('highscores', {courseId: courseId})} className={featureCard}>
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]"></div>
                            <div className="relative flex items-start justify-between">
                                <span className="w-11 h-11 rounded-[14px] bg-[rgba(242,185,75,0.12)] text-[#F2B94B] flex items-center justify-center">
                                    <TrophyIcon/>
                                </span>
                                <ChevronIcon className="w-5 h-5 text-[#A9AEC2] group-hover:text-[#F2F3F8]"/>
                            </div>
                            <div className="relative">
                                <h3 className="text-[22px] font-semibold">Meilleurs scores</h3>
                                <p className="text-[15px] text-[#C9CCDA]">Classement · {courseName}</p>
                            </div>
                            {leaderboard.length === 0 ? (
                                <p className="relative mt-auto text-[15px] text-[#A9AEC2]">Soyez le premier !</p>
                            ) : (
                                <ol className="relative mt-auto flex flex-col gap-1">
                                    {leaderboard.map((entry, index) => {
                                        const isUser = entry.userId === auth.user.id;
                                        return (
                                            <li
                                                key={entry.userId}
                                                className={`flex items-center gap-3 rounded-[14px] px-3 py-2 border ${isUser ? 'bg-[rgba(242,185,75,0.10)] border-[rgba(242,185,75,0.35)]' : 'border-transparent'}`}
                                            >
                                                <span className={`w-6 text-[15px] font-bold ${rankColors[index]}`}>{index + 1}</span>
                                                <span className="flex-1 min-w-0 truncate text-[15px]">{isUser ? 'Vous' : entry.username}</span>
                                                <span className="text-[15px] font-semibold text-[#C9CCDA]">{formatNumber(entry.score)} pts</span>
                                            </li>
                                        );
                                    })}
                                    {!userInTop && userStats.rank && (
                                        <li className="mt-1 flex items-center gap-3 rounded-[14px] px-3 py-2 border bg-[rgba(242,185,75,0.10)] border-[rgba(242,185,75,0.35)]">
                                            <span className="w-6 text-[15px] font-bold text-[#F2B94B]">{userStats.rank}</span>
                                            <span className="flex-1 text-[15px]">Vous</span>
                                            <span className="text-[15px] font-semibold text-[#C9CCDA]">{formatNumber(userStats.score)} pts</span>
                                        </li>
                                    )}
                                </ol>
                            )}
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
