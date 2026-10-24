import { Head, Link } from '@inertiajs/react';
import AppHeader from '@/Components/AppHeader';
import { CheckIcon, ChevronIcon, CircleAlertIcon, TrophyIcon } from '@/Components/AppIcons';

export const transition = 'transition duration-200 motion-reduce:transition-none';
export const quizCard = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';
export const sectionLabel = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A9AEC2]';
export const fieldClass = 'w-full min-h-[48px] rounded-[14px] border bg-white/[0.03] px-4 text-[16px] text-[#F2F3F8] placeholder-[#7D8297] focus:border-[#E0566C] focus:ring-2 focus:ring-[#E0566C]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

const Spinner = () => (
    <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none"></span>
);

export function QuizScore({ score }) {
    return (
        <section aria-label="Score" className={`${quizCard} p-4 md:p-5 flex items-center gap-4`}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]"></div>
            <span aria-hidden="true" className="relative w-11 h-11 shrink-0 rounded-[14px] bg-[rgba(242,185,75,0.12)] text-[#F2B94B] flex items-center justify-center">
                <TrophyIcon/>
            </span>
            <div className="relative">
                <div className={sectionLabel}>Score</div>
                <div className="text-[28px] font-bold leading-tight">{score}</div>
            </div>
        </section>
    );
}

export function QuizError({ message }) {
    if (!message) return null;
    return (
        <div role="alert" className="flex items-center gap-3 rounded-[16px] border border-[rgba(224,86,108,0.4)] bg-[rgba(224,86,108,0.1)] px-4 py-3">
            <CircleAlertIcon className="w-5 h-5 text-[#F07A8D]"/>
            <p className="text-[15px] font-medium text-[#F2F3F8]">{message}</p>
        </div>
    );
}

export function QuizActionButton({ grading, isLoading, actionText, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed ${transition}`}
        >
            {isLoading ? (
                <><Spinner/> Chargement...</>
            ) : grading ? (
                <>{actionText} <ChevronIcon/></>
            ) : (
                <><CheckIcon/> {actionText}</>
            )}
        </button>
    );
}

export function QuizCompleted({ courseId, message }) {
    return (
        <section className={`${quizCard} border-[rgba(30,158,98,0.35)] p-6 md:p-10 max-w-xl mx-auto w-full text-center`}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(30,158,98,0.16),transparent_60%)]"></div>
            <div className="relative flex flex-col items-center gap-4">
                <span aria-hidden="true" className="w-12 h-12 rounded-[14px] bg-[rgba(30,158,98,0.16)] text-[#5FD39A] flex items-center justify-center">
                    <CheckIcon className="w-6 h-6"/>
                </span>
                <h2 className="text-[28px] md:text-[32px] font-bold">Quiz terminé !</h2>
                <p className="text-[16px] leading-relaxed text-[#C9CCDA]">
                    {message}<br/>
                    Félicitations pour votre performance.
                </p>
                <Link
                    href={route('mainmenu', { courseId })}
                    className={`inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white ${transition}`}
                >
                    Retour au menu
                </Link>
            </div>
        </section>
    );
}

// Page shell: header, optional loading overlay, sidebar + content columns, and the
// primary action (in the sidebar on desktop, pinned to the bottom on smaller screens)
export function QuizLayout({ headTitle, courseId, isLoading, completed, sidebar, action, children }) {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title={headTitle}/>
            <AppHeader title="Quiz" backHref={route('mainmenu', { courseId })} backLabel="Retour au menu"/>

            {isLoading && (
                <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070D]/70 backdrop-blur-sm">
                    <div className={`${quizCard} flex items-center gap-3 px-6 py-4`}>
                        <Spinner/>
                        <span className="text-[17px] font-semibold">Chargement...</span>
                    </div>
                </div>
            )}

            {completed ? (
                <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8 md:py-12 flex items-center">
                    {completed}
                </main>
            ) : (
                <>
                    <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 md:pt-6 pb-32 lg:pb-12 flex flex-col lg:flex-row lg:items-start gap-4 md:gap-5">
                        <div className="lg:w-[340px] lg:shrink-0 lg:sticky lg:top-[88px] flex flex-col gap-4 md:gap-5">
                            {sidebar}
                            <div className="hidden lg:block">{action}</div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-5">
                            {children}
                        </div>
                    </main>
                    <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.07] bg-[#06070D]/95 backdrop-blur-md px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                        {action}
                    </div>
                </>
            )}
        </div>
    );
}
