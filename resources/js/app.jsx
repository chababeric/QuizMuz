import './bootstrap';
import '../css/app.css';

import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Online presence: while a logged-in page is open and visible, check in every minute.
// The dashboard counts a user as online if one of their sessions checked in recently.
const HEARTBEAT_INTERVAL = 60_000;
const MIN_HEARTBEAT_GAP = 15_000;
let isLoggedIn = false;
let lastHeartbeat = 0;

const sendHeartbeat = () => {
    const now = Date.now();
    if (!isLoggedIn || document.visibilityState !== 'visible' || now - lastHeartbeat < MIN_HEARTBEAT_GAP) {
        return;
    }
    lastHeartbeat = now;
    axios.post('/heartbeat').catch(() => {});
};

const startHeartbeat = (initialPage) => {
    isLoggedIn = Boolean(initialPage.props.auth?.user);
    router.on('navigate', (event) => {
        isLoggedIn = Boolean(event.detail.page.props.auth?.user);
    });
    setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    document.addEventListener('visibilitychange', sendHeartbeat);
};

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        startHeartbeat(props.initialPage);

        // Only hydrate when the SSR server actually rendered the page; otherwise render from scratch
        if (import.meta.env.DEV || !el.hasChildNodes()) {
            createRoot(el).render(<App {...props} />);
            return
        }

        hydrateRoot(el, <App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
