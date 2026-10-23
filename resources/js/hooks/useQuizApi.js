import { useCallback } from 'react';
import axios from 'axios';

export const useQuizApi = () => {
    const updateLastActionTime = useCallback(async () => {
        try {
            await axios.post(route('updateLastActionTime'));
        } catch (error) {
            console.error('Error updating last action time:', error);
        }
    }, []);

    // The quiz routes record the user's activity server-side, so no separate keep-alive call is needed here
    const makeApiCall = useCallback(async (url, payload = {}, options = {}) => {
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            return { success: true, data: response.data };
        } catch (error) {
            console.error(`API call failed for ${url}:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }, []);

    return {
        updateLastActionTime,
        makeApiCall
    };
};
