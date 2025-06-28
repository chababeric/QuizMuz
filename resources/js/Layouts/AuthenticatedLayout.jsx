import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { permissions } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-white border-b border-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-16 w-[80px] fill-current text-gray-800 pt-4 dark:text-white" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {permissions.canAccessDashboard && (
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')} className="dark:text-white">
                                        Vue d'ensemble
                                    </NavLink>
                                )}

                                {permissions.canAccessGeneral && (
                                    <NavLink href={route('general.edit')} active={route().current('general.edit')} className="dark:text-white">
                                        Général
                                    </NavLink>
                                )}

                                {permissions.canAccessAccount && (
                                    <NavLink href={route('account.edit')} active={route().current('account.edit')} className="dark:text-white">
                                        Compte
                                    </NavLink>
                                )}

                                {permissions.canAccessAccess && (
                                    <NavLink href={route('access.edit')} active={route().current('access.edit')} className="dark:text-white">
                                        Accès
                                    </NavLink>
                                )}

                                {permissions.canAccessLitmus && (
                                    <NavLink href={route('piece.edit')} active={route().current('piece.edit')} className="dark:text-white">
                                        LitMus
                                    </NavLink>
                                )}

                                {permissions.canAccessHistory && (
                                    <NavLink href={route('history.edit')} active={route().current('history.edit')} className="dark:text-white">
                                        Histoire
                                    </NavLink>
                                )}

                                {permissions.canAccessFMA && (
                                    <NavLink href={route('chord.edit')} active={route().current('chord.edit')} className="dark:text-white">
                                        FMA
                                    </NavLink>
                                )}

                                <NavLink href={route('welcome')} className="dark:text-white">
                                    Retour
                                </NavLink>

                                <NavLink method="post" href={route('logout')} as="button" className="dark:text-white">
                                    Déconnexion
                                </NavLink>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:bg-gray-700 dark:focus:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:focus:text-white"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        {permissions.canAccessDashboard && (
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="dark:bg-gray-900 dark:text-white">
                                Vue d'ensemble
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800 dark:text-white">{user.first_name} {user.last_name}</div>
                            <div className="font-medium text-sm text-gray-500 dark:text-white">{user.username}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            {permissions.canAccessGeneral && (
                                <ResponsiveNavLink href={route('general.edit')} active={route().current('general.edit')} className="dark:bg-gray-900 dark:text-white">Général</ResponsiveNavLink>
                            )}

                            {permissions.canAccessAccount && (
                                <ResponsiveNavLink href={route('account.edit')} active={route().current('account.edit')} className="dark:bg-gray-900 dark:text-white">Compte</ResponsiveNavLink>
                            )}

                            {permissions.canAccessAccess && (
                                <ResponsiveNavLink href={route('access.edit')} active={route().current('access.edit')} className="dark:bg-gray-900 dark:text-white">Accès</ResponsiveNavLink>
                            )}

                            {permissions.canAccessLitmus && (
                                <ResponsiveNavLink href={route('piece.edit')} active={route().current('piece.edit')} className="dark:bg-gray-900 dark:text-white">LitMus</ResponsiveNavLink>
                            )}

                            {permissions.canAccessHistory && (
                                <ResponsiveNavLink href={route('history.edit')} active={route().current('history.edit')} className="dark:bg-gray-900 dark:text-white">Histoire</ResponsiveNavLink>
                            )}

                            {permissions.canAccessFMA && (
                                <ResponsiveNavLink href={route('chord.edit')} active={route().current('chord.edit')} className="dark:bg-gray-900 dark:text-white">FMA</ResponsiveNavLink>
                            )}

                            <ResponsiveNavLink href={route('welcome')} className="dark:bg-gray-900 dark:text-white">Retour</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="dark:bg-gray-900 dark:text-white">
                                Déconnexion
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
