// Client/src/utils/api.js
import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const get = async (url, params = {}, headers = {}) => {
    const query = Object.keys(params).length
        ? '?' + Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        : '';

    const response = await fetch(`${BASE_URL}${url}${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text.slice(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'GET request failed');
    }

    return data;
};

// Existing POST
export const post = async (url, body, headers = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text.slice(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'POST request failed');
    }

    return data;
};

export const del = async (url, params = {}, headers = {}) => {
    const query = Object.keys(params).length
        ? '?' + Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        : '';

    const response = await fetch(`${BASE_URL}${url}${query}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text.slice(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'DELETE request failed');
    }

    return data;
};


// Existing PATCH
export const patch = async (url, body, headers = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text.slice(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'PATCH request failed');
    }

    return data;
};

// Existing License Upload
export const verifyDoctorLicense = async (imageUri, userId) => {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        name: 'license.png',
        type: 'image/png',
    });
    formData.append('user_id', userId);

    const response = await fetch(`${BASE_URL}/api/license/upload-license`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${text}`);
    }

    return await response.json();
};
