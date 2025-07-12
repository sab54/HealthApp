import { BASE_URL } from './config';

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
