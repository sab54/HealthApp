/**
 * encryption.js
 *
 * This file contains utility functions for encrypting and decrypting data using AES-256-CBC encryption. It utilizes 
 * the `crypto-js` library and the Web Crypto API to securely handle encryption and decryption operations. The functions 
 * work in React Native by utilizing the `react-native-get-random-values` package to generate random initialization vectors (IVs).
 *
 * Features:
 * - `getRandomBytes`: Generates secure random bytes for initialization vectors (IV) using the Web Crypto API.
 * - `encryptBody`: Encrypts a JavaScript object into a string using AES-256-CBC encryption (with PKCS7 padding).
 *   - Output format: `{ payload: 'ivHex:encryptedHex' }`.
 * - `decryptBody`: Decrypts the encrypted string back into a JavaScript object. Expects input in the format `'ivHex:encryptedHex'`.
 * - Uses `ENCRYPTION_KEY` (32 characters) for AES encryption and decryption.
 *
 * This file uses the following libraries:
 * - `crypto-js`: A library for cryptographic algorithms like AES encryption.
 * - `react-native-get-random-values`: Ensures Web Crypto API works in React Native for generating random values.
 *
 * Dependencies:
 * - crypto-js
 * - react-native-get-random-values
 *
 * Author: Sunidhi Abhange
 */

import 'react-native-get-random-values'; // MUST BE FIRST
import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY, IV_LENGTH } from './config'; // Ensure ENCRYPTION_KEY is 32 characters

/**
 * Generates secure random bytes for IV using Web Crypto API.
 * Works in React Native with `react-native-get-random-values` installed.
 */
const getRandomBytes = (length) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return CryptoJS.lib.WordArray.create(array);
};

/**
 * Encrypt a JS object into AES-256-CBC (CBC mode, PKCS7 padding)
 * Output format: { payload: 'ivHex:encryptedHex' }
 */
export const encryptBody = (bodyObject) => {
    const json = JSON.stringify(bodyObject);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = getRandomBytes(IV_LENGTH);

    const encrypted = CryptoJS.AES.encrypt(json, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    const ivHex = iv.toString(CryptoJS.enc.Hex);
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

    return {
        payload: `${ivHex}:${encryptedHex}`,
    };
};

/**
 * Decrypts AES-256-CBC string back into JS object.
 * Expects input in format: 'ivHex:encryptedHex'
 */
export const decryptBody = (payload) => {
    if (!payload.includes(':')) {
        throw new Error('Invalid payload format');
    }

    const [ivHex, encryptedHex] = payload.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedHex);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedWordArray },
        key,
        {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    const json = decrypted.toString(CryptoJS.enc.Utf8);
    if (!json) {
        throw new Error('Failed to decrypt payload');
    }

    return JSON.parse(json);
};
