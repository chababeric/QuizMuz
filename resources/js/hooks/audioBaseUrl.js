// Audio files are served from the same origin by default.
// Set VITE_AUDIO_BASE_URL (e.g. https://www.quizmuz.com) to load them from elsewhere, such as in local development.
export const AUDIO_BASE_URL = (import.meta.env.VITE_AUDIO_BASE_URL ?? '').replace(/\/$/, '');
