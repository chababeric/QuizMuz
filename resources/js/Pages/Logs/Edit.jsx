import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head } from "@inertiajs/react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EmptyState, Pagination, SectionCard, muted } from '@/Components/AdminUi';

export default function Edit({ auth, logs }) {
    const getColorClasses = (action) => {
        const actionLower = action.toLowerCase();

        if (actionLower.includes('compte')) {
            return {
                dot: 'bg-blue-500',
                badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            };
        }
        else if (actionLower.includes('permission')) {
            return {
                dot: 'bg-red-500',
                badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            };
        }
        else if (actionLower.includes('clé admin')) {
            return {
                dot: 'bg-green-500',
                badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            };
        }
        else if (actionLower.includes('fma')) {
            return {
                dot: 'bg-yellow-500',
                badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            };
        }
        else if (actionLower.includes('cours')) {
            return {
                dot: 'bg-purple-500',
                badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            };
        }
        else if (actionLower.includes('institution')) {
            return {
                dot: 'bg-pink-500',
                badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
            };
        }
        else if (actionLower.includes('niveau')) {
            return {
                dot: 'bg-orange-500',
                badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            };
        }
        else if (actionLower.includes('litmus')) {
            return {
                dot: 'bg-teal-500',
                badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
            };
        }
        else if (actionLower.includes('histoire')) {
            return {
                dot: 'bg-indigo-500',
                badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
            };
        }

        // Default color scheme
        return {
            dot: 'bg-gray-500',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Registres</h2>}
        >
            <Head title="Admin - Registres" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <SectionCard
                    id="logs-title"
                    title="Registres"
                    description={logs?.total ? `${logs.total.toLocaleString('fr-FR')} entrée${logs.total > 1 ? 's' : ''}, de la plus récente à la plus ancienne` : null}
                >
                    {logs?.data?.length > 0 ? (
                        <>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                {logs.data.map((log) => {
                                    const colorClasses = getColorClasses(log.action);

                                    return (
                                        <li key={log.id} className="flex gap-3 px-5 py-4">
                                            <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${colorClasses.dot}`}></span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Utilisateur supprimé'}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses.badge}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                                <div
                                                    className="mt-1 break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                                                    dangerouslySetInnerHTML={{ __html: log.description }}
                                                />
                                            </div>
                                            <div className={`shrink-0 text-right text-xs ${muted}`}>
                                                <time dateTime={log.created_at} className="block whitespace-nowrap">
                                                    {format(new Date(log.created_at), 'd MMM yyyy', { locale: fr })}
                                                </time>
                                                <span className="block whitespace-nowrap">
                                                    {format(new Date(log.created_at), 'HH:mm', { locale: fr })}
                                                </span>
                                                <span className="mt-1 block">ID: {log.id}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <Pagination paginator={logs}/>
                        </>
                    ) : (
                        <EmptyState>Aucun registre trouvé.</EmptyState>
                    )}
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
