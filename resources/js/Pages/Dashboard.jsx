import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronIcon, TrophyIcon } from '@/Components/AppIcons';
import { Pagination } from '@/Components/AdminUi';

const ONLINE_REFRESH_MS = 30_000;
const DAY_MS = 24 * 60 * 60 * 1000;

const panel = 'rounded-2xl border border-gray-200 bg-white dark:border-gray-700/70 dark:bg-gray-800';
const panelTitle = 'text-base font-semibold text-gray-900 dark:text-white';
const muted = 'text-gray-500 dark:text-gray-400';
const control = 'h-10 rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-[#B4283F] focus:ring-[#B4283F] dark:border-gray-600 dark:bg-gray-900 dark:text-white';
const formatNumber = (value) => Number(value ?? 0).toLocaleString('fr-FR');

const STATUS = {
    online: { label: 'En ligne', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
    active: { label: 'Actif', dot: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-400' },
    idle: { label: 'Hors ligne', dot: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-300' },
    inactive: { label: 'Inactif', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
    never: { label: 'Jamais connecté', dot: 'border border-gray-400 bg-transparent', text: 'text-gray-500 dark:text-gray-400' },
};

// Online comes from live sessions; the rest from the last recorded action
const getStatus = (user, isOnline, now, kpis) => {
    if (isOnline) return 'online';
    if (!user.lastActionTime) return 'never';
    if (!now) return 'idle';
    const days = (now - parseISO(user.lastActionTime)) / DAY_MS;
    if (days <= kpis.activeDays) return 'active';
    if (days > kpis.inactiveDays) return 'inactive';
    return 'idle';
};

const StatusBadge = ({ status }) => {
    const style = STATUS[status];
    return (
        <span className={`inline-flex items-center gap-2 text-sm font-medium ${style.text}`}>
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${style.dot}`}></span>
            {style.label}
        </span>
    );
};

// Relative times depend on the viewer's clock, so they render after mount only
const RelativeTime = ({ value, now }) => {
    if (!value) return <span className={muted}>—</span>;
    const date = parseISO(value);
    return (
        <time dateTime={value} title={format(date, 'PPpp', { locale: fr })}>
            {now ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : format(date, 'P', { locale: fr })}
        </time>
    );
};

const Kpi = ({ label, value, hint, accent, live }) => (
    <div className={`${panel} p-4`}>
        <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide ${muted}`}>
            {live && (
                <span aria-hidden="true" className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
            )}
            {label}
        </div>
        <div className={`mt-2 text-3xl font-bold tabular-nums ${accent ?? 'text-gray-900 dark:text-white'}`}>{value}</div>
        {hint && <div className={`mt-1 text-xs ${muted}`}>{hint}</div>}
    </div>
);

const SortHeader = ({ label, column, filters, onSort, className = '' }) => {
    const isActive = filters.sort === column;
    const nextDirection = isActive && filters.direction === 'desc' ? 'asc' : 'desc';
    return (
        <th scope="col" className={`px-4 py-3 ${className}`} aria-sort={isActive ? (filters.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button type="button" onClick={() => onSort(column, nextDirection)} className="inline-flex items-center gap-1 font-semibold hover:text-gray-900 dark:hover:text-white">
                {label}
                <ChevronIcon className={`h-3.5 w-3.5 ${isActive ? '' : 'opacity-30'} ${isActive && filters.direction === 'asc' ? '-rotate-90' : 'rotate-90'}`}/>
            </button>
        </th>
    );
};

function UserPanel({ user, status, now, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div aria-hidden="true" className="absolute inset-0 bg-gray-900/50" onClick={onClose}></div>
            <aside role="dialog" aria-modal="true" aria-labelledby="user-panel-title" className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800">
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700">
                    <div className="min-w-0">
                        <h2 id="user-panel-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className={`text-sm ${muted}`}>{user.username} · {user.institution ?? 'Sans institution'}</p>
                    </div>
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span aria-hidden="true" className="text-xl leading-none">×</span>
                    </button>
                </div>

                <dl className="grid grid-cols-2 gap-4 border-b border-gray-200 p-5 text-sm dark:border-gray-700">
                    <div><dt className={muted}>Statut</dt><dd className="mt-1"><StatusBadge status={status}/></dd></div>
                    <div><dt className={muted}>Dernière activité</dt><dd className="mt-1 text-gray-900 dark:text-white"><RelativeTime value={user.lastActionTime} now={now}/></dd></div>
                    <div><dt className={muted}>Inscrit</dt><dd className="mt-1 text-gray-900 dark:text-white"><RelativeTime value={user.createdAt} now={now}/></dd></div>
                    <div><dt className={muted}>Quiz · Pratique</dt><dd className="mt-1 tabular-nums text-gray-900 dark:text-white">{formatNumber(user.quiz)} · {formatNumber(user.practice)}</dd></div>
                </dl>

                <div className="p-5">
                    <h3 className={panelTitle}>Par cours</h3>
                    {user.courses.length === 0 ? (
                        <p className={`mt-3 text-sm ${muted}`}>Aucune donnée disponible pour cet utilisateur.</p>
                    ) : (
                        <ul className="mt-3 space-y-3">
                            {user.courses.map((course) => (
                                <li key={course.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <p className="font-semibold text-gray-900 dark:text-white">{course.name}</p>
                                    <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                        <div><dt className={muted}>Quiz</dt><dd className="tabular-nums text-gray-900 dark:text-white">{formatNumber(course.quiz)}</dd></div>
                                        <div><dt className={muted}>Pratique</dt><dd className="tabular-nums text-gray-900 dark:text-white">{formatNumber(course.practice)}</dd></div>
                                        <div><dt className={muted}>Score</dt><dd className="tabular-nums text-gray-900 dark:text-white">{formatNumber(course.score)} pts</dd></div>
                                    </dl>
                                    <p className={`mt-2 text-xs ${muted}`}>Dernière utilisation : <RelativeTime value={course.lastUsed} now={now}/></p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default function Dashboard({ auth, kpis, courses, recentLogs, users, filters, filterOptions, onlineWindowMinutes }) {
    const { permissions } = usePage().props;
    const [now, setNow] = useState(null);
    const [online, setOnline] = useState(() => ({ count: kpis.online, ids: new Set(users.data.filter(u => u.isOnline).map(u => u.id)) }));
    const [search, setSearch] = useState(filters.search ?? '');
    const [openCourse, setOpenCourse] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const closePanel = useCallback(() => setSelectedUser(null), []);

    // Clock for relative times, refreshed every minute
    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    // Keep the online count and badges live without reloading the page
    useEffect(() => {
        setOnline({ count: kpis.online, ids: new Set(users.data.filter(u => u.isOnline).map(u => u.id)) });
        const refresh = () => {
            if (document.visibilityState !== 'visible') return;
            axios.get(route('dashboard.online'))
                .then(({ data }) => setOnline({ count: data.count, ids: new Set(data.userIds) }))
                .catch(() => {});
        };
        const timer = setInterval(refresh, ONLINE_REFRESH_MS);
        return () => clearInterval(timer);
    }, [kpis.online, users.data]);

    const applyFilters = (changes) => {
        const params = { ...filters, ...changes };
        Object.keys(params).forEach((key) => (params[key] === '' || params[key] == null) && delete params[key]);
        router.get(route('dashboard'), params, { preserveState: true, preserveScroll: true, replace: true, only: ['users', 'filters'] });
    };

    // Search as you type, debounced
    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(() => applyFilters({ search }), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const hasFilters = Boolean(filters.search || filters.institution || filters.course || filters.status);
    const signupDelta = kpis.newThisMonth - kpis.newLastMonth;
    const percentOfUsers = (value) => kpis.totalUsers ? `${Math.round((value / kpis.totalUsers) * 100)} % des utilisateurs` : null;
    const statusOf = (user) => getStatus(user, online.ids.has(user.id), now, kpis);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Vue d'ensemble</h2>}
        >
            <Head title="Admin - Aperçu" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

                {/* Key figures */}
                <section aria-label="Statistiques" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <Kpi label="Utilisateurs" value={formatNumber(kpis.totalUsers)} hint="Toutes institutions"/>
                    <Kpi label="En ligne" live value={formatNumber(online.count)} accent="text-emerald-600 dark:text-emerald-400" hint={`Actifs dans les ${String(onlineWindowMinutes).replace('.', ',')} dernières min`}/>
                    <Kpi label={`Actifs ${kpis.activeDays} j`} value={formatNumber(kpis.active7)} hint={percentOfUsers(kpis.active7)}/>
                    <Kpi label={`Inactifs ${kpis.inactiveDays} j+`} value={formatNumber(kpis.inactive)} accent="text-amber-600 dark:text-amber-400" hint="Incluant jamais connectés"/>
                    <Kpi
                        label="Nouveaux ce mois"
                        value={formatNumber(kpis.newThisMonth)}
                        hint={`${signupDelta >= 0 ? '+' : '−'}${Math.abs(signupDelta)} vs le mois dernier (${kpis.newLastMonth})`}
                    />
                    <Kpi label="Quiz · Pratique" value={`${formatNumber(kpis.totalQuiz)} · ${formatNumber(kpis.totalPractice)}`} hint="Parties au total"/>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Courses */}
                    <section aria-labelledby="courses-title" className={`${panel} lg:col-span-2 overflow-hidden`}>
                        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <h3 id="courses-title" className={panelTitle}>Cours</h3>
                            <span className={`text-sm ${muted}`}>{courses.length} cours</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className={`text-xs uppercase tracking-wide ${muted}`}>
                                    <tr>
                                        <th scope="col" className="px-5 py-3 font-semibold">Cours</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Élèves</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Actifs {kpis.activeDays} j</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Quiz</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Pratique</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Niveaux</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                    {courses.map((course) => {
                                        const isOpen = openCourse === course.id;
                                        return [
                                            <tr key={course.id} className="text-gray-900 dark:text-gray-100">
                                                <td className="px-5 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenCourse(isOpen ? null : course.id)}
                                                        aria-expanded={isOpen}
                                                        aria-controls={`course-details-${course.id}`}
                                                        className="flex items-start gap-2 text-left"
                                                    >
                                                        <ChevronIcon className={`mt-0.5 h-4 w-4 text-gray-400 ${isOpen ? 'rotate-90' : ''}`}/>
                                                        <span>
                                                            <span className="block font-semibold">{course.name}</span>
                                                            <span className={`block text-xs ${muted}`}>{course.institution ?? '—'}</span>
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(course.students)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(course.active7)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(course.quiz)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(course.practice)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="tabular-nums">{course.levels.length}</span>
                                                    {course.emptyLevels > 0 && (
                                                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">{course.emptyLevels} vide{course.emptyLevels > 1 ? 's' : ''}</span>
                                                    )}
                                                    {course.lockedLevels > 0 && (
                                                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">{course.lockedLevels} verrouillé{course.lockedLevels > 1 ? 's' : ''}</span>
                                                    )}
                                                </td>
                                            </tr>,
                                            isOpen && (
                                                <tr key={`${course.id}-details`} id={`course-details-${course.id}`} className="bg-gray-50 dark:bg-gray-900/40">
                                                    <td colSpan={6} className="px-5 py-4">
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div>
                                                                <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${muted}`}>Contenu par niveau</h4>
                                                                {course.levels.length === 0 ? <p className={`text-sm ${muted}`}>Aucun niveau.</p> : (
                                                                    <ul className="space-y-1 text-sm">
                                                                        {course.levels.map((level) => (
                                                                            <li key={level.id} className="flex items-center justify-between gap-3">
                                                                                <span className="text-gray-900 dark:text-gray-100">
                                                                                    {level.name}
                                                                                    {level.institution && <span className={`ml-2 text-xs ${muted}`}>{level.institution}</span>}
                                                                                    {!level.isEnabled && <span className={`ml-2 text-xs ${muted}`}>(verrouillé)</span>}
                                                                                </span>
                                                                                <span className={`tabular-nums ${level.items === 0 ? 'font-semibold text-amber-700 dark:text-amber-400' : muted}`}>
                                                                                    {level.items} élément{level.items > 1 ? 's' : ''}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${muted}`}>Meilleurs scores</h4>
                                                                {course.topScores.length === 0 ? <p className={`text-sm ${muted}`}>Aucun score.</p> : (
                                                                    <ol className="space-y-1 text-sm">
                                                                        {course.topScores.map((entry, index) => (
                                                                            <li key={`${entry.username}-${index}`} className="flex items-center justify-between gap-3">
                                                                                <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                                                                    <TrophyIcon className={`h-4 w-4 ${['text-amber-500', 'text-gray-400', 'text-orange-400'][index]}`}/>
                                                                                    {entry.name || entry.username}
                                                                                </span>
                                                                                <span className="tabular-nums font-medium text-gray-900 dark:text-gray-100">{formatNumber(entry.score)} pts</span>
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        ];
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Recent admin actions */}
                    <section aria-labelledby="logs-title" className={`${panel} flex flex-col`}>
                        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <h3 id="logs-title" className={panelTitle}>Activité récente</h3>
                            {permissions?.canAccessLogs && (
                                <Link href={route('logs.edit')} className="text-sm font-medium text-[#B4283F] hover:underline dark:text-[#F07A8D]">Registres</Link>
                            )}
                        </div>
                        {recentLogs.length === 0 ? (
                            <p className={`p-5 text-sm ${muted}`}>Aucune action récente.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                {recentLogs.map((log) => (
                                    <li key={log.id} className="px-5 py-3">
                                        <div className="flex items-center justify-between gap-3 text-xs">
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{log.action}</span>
                                            <span className={muted}><RelativeTime value={log.createdAt} now={now}/></span>
                                        </div>
                                        <div
                                            className="mt-1 line-clamp-2 text-sm text-gray-700 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{ __html: log.description }}
                                        />
                                        {log.user && <p className={`mt-0.5 text-xs ${muted}`}>par {log.user}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Users */}
                <section aria-labelledby="users-title" className={`${panel} overflow-hidden`}>
                    <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-4">
                            <h3 id="users-title" className={panelTitle}>Utilisateurs</h3>
                            <span className={`text-sm ${muted}`}>{formatNumber(users.total)} résultat{users.total > 1 ? 's' : ''}</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px_180px_auto]">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un nom ou un nom d'utilisateur"
                                aria-label="Rechercher un utilisateur"
                                className={control}
                            />
                            <select aria-label="Institution" value={filters.institution ?? ''} onChange={(e) => applyFilters({ institution: e.target.value })} className={control}>
                                <option value="">Toutes les institutions</option>
                                {filterOptions.institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                            <select aria-label="Cours" value={filters.course ?? ''} onChange={(e) => applyFilters({ course: e.target.value })} className={control}>
                                <option value="">Tous les cours</option>
                                {filterOptions.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                            <select aria-label="Statut" value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className={control}>
                                <option value="">Tous les statuts</option>
                                <option value="online">En ligne</option>
                                <option value="active">Actifs {kpis.activeDays} j</option>
                                <option value="inactive">Inactifs {kpis.inactiveDays} j+</option>
                                <option value="never">Jamais connectés</option>
                            </select>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); router.get(route('dashboard'), {}, { preserveScroll: true, replace: true, only: ['users', 'filters'] }); }}
                                    className="h-10 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className={`sticky top-0 bg-gray-50 text-xs uppercase tracking-wide dark:bg-gray-900/40 ${muted}`}>
                                <tr>
                                    <SortHeader label="Utilisateur" column="name" filters={filters} onSort={(sort, direction) => applyFilters({ sort, direction })} className="pl-5"/>
                                    <SortHeader label="Institution" column="institution" filters={filters} onSort={(sort, direction) => applyFilters({ sort, direction })}/>
                                    <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                                    <SortHeader label="Dernière activité" column="last_activity" filters={filters} onSort={(sort, direction) => applyFilters({ sort, direction })}/>
                                    <SortHeader label="Quiz · Pratique" column="activity" filters={filters} onSort={(sort, direction) => applyFilters({ sort, direction })} className="text-right"/>
                                    <SortHeader label="Inscrit" column="created" filters={filters} onSort={(sort, direction) => applyFilters({ sort, direction })}/>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                {users.data.length === 0 ? (
                                    <tr><td colSpan={6} className={`px-5 py-10 text-center ${muted}`}>Aucun utilisateur ne correspond à ces filtres.</td></tr>
                                ) : users.data.map((user) => (
                                    <tr key={user.id} className="text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/40">
                                        <td className="py-3 pl-5 pr-4">
                                            <button type="button" onClick={() => setSelectedUser(user)} className="text-left">
                                                <span className="block font-semibold hover:underline">{user.lastName}, {user.firstName}</span>
                                                <span className={`block text-xs ${muted}`}>{user.username}</span>
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">{user.institution ?? <span className={muted}>—</span>}</td>
                                        <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={statusOf(user)}/></td>
                                        <td className="whitespace-nowrap px-4 py-3"><RelativeTime value={user.lastActionTime} now={now}/></td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatNumber(user.quiz)} · {formatNumber(user.practice)}</td>
                                        <td className={`whitespace-nowrap px-4 py-3 ${muted}`}>{user.createdAt ? format(parseISO(user.createdAt), 'P', { locale: fr }) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination paginator={users} linkProps={{ only: ['users', 'filters'], preserveScroll: true, preserveState: true }}/>
                </section>

                <p className={`text-xs ${muted}`}>
                    « En ligne » : une page de QuizMuz ouverte et visible dans les {String(onlineWindowMinutes).replace('.', ',')} dernières minutes. Mis à jour toutes les 30 secondes.
                </p>
            </div>

            {selectedUser && (
                <UserPanel user={selectedUser} status={statusOf(selectedUser)} now={now} onClose={closePanel}/>
            )}
        </AuthenticatedLayout>
    );
}
