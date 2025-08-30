// Server/src/middleware/encryptMiddleware.js
/**
 * encryptMiddleware.js
 *
 * This middleware is responsible for encrypting the response payload before sending it to the client. 
 * It ensures that sensitive data is securely encrypted using AES-256-CBC encryption to protect it from unauthorized access.
 *
 * Key functionalities:
 * - **Encryption of Response Payload**: The middleware intercepts the `res.json` function, ensuring that 
 *   the response payload is encrypted before being sent to the client. The encryption uses the specified `ENCRYPTION_KEY` 
 *   and an initialization vector (`IV`) of the specified length.
 * - **Validation of Encryption Settings**: 
 *   - It ensures that the encryption key (`ENCRYPTION_KEY`) is exactly 32 characters long, as required for AES-256 encryption.
 *   - It also validates the length of the IV (`IV_LENGTH`), ensuring it is between 12 and 32 bytes.
 * - **Error Handling**: If any encryption-related error occurs, the middleware logs the error and returns a response 
 *   indicating the failure of the encryption process.
 *
 * Middleware Flow:
 * 1. The middleware checks if the response is ready to be sent (via `res.json`).
 * 2. It intercepts the `res.json` function to perform encryption on the response data.
 * 3. The response data is converted to a JSON string, then encrypted using the provided `ENCRYPTION_KEY` and `IV`.
 * 4. The resulting encrypted payload is formatted as `iv:encryptedData` and returned as the response.
 * 5. If encryption fails, the middleware logs the error and responds with an error message indicating the failure.
 * 
 * Notes:
 * - The encryption key and IV are critical to ensuring the security of the response data. 
 * - This middleware helps protect sensitive information during transmission by making the response payload unreadable 
 *   to unauthorized parties.
 * - The encryption process uses the AES-256-CBC encryption standard to ensure strong data protection.
 *
 * Author: [Your Name]
 */

const crypto = require('crypto');
const Config = require('../../config');

const ENCRYPTION_KEY = Config.domains.resqzone_api.ENCRYPTION_KEY; // Must be 32 chars
const IV_LENGTH = Config.domains.resqzone_api.IV_LENGTH || 16; // 16 bytes default for AES-CBC

// Validate encryption key length
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 characters long (AES-256)');
}

// Validate IV length
if (typeof IV_LENGTH !== 'number' || IV_LENGTH < 12 || IV_LENGTH > 32) {
    throw new Error('IV_LENGTH must be a number between 12–32');
}

function encrypt(plainText) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv
    );

    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

module.exports = (req, res, next) => {
    const originalJson = res.json;

    res.json = (data) => {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = encrypt(jsonString);

            return originalJson.call(res, {
                payload: encrypted,
            });
        } catch (err) {
            console.error('Encryption error:', err.message);

            return originalJson.call(res, {
                success: false,
                error: 'Failed to encrypt response',
            });
        }
    };

    next();
};
