import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Head, Link } from "@inertiajs/react";
import { format } from 'date-fns';

export default function Edit({ auth, logs }) {
    const getColorClasses = (action) => {
        const actionLower = action.toLowerCase();

        if (actionLower.includes('compte')) {
            return {
                border: 'border-blue-500',
                badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            };
        }
        else if (actionLower.includes('permission')) {
            return {
                border: 'border-red-500',
                badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            };
        }
        else if (actionLower.includes('clé admin')) {
            return {
                border: 'border-green-500',
                badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            };
        }
        else if (actionLower.includes('fma')) {
            return {
                border: 'border-yellow-500',
                badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            };
        }
        else if (actionLower.includes('cours')) {
            return {
                border: 'border-purple-500',
                badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            };
        }
        else if (actionLower.includes('institution')) {
            return {
                border: 'border-pink-500',
                badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
            };
        }
        else if (actionLower.includes('niveau')) {
            return {
                border: 'border-orange-500',
                badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            };
        }
        else if (actionLower.includes('litmus')) {
            return {
                border: 'border-teal-500',
                badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
            };
        }
        else if (actionLower.includes('histoire')) {
            return {
                border: 'border-indigo-500',
                badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
            };
        }

        // Default color scheme
        return {
            border: 'border-gray-500',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">Registres</h2>}
        >
            <Head title="Admin - Registres" />

            <div className="py-12 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {logs?.data?.length > 0 ? (
                        <div className="grid gap-6 mt-6">
                            {logs.data.map((log) => {
                                const colorClasses = getColorClasses(log.action);

                                return (
                                    <div
                                        key={log.id}
                                        className={`p-6 bg-white rounded-lg shadow-md border-l-4 ${colorClasses.border} hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:text-gray-200`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                                        {log.user.first_name} {log.user.last_name}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {format(new Date(log.created_at), 'PPpp')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {log.id}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: log.description }}
                                        />
                                    </div>
                                );
                            })}

                            {logs.last_page > 1 && (
                                <div className="flex items-center justify-between">
                                    {logs.prev_page_url ? (
                                        <Link href={logs.prev_page_url} className="px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                                            Précédent
                                        </Link>
                                    ) : <span />}
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {logs.current_page} sur {logs.last_page}
                                    </span>
                                    {logs.next_page_url ? (
                                        <Link href={logs.next_page_url} className="px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                                            Suivant
                                        </Link>
                                    ) : <span />}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow text-center dark:bg-gray-800">
                            <p className="text-gray-600 dark:text-gray-400">Aucun registre trouvé.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
