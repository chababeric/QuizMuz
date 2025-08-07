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

    const makeApiCall = useCallback(async (url, payload = {}, options = {}) => {
        try {
            await updateLastActionTime();

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
    }, [updateLastActionTime]);

    return {
        updateLastActionTime,
        makeApiCall
    };
};
