import { Head, Link } from '@inertiajs/react';
import AppHeader from '@/Components/AppHeader';
import { ChevronIcon, CircleAlertIcon, MusicIcon } from '@/Components/AppIcons';

const transition = 'transition duration-200 motion-reduce:transition-none';
export const authCard = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';
export const authInput = `w-full min-h-[48px] rounded-[14px] border border-white/[0.12] hover:border-white/[0.25] bg-white/[0.03] pl-11 pr-4 text-[16px] text-[#F2F3F8] placeholder-[#7D8297] focus:border-[#E0566C] focus:ring-2 focus:ring-[#E0566C]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${transition}`;

// Dark-theme error message for the auth forms (the shared InputError keeps its own look)
export function FieldError({ message, className = '' }) {
    if (!message) return null;
    return (
        <p role="alert" className={`flex items-start gap-2 text-[14px] font-medium text-[#F07A8D] ${className}`}>
            <CircleAlertIcon className="w-4 h-4 mt-0.5"/>
            {message}
        </p>
    );
}

// Label, leading icon and input (or select) passed as children
export function AuthField({ id, label, icon: FieldIcon, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="block mb-2 text-[15px] font-semibold text-[#F2F3F8]">{label}</label>
            <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center text-[#7D8297]">
                    <FieldIcon className="w-5 h-5"/>
                </span>
                {children}
            </div>
            <FieldError message={error} className="mt-2"/>
        </div>
    );
}

export function AuthSubmit({ processing, disabled, label, processingLabel, icon: ButtonIcon }) {
    return (
        <button
            type="submit"
            disabled={processing || disabled}
            className={`w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-[#B4283F] hover:bg-[#C8304A] px-6 text-[16px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed ${transition}`}
        >
            {processing ? (
                <>
                    <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none"></span>
                    {processingLabel}
                </>
            ) : (
                <><ButtonIcon className="w-5 h-5"/> {label}</>
            )}
        </button>
    );
}

export function AuthSwitchLink({ href, prompt, label }) {
    return (
        <p className="text-center">
            <Link href={href} className={`inline-flex items-center gap-1.5 min-h-[44px] text-[15px] text-[#C9CCDA] hover:text-[#F2F3F8] ${transition}`}>
                {prompt}
                <span className="font-semibold text-[#F07A8D] underline decoration-2 underline-offset-2">{label}</span>
                <ChevronIcon className="w-4 h-4"/>
            </Link>
        </p>
    );
}

// Page shell: header with a back button to the Welcome page, then a centered card
export function AuthLayout({ headTitle, title, maxWidth = 'max-w-md', children }) {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title={headTitle}/>
            <AppHeader title={title} backHref={route('welcome')} backLabel="Retour à l'accueil"><></></AppHeader>

            <main className="flex-1 w-full px-4 sm:px-6 py-6 md:py-12 flex justify-center md:items-center">
                <div className={`w-full ${maxWidth}`}>
                    <div className={`${authCard} border-[rgba(224,86,108,0.28)] p-6 md:p-8`}>
                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.14),transparent_60%)]"></div>
                        <div className="relative">
                            <Link href={route('welcome')} className="inline-flex items-center gap-3 min-h-[44px]">
                                <span aria-hidden="true" className="w-10 h-10 rounded-[12px] bg-[#B4283F] text-white flex items-center justify-center">
                                    <MusicIcon className="w-5 h-5"/>
                                </span>
                                <span className="text-[20px] font-bold">QuizMuz</span>
                            </Link>
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
