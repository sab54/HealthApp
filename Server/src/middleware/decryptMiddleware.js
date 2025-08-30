// Server/src/middleware/decryptMiddleware.js
/**
 * decryptMiddleware.js
 *
 * This middleware is responsible for decrypting the encrypted payloads in the request body and query parameters 
 * to ensure they can be processed correctly in subsequent middleware or route handlers.
 *
 * Key functionalities:
 * - **Decryption of Request Body**: The middleware checks if the request contains a payload in its body (in JSON format). 
 *   If present, it decrypts the payload using the provided encryption key and IV length, then updates the request body with the decrypted data.
 * - **Decryption of Query Parameters**: It also supports the decryption of payloads in query parameters for specific HTTP methods (GET, DELETE, HEAD).
 * - **Error Handling**: If there is an issue with the decryption process, such as an incorrect format or failed decryption, the middleware returns a 400 error with an appropriate message.
 * 
 * Middleware Flow:
 * 1. Check if the request is of type `application/json` and if the body contains a payload to be decrypted.
 * 2. Decrypt the body payload using the provided `ENCRYPTION_KEY` and `IV`.
 * 3. For certain HTTP methods (GET, DELETE, HEAD), check and decrypt query parameters.
 * 4. If the decryption fails (e.g., due to incorrect format or invalid payload), return a 400 error.
 * 5. Otherwise, the decrypted data is passed on to the next middleware or route handler.
 * 
 * Notes:
 * - The middleware ensures that encryption and decryption are properly handled in line with security standards 
 *   to prevent unauthorized access to sensitive data.
 * - The encryption key used must be exactly 32 characters long for proper AES-256 encryption.
 *
 * Author: [Your Name]
 */

const crypto = require('crypto');
const Config = require('../../config');

const ENCRYPTION_KEY = Config.domains.resqzone_api.ENCRYPTION_KEY; // Must be 32 characters (256 bits)
const IV_LENGTH = Config.domains.resqzone_api.IV_LENGTH || 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 characters long (AES-256 key)');
}

function decrypt(encryptedInput) {
    //console.log('encryptedInput: ', encryptedInput);
    const parts = encryptedInput.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted format');

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');

    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    console.log('decrypted: output', decrypted.toString());
    return decrypted.toString();
}

module.exports = (req, res, next) => {
    try {
        // Decrypt JSON body if present
        if (
            req.is('application/json') &&
            typeof req.body === 'object' &&
            req.body.payload
        ) {
            const decrypted = decrypt(req.body.payload);
            req.body = JSON.parse(decrypted);
        }

        // Decrypt query payload for all methods that might send encrypted query
        const methodAllowsQueryPayload = ['GET', 'DELETE', 'HEAD'];
        if (
            methodAllowsQueryPayload.includes(req.method) &&
            req.query?.payload
        ) {
            const decrypted = decrypt(req.query.payload);
            req.query = JSON.parse(decrypted);
        }

        next();
    } catch (err) {
        console.error('Decryption error:', err.message);
        return res.status(400).json({
            success: false,
            error: 'Invalid encrypted payload',
        });
    }
};
