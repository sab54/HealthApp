// Client/src/utils/api.js
/**
 * api.js
 *
 * This file defines utility functions for making HTTP requests using the `fetch` API. The utility functions 
 * handle various HTTP methods including GET, POST, DELETE, and PATCH, and provide error handling for responses 
 * that do not return JSON or have non-OK status codes. It also includes a function for uploading a doctor's license 
 * as an image file.
 *
 * Features:
 * - `get`: Makes a GET request to the API with query parameters and returns the parsed JSON data.
 * - `post`: Makes a POST request to the API with a JSON body and returns the parsed JSON data.
 * - `del`: Makes a DELETE request to the API with optional query parameters and returns the parsed JSON data.
 * - `patch`: Makes a PATCH request to the API with a JSON body and returns the parsed JSON data.
 * - `verifyDoctorLicense`: Handles the uploading of a doctor's license as a file (image) to the API.
 *
 * Error Handling:
 * - Each request checks for a valid `application/json` content type in the response.
 * - Errors are thrown with appropriate error messages when the response is not OK or content type is invalid.
 *
 * This file uses the following libraries:
 * - `fetch`: Native browser API for making HTTP requests.
 * - `FormData`: For handling the doctor's license file upload.
 *
 * Dependencies:
 * - @react-native-async-storage/async-storage (if using for persistent storage)
 *
 * Author: Sunidhi Abhange
 */

import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const get = async (url, params = {}, headers = {}) => {
    const query = Object.keys(params).length
        ? '?' + Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        : '';

    // console.log('GET:', `${BASE_URL}${url}`, params);
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
