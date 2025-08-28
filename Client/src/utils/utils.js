// Client/src/utils/utils.js
import * as Location from 'expo-location';

export const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
};

export const parseDate = (input) => {
    if (!input) return null;

    let clean = String(input).trim();

    // Handle SQLite DATETIME format: "2025-08-28 07:22:27"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(clean)) {
        clean = clean.replace(' ', 'T') + 'Z';
    }

    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
};


export const formatTimeAgo = (dateString) => {
    const time = parseDate(dateString);
    if (!time) return '';

    const now = new Date();
    const diff = Math.floor((now - time) / (1000 * 60)); // minutes
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} days ago`;
};

export const truncate = (text, length = 50) => {
    if (!text || typeof text !== 'string') return '';
    const trimmed = text.trim();
    return trimmed.length > length
        ? trimmed.slice(0, length).replace(/\s+\S*$/, '') + '...'
        : trimmed;
};

export default function formatTime(date) {
    const d = parseDate(date);
    if (!d) return '';
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${mins} ${ampm}`;
}

export const formatTimestamp = (timestamp) => {
    const date = parseDate(timestamp);
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
