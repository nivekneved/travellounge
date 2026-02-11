import axios from 'axios';
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

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
