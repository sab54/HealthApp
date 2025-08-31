// Client/src/utils/config.js
/**
 * config.js
 *
 * This file contains configuration settings for the application. It defines constants that determine the
 * operating modes for development, server selection, and OTP auto-set functionality. It also contains the
 * base URL for the API server and the API key for the OpenWeather API.
 *
 * Features:
 * - `DEV_MODE`: Enables or disables the development mode.
 * - `isLocalServer`: Determines if the application connects to a local server or a remote one.
 * - `autoSetOTP`: Automatically sets OTP for testing purposes (can be disabled).
 * - `External_API_MODE`: Toggles between using an external API or a local version.
 * - `BASE_URL`: The base URL for API requests, set based on the `isLocalServer` flag.
 * - `OPENWEATHER_API_KEY`: The API key for accessing OpenWeather API, enabled only when `External_API_MODE` is true.
 *
 * This file uses the following libraries:
 * - No external libraries; purely application configuration.
 *
 * Dependencies:
 * - None
 *
 * Author: Sunidhi Abhange
 */

export const DEV_MODE = false; // ← Flip this to false to disable mode
export const isLocalServer = true; // ← Flip this to false to disable mode
export const autoSetOTP = true; // ← Flip this to false to disable mode
export const External_API_MODE = true; // ← Flip this to false to enable mode

export const BASE_URL = 'http://18.132.220.135:3000'

export const OPENWEATHER_API_KEY =
    External_API_MODE && '90ddd5a724508a3bd03a126fe9053ad0'; // https://home.openweathermap.org/api_keys

