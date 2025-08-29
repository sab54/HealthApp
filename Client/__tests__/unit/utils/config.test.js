// Client/src/utils/config.js
export const DEV_MODE = false; // ← Flip this to false to disable mode
export const isLocalServer = true; // ← Flip this to false to disable mode
export const autoSetOTP = true; // ← Flip this to false to disable mode
export const External_API_MODE = true; // ← Flip this to false to enable mode

export const BASE_URL = isLocalServer
    ? 'http://192.168.1.34:3000'
    : '';

export const OPENWEATHER_API_KEY =
    External_API_MODE && '90ddd5a724508a3bd03a126fe9053ad0'; // https://home.openweathermap.org/api_keys


// export const BASE_URL = 'http://18.133.227.41:3000'

// http://18.133.227.41:3000
