import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, HomeIcon, LogoutIcon, MusicIcon } from '@/Components/AppIcons';

const transition = 'transition duration-200 motion-reduce:transition-none';

// Leading edge: back button (when there is a parent page), then the page title
export default function AppHeader({ title, subtitle, backHref, backLabel }) {
    return (
        <header className="shrink-0 border-b border-white/[0.07]">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
                {backHref && (
                    <Link
                        href={backHref}
                        aria-label={backLabel}
                        className={`-ml-2 min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-full text-[#F2F3F8] hover:bg-white/[0.06] ${transition}`}
                    >
                        <ChevronLeftIcon className="w-6 h-6"/>
                    </Link>
                )}
                <span aria-hidden="true" className={`${backHref ? 'hidden sm:flex' : 'flex'} w-8 h-8 shrink-0 rounded-[10px] bg-[#B4283F] text-white items-center justify-center`}>
                    <MusicIcon className="w-[18px] h-[18px]"/>
                </span>
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <h1 className="shrink-0 text-[20px] font-semibold">{title}</h1>
                    {subtitle && (
                        <span className="truncate text-[15px] text-[#A9AEC2]">{subtitle}</span>
                    )}
                </div>
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
    );
}
