import { Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import AppHeader, { HeaderLink } from '@/Components/AppHeader';
import { BookOpenIcon, ChevronIcon, CrownIcon, LifeBuoyIcon, LogInIcon, LogoutIcon, MusicIcon, RocketIcon, UserPlusIcon } from '@/Components/AppIcons';

const transition = 'transition duration-200 motion-reduce:transition-none';
const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border';
const primaryButton = `inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white ${transition}`;

// Phones only: show the first lines with a toggle; wider screens always show the full text
function ReadMore({ id, expanded, onToggle }) {
    return (
        <button
            type="button"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={onToggle}
            className="relative md:hidden self-start min-h-[44px] -my-2 inline-flex items-center gap-1 text-[15px] font-semibold text-[#F2F3F8]"
        >
            {expanded ? 'Réduire' : 'Lire la suite'}
            <ChevronIcon className={`w-4 h-4 ${expanded ? '-rotate-90' : 'rotate-90'}`}/>
        </button>
    );
}

export default function Welcome({ auth }) {
    const [expanded, setExpanded] = useState({ courses: false, about: false });
    const toggle = (key) => setExpanded(current => ({ ...current, [key]: !current[key] }));
    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="QuizMuz" />

            <AppHeader title="Accueil">
                {auth.user ? (
                    <>
                        <HeaderLink href={route('course')} icon={BookOpenIcon} label="Cours"/>
                        {auth.isAdmin && <HeaderLink href={route('admin')} icon={CrownIcon} label="Admin"/>}
                        <HeaderLink href={route('support')} icon={LifeBuoyIcon} label="Support"/>
                        <HeaderLink href={route('logout')} method="post" as="button" icon={LogoutIcon} label="Déconnexion" muted/>
                    </>
                ) : <></>}
            </AppHeader>

            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-8 md:pt-10 md:pb-12 flex flex-col gap-4 md:gap-6">

                {/* Hero */}
                <section aria-labelledby="app-heading" className={`${card} border-[rgba(224,86,108,0.28)] p-5 md:p-10`}>
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.18),transparent_60%)]"></div>
                    <div
                        aria-hidden="true"
                        className="hidden md:block absolute inset-y-0 right-0 w-[45%] pointer-events-none bg-[url('/images/main_background.jpg')] bg-cover bg-center [mask-image:linear-gradient(to_left,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_left,black_45%,transparent)]"
                    ></div>

                    <div className="relative md:max-w-[60%] flex flex-col gap-4 md:gap-5">
                        <div className="flex items-center gap-4">
                            <span className="w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-[14px] bg-[#B4283F] text-white flex items-center justify-center">
                                <MusicIcon className="w-6 h-6 md:w-7 md:h-7"/>
                            </span>
                            <h2 id="app-heading" className="text-[34px] md:text-[56px] font-bold leading-none">QuizMuz</h2>
                        </div>
                        <p className="text-[16px] md:text-[20px] font-medium text-[#C9CCDA]">Plateforme d'apprentissage musical</p>

                        {auth.user ? (
                            <>
                                <p className="text-[22px] md:text-[28px] font-bold">
                                    Bienvenue, {auth.user.first_name || 'Musicien'}!
                                </p>
                                <div>
                                    <Link href={route('course')} className={`${primaryButton} w-full sm:w-auto`}>
                                        Commencer à apprendre <ChevronIcon/>
                                    </Link>
                                </div>
                            </>
                        ) : null}
                    </div>
                </section>

                {auth.user ? (
                    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                        {/* About the courses */}
                        <section className={`${card} border-white/[0.08] p-5 md:p-8 flex flex-col gap-4 md:gap-5`}>
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.12),transparent_60%)]"></div>
                            <span aria-hidden="true" className="relative w-11 h-11 rounded-[14px] bg-[rgba(242,185,75,0.12)] text-[#F2B94B] flex items-center justify-center">
                                <BookOpenIcon/>
                            </span>
                            <div id="courses-text" className="relative flex flex-col gap-4 text-[15px] md:text-[17px] leading-relaxed text-[#C9CCDA]">
                                <p className={expanded.courses ? '' : 'max-md:line-clamp-4'}>
                                    Durant les cours de littérature musicale au Conservatoire de Musique de Montréal, les étudiants explorent l'évolution de la
                                    musique à travers différentes époques en étudiant les œuvres majeures et les
                                    compositeurs influents. Ils analysent des partitions et apprennent à comprendre les
                                    styles et les techniques de composition utilisés au fil des siècles.
                                </p>
                                <p className={expanded.courses ? '' : 'max-md:hidden'}>
                                    Les cours incluent également des tests d'écoute où les étudiants doivent reconnaître et situer une pièce musicale jouée.
                                    Ces tests permettent d'évaluer leur capacité à identifier les caractéristiques stylistiques et techniques des œuvres,
                                    ainsi qu'à associer les pièces à leur contexte historique et culturel.
                                </p>
                            </div>
                            <ReadMore id="courses-text" expanded={expanded.courses} onToggle={() => toggle('courses')}/>
                        </section>

                        {/* About QuizMuz */}
                        <section aria-labelledby="about-heading" className={`${card} border-white/[0.08] p-5 md:p-8 flex flex-col gap-4 md:gap-5`}>
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]"></div>
                            <div className="relative flex items-center gap-4">
                                <span aria-hidden="true" className="w-11 h-11 shrink-0 rounded-[14px] bg-[rgba(162,120,224,0.14)] text-[#BFA0F0] flex items-center justify-center">
                                    <RocketIcon/>
                                </span>
                                <h2 id="about-heading" className="text-[22px] md:text-[24px] font-bold">À propos de QuizMuz</h2>
                            </div>
                            <p id="about-text" className={`relative text-[15px] md:text-[17px] leading-relaxed text-[#C9CCDA] ${expanded.about ? '' : 'max-md:line-clamp-4'}`}>
                                QuizMuz est une plateforme en ligne qui permet aux étudiants de pratiquer pour se préparer à ces tests.
                                Elle offre des quiz interactifs et un module d'entraînement qui simulent les conditions des tests d'écoute réels.
                                Grâce à QuizMuz, les étudiants peuvent s'exercer à reconnaître les œuvres musicales et à identifier tous leurs éléments caractéristiques,
                                ce qui leur permet de renforcer leurs compétences et de gagner en confiance avant les évaluations officielles.
                            </p>
                            <ReadMore id="about-text" expanded={expanded.about} onToggle={() => toggle('about')}/>
                        </section>
                    </div>
                ) : (
                    /* Guests: sign in or register */
                    <section aria-labelledby="access-heading" className={`${card} border-white/[0.08] p-5 md:p-8 flex flex-col gap-5`}>
                        <div>
                            <h2 id="access-heading" className="text-[24px] md:text-[28px] font-bold">Accès à QuizMuz</h2>
                            <p className="mt-2 text-[16px] md:text-[17px] text-[#C9CCDA]">
                                Connectez-vous pour accéder à la plateforme et commencer votre parcours d'apprentissage!
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href={route('login')} className={primaryButton}>
                                <LogInIcon/> Se connecter
                            </Link>
                            <Link
                                href={route('register')}
                                className={`inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full border border-white/[0.16] hover:border-white/[0.3] hover:bg-white/[0.05] px-6 text-[16px] font-semibold text-[#F2F3F8] ${transition}`}
                            >
                                <UserPlusIcon/> S'inscrire
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <footer className="border-t border-white/[0.07]">
                <p className="max-w-[1240px] mx-auto px-4 sm:px-6 py-5 text-center text-[13px] text-[#A9AEC2]">
                    QuizMuz v3.1.0 © 2026 - Tous droits réservés
                </p>
            </footer>
        </div>
    );
}
