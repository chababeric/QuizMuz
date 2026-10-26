import React, { useState } from "react";
import { Head } from '@inertiajs/react';
import AppHeader from '@/Components/AppHeader';
import { CheckIcon, CopyIcon, LifeBuoyIcon, MailIcon, MessageIcon } from '@/Components/AppIcons';

const SUPPORT_EMAIL = 'chababeric@quizmuz.com';

const transition = 'transition duration-200 motion-reduce:transition-none';
const card = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08]';

const SupportCard = ({ icon: CardIcon, tile, glow, title, children }) => (
    <section className={`${card} p-5 md:p-6 flex flex-col gap-4`}>
        <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${glow}`}></div>
        <div className="relative flex items-center gap-3">
            <span aria-hidden="true" className={`w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center ${tile}`}>
                <CardIcon/>
            </span>
            <h3 className="text-[20px] font-semibold">{title}</h3>
        </div>
        <div className="relative flex flex-col gap-3 text-[16px] leading-relaxed text-[#C9CCDA]">
            {children}
        </div>
    </section>
);

export default function Support() {
    const [copied, setCopied] = useState(false);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Could not copy the e-mail address", e);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[#06070D] text-[#F2F3F8] font-sans">
            <Head title="Support - QuizMuz"/>
            <AppHeader title="Support" backHref={route('welcome')} backLabel="Retour à l'accueil"/>

            <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-10 md:pt-10 md:pb-14 flex flex-col gap-4 md:gap-6">
                <section className={`${card} border-[rgba(224,86,108,0.28)] p-6 md:p-8 flex items-center gap-4`}>
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.16),transparent_60%)]"></div>
                    <span aria-hidden="true" className="relative w-12 h-12 shrink-0 rounded-[14px] bg-[rgba(224,86,108,0.14)] text-[#F07A8D] flex items-center justify-center">
                        <LifeBuoyIcon className="w-6 h-6"/>
                    </span>
                    <h2 className="relative text-[28px] md:text-[40px] font-bold leading-tight">Besoin d'aide?</h2>
                </section>

                <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                    <SupportCard
                        icon={MailIcon}
                        title="Contact par e-mail"
                        tile="bg-[rgba(224,86,108,0.14)] text-[#F07A8D]"
                        glow="bg-[radial-gradient(circle_at_top_right,rgba(224,86,108,0.16),transparent_60%)]"
                    >
                        <p>
                            Pour toute question, problème ou suggestion, veuillez&nbsp;
                            <a
                                href={`mailto:${SUPPORT_EMAIL}`}
                                className="font-semibold text-[#F07A8D] underline decoration-2 underline-offset-2 hover:text-[#F2F3F8]"
                            >
                                me contacter
                            </a>
                            .
                        </p>
                    </SupportCard>

                    <SupportCard
                        icon={CopyIcon}
                        title="Adresse e-mail"
                        tile="bg-[rgba(242,185,75,0.12)] text-[#F2B94B]"
                        glow="bg-[radial-gradient(circle_at_top_right,rgba(242,185,75,0.14),transparent_60%)]"
                    >
                        <p>Si le lien ne fonctionne pas, vous pouvez copier l'adresse e-mail suivante:</p>
                        <div className="flex items-center gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.03] pl-4 pr-1.5 py-1.5">
                            <span className="flex-1 min-w-0 break-all font-mono text-[14px] sm:text-[15px] font-medium text-[#F2B94B]">{SUPPORT_EMAIL}</span>
                            <button
                                type="button"
                                onClick={copyEmail}
                                aria-label={copied ? "Adresse e-mail copiée" : "Copier l'adresse e-mail"}
                                className={`shrink-0 min-h-[44px] min-w-[44px] px-3 justify-center inline-flex items-center gap-1.5 rounded-[10px] text-[14px] font-semibold text-[#F2F3F8] hover:bg-white/[0.06] ${transition}`}
                            >
                                {copied ? <CheckIcon className="w-4 h-4"/> : <CopyIcon className="w-4 h-4"/>}
                                <span aria-hidden="true" className="hidden sm:inline">{copied ? 'Copié' : 'Copier'}</span>
                                <span aria-live="polite" className="sr-only">{copied ? 'Adresse e-mail copiée' : ''}</span>
                            </button>
                        </div>
                    </SupportCard>

                    <SupportCard
                        icon={MessageIcon}
                        title="Réseaux sociaux"
                        tile="bg-[rgba(162,120,224,0.14)] text-[#BFA0F0]"
                        glow="bg-[radial-gradient(circle_at_top_right,rgba(162,120,224,0.16),transparent_60%)]"
                    >
                        <p>Vous pouvez également me contacter par Mio ou n'importe quel réseau social.</p>
                    </SupportCard>
                </div>
            </main>
        </div>
    );
}
