import { useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { HomeIcon, LogoutIcon, MusicIcon } from '@/Components/AppIcons';

const transition = 'transition duration-150 motion-reduce:transition-none';
const barButton = `inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-2 rounded-lg px-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white ${transition}`;

// Admin sections, in tab order; each one shows only with its permission
const SECTIONS = [
    { route: 'dashboard', label: "Vue d'ensemble", permission: 'canAccessDashboard' },
    { route: 'general.edit', label: 'Général', permission: 'canAccessGeneral' },
    { route: 'account.edit', label: 'Compte', permission: 'canAccessAccount' },
    { route: 'access.edit', label: 'Accès', permission: 'canAccessAccess' },
    { route: 'piece.edit', label: 'LitMus', permission: 'canAccessLitmus' },
    { route: 'history.edit', label: 'Histoire', permission: 'canAccessHistory' },
    { route: 'chord.edit', label: 'FMA', permission: 'canAccessFMA' },
    { route: 'logs.edit', label: 'Registres', permission: 'canAccessLogs' },
];

export default function Authenticated({ user, header, children }) {
    const { permissions } = usePage().props;
    const tabRow = useRef(null);
    const activeTab = useRef(null);

    // On narrow screens the tab row scrolls sideways; centre the current section in it.
    // Only the row scrolls (scrollIntoView would also move the page).
    useEffect(() => {
        const centreActiveTab = () => {
            const row = tabRow.current;
            const tab = activeTab.current;
            if (row && tab && row.scrollWidth > row.clientWidth) {
                row.scrollLeft = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
            }
        };
        centreActiveTab();
        // Tab widths change once the web font loads
        document.fonts?.ready.then(centreActiveTab);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav aria-label="Administration" className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4283F]">
                        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#B4283F] text-white">
                            <MusicIcon className="h-5 w-5"/>
                        </span>
                        <span className="truncate text-lg font-bold text-gray-900 dark:text-white">QuizMuz</span>
                        <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600 sm:inline dark:bg-gray-800 dark:text-gray-300">
                            Admin
                        </span>
                    </Link>

                    <div className="ml-auto flex items-center gap-1">
                        <div className="mr-2 hidden text-right leading-tight md:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
                        </div>

                        <Link href={route('welcome')} aria-label="Retour" title="Retour" className={barButton}>
                            <HomeIcon className="h-5 w-5"/>
                            <span className="hidden sm:inline">Retour</span>
                        </Link>

                        <Link method="post" href={route('logout')} as="button" aria-label="Déconnexion" title="Déconnexion" className={barButton}>
                            <LogoutIcon className="h-5 w-5"/>
                            <span className="hidden sm:inline">Déconnexion</span>
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
                    <ul ref={tabRow} className="relative -mb-px flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {SECTIONS.filter((section) => permissions[section.permission]).map((section) => {
                            const isActive = route().current(section.route);
                            return (
                                <li key={section.route} className="shrink-0">
                                    <Link
                                        ref={isActive ? activeTab : undefined}
                                        href={route(section.route)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`flex h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B4283F] ${transition} ${
                                            isActive
                                                ? 'border-[#B4283F] text-gray-900 dark:border-[#E0566C] dark:text-white'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white'
                                        }`}
                                    >
                                        {section.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {header && (
                <header className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white">
                    {header}
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
