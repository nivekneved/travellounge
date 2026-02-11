import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the base URL based on the environment
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    if (Constants.expoConfig?.hostUri) {
        const host = Constants.expoConfig.hostUri.split(':')[0];
        return `http://${host}:5000/api`;
    }

    // Fallback for emulator/simulator
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
};

const api = {
    post: async (endpoint, data) => {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        return response.json();
    },
    get: async (endpoint) => {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        return response.json();
    }
};

export default api;
