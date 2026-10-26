import { forwardRef, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import Modal from '@/Components/Modal.jsx';
import { Link } from '@inertiajs/react';
import { ChevronIcon, CircleAlertIcon, CircleCheckIcon } from '@/Components/AppIcons';

// Same tokens as the Dashboard so the admin pages read as one system
export const panel = 'rounded-2xl border border-gray-200 bg-white dark:border-gray-700/70 dark:bg-gray-800';
export const muted = 'text-gray-500 dark:text-gray-400';
export const control = 'h-10 rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-[#B4283F] focus:ring-[#B4283F] dark:border-gray-600 dark:bg-gray-900 dark:text-white';
export const textarea = 'w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#B4283F] focus:ring-[#B4283F] dark:border-gray-600 dark:bg-gray-900 dark:text-white';
export const label = 'block text-sm font-medium text-gray-700 dark:text-gray-200';

const buttonBase = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none';
export const buttonPrimary = `${buttonBase} bg-[#B4283F] text-white hover:bg-[#C8304A] focus-visible:ring-[#B4283F]`;
export const buttonDanger = `${buttonBase} bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600`;
export const buttonSecondary = `${buttonBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`;
export const iconButtonDanger = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 motion-reduce:transition-none';

// The forms plugin only styles inputs with an explicit type, so default to text
export const AdminInput = forwardRef(function AdminInput({ type = 'text', className = '', ...props }, ref) {
    return <input ref={ref} type={type} {...props} className={`${control} w-full ${className}`}/>;
});

export function FieldError({ message, className = '' }) {
    if (!message) return null;
    return (
        <p role="alert" className={`flex items-start gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 ${className}`}>
            <CircleAlertIcon className="mt-0.5 h-4 w-4"/>
            {message}
        </p>
    );
}

// Label, input passed as children, then the error under it
export function AdminField({ id, label: text, hint, error, children }) {
    return (
        <div>
            <label htmlFor={id} className={label}>{text}</label>
            <div className="mt-1.5">{children}</div>
            {hint && <p className={`mt-1.5 text-xs ${muted}`}>{hint}</p>}
            <FieldError message={error} className="mt-1.5"/>
        </div>
    );
}

// Short confirmation shown next to a submit button
export function SavedNote({ show, children }) {
    return (
        <Transition
            show={show}
            enter="transition ease-in-out motion-reduce:transition-none"
            enterFrom="opacity-0"
            leave="transition ease-in-out motion-reduce:transition-none"
            leaveTo="opacity-0"
        >
            <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CircleCheckIcon className="h-4 w-4"/>
                {children}
            </p>
        </Transition>
    );
}

export function SectionCard({ id, title, description, action, children, className = '' }) {
    return (
        <section aria-labelledby={id} className={`${panel} flex flex-col overflow-hidden ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <div className="min-w-0">
                    <h2 id={id} className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                    {description && <p className={`mt-0.5 text-sm ${muted}`}>{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export const EmptyState = ({ children }) => (
    <p className={`px-5 py-10 text-center text-sm ${muted}`}>{children}</p>
);

// Dialog content for the shared Modal: title, body, then the action row
export function AdminDialog({ show, onClose, title, children, actions, wide = false }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth={wide ? '2xl' : 'md'}>
            <div className={`w-full p-2 ${wide ? 'sm:w-[38rem]' : 'sm:w-[26rem]'}`}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>
            </div>
        </Modal>
    );
}

// Floating message, cleared after 5 seconds like MessageDisplay
export function Toast({ successMessage, errorMessage, setSuccessMessage, setErrorMessage }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (successMessage || errorMessage) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const isError = Boolean(errorMessage);
    const message = errorMessage || successMessage;

    return (
        <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
            {visible && message && (
                <div
                    role={isError ? 'alert' : 'status'}
                    className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
                        isError
                            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    }`}
                >
                    {isError ? <CircleAlertIcon className="mt-0.5 h-4 w-4"/> : <CircleCheckIcon className="mt-0.5 h-4 w-4"/>}
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}

const formatCount = (value) => Number(value ?? 0).toLocaleString('fr-FR');

// Compact pager: first, last and the pages around the current one, with "…" for the gaps
export const pageItems = (current, last, siblings) => {
    const pages = new Set([1, last, current]);
    for (let offset = 1; offset <= siblings; offset++) {
        pages.add(current - offset);
        pages.add(current + offset);
    }
    const visible = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);
    return visible.flatMap((page, index) => {
        const previous = visible[index - 1];
        if (previous === undefined || page - previous === 1) return [page];
        // A gap of a single page shows that page instead of "…"
        return page - previous === 2 ? [previous + 1, page] : ['…', page];
    });
};

// Footer for a Laravel paginator; linkProps go to every Inertia Link (e.g. only, preserveScroll)
export function Pagination({ paginator, linkProps = {} }) {
    if (paginator.last_page <= 1) return null;

    const current = paginator.current_page;
    const pageUrl = (page) => {
        const url = new URL(paginator.first_page_url, window.location.origin);
        url.searchParams.set('page', page);
        return url.pathname + url.search;
    };
    const pageLink = 'flex h-10 min-w-[2.25rem] sm:min-w-[2.5rem] items-center justify-center rounded-lg px-1.5 sm:px-2 font-medium';
    const idle = 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700';
    const arrow = (page, text, rotate) => page >= 1 && page <= paginator.last_page ? (
        <Link href={pageUrl(page)} {...linkProps} aria-label={text} className={`${pageLink} ${idle}`}>
            <ChevronIcon className={`h-4 w-4 ${rotate}`}/>
        </Link>
    ) : (
        <span aria-hidden="true" className={`${pageLink} text-gray-300 dark:text-gray-600`}>
            <ChevronIcon className={`h-4 w-4 ${rotate}`}/>
        </span>
    );

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 sm:px-5 py-3 text-sm dark:border-gray-700">
            <span className={muted}>
                {formatCount(paginator.from)}–{formatCount(paginator.to)} sur {formatCount(paginator.total)}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1">
                {arrow(current - 1, 'Page précédente', 'rotate-180')}
                {/* Phones: only the current page between the first and last; wider screens add its neighbours */}
                {[[0, 'flex sm:hidden'], [1, 'hidden sm:flex']].map(([siblings, visibility]) => (
                    <div key={siblings} className={`${visibility} items-center gap-0.5 sm:gap-1`}>
                        {pageItems(current, paginator.last_page, siblings).map((item, index) => item === '…' ? (
                            <span key={`gap-${index}`} aria-hidden="true" className={`${pageLink} min-w-[1.5rem] px-0 text-gray-400 dark:text-gray-500`}>…</span>
                        ) : (
                            <Link
                                key={item}
                                href={pageUrl(item)}
                                {...linkProps}
                                aria-label={`Page ${item}`}
                                aria-current={item === current ? 'page' : undefined}
                                className={`${pageLink} ${item === current ? 'bg-[#B4283F] text-white' : idle}`}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                ))}
                {arrow(current + 1, 'Page suivante', '')}
            </div>
        </nav>
    );
}
