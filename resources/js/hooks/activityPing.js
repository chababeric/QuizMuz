import axios from 'axios';

// The server records activity at most once a minute (UpdateLastActionTime middleware),
// so sending more often only adds requests. The 20 minute timeout leaves plenty of margin.
const PING_INTERVAL_MS = 60_000;
let lastPingAt = 0;

export const pingActivity = () => {
    const now = Date.now();
    if (now - lastPingAt < PING_INTERVAL_MS) return Promise.resolve();
    lastPingAt = now;

    return axios.post(route('updateLastActionTime'))
        .catch((error) => {
            // Let the next interaction try again
            lastPingAt = 0;
            console.error('Error updating last action time:', error);
        });
};
