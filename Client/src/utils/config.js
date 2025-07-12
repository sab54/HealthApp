export const DEV_MODE = true; // ← Flip this to false to disable mode
export const isLocalServer = true; // ← Flip this to false to disable mode
export const autoSetOTP = true; // ← Flip this to false to disable mode

export const BASE_URL = isLocalServer
    ? 'http://192.168.1.100:3000'
    : '';
