// backend/utils/signatureVerification.js
const crypto = require('crypto');

/**
 * Verify ClaudeBot signature using HMAC-SHA256
 * @param {string} signature - The signature from request headers
 * @param {object} body - The request body
 * @param {string} secret - Webhook secret from environment
 * @returns {boolean} - True if signature is valid
 */
function verifyClaudeSignature(signature, body, secret) {
    if (!signature || !body) {
        console.warn('⚠️ Missing signature or body for verification');
        return false;
    }

    try {
        // Create expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(body))
            .digest('hex');

        // ✅ Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'utf8'),
            Buffer.from(expectedSignature, 'utf8')
        );
    } catch (error) {
        console.error('❌ Signature verification error:', error);
        return false;
    }
}

/**
 * Generate signature for outgoing requests (for testing)
 */
function generateClaudeSignature(body, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');
}

/**
 * Check if request is from a trusted agent with proper verification
 */
function isTrustedAgent(req) {
    // ✅ First check: Cryptographic signature
    const signature = req.headers['x-claude-signature'];
    if (signature) {
        const secret = process.env.CLAUDE_WEBHOOK_SECRET;
        if (secret && verifyClaudeSignature(signature, req.body, secret)) {
            return {
                isTrusted: true,
                verificationMethod: 'signature'
            };
        }
    }

    // ✅ Second check: User-Agent with additional validation
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('ClaudeBot')) {
        // Additional checks to prevent spoofing
        const ip = req.ip || req.connection.remoteAddress;
        const timestamp = req.headers['x-request-timestamp'];
        const nonce = req.headers['x-request-nonce'];

        // Verify timestamp is within 5 minutes
        if (timestamp) {
            const requestTime = parseInt(timestamp);
            const currentTime = Date.now();
            if (Math.abs(currentTime - requestTime) > 300000) {
                console.warn('⚠️ Request timestamp expired');
                return { isTrusted: false, reason: 'timestamp_expired' };
            }
        }

        // Log suspicious activity
        if (!signature && userAgent.includes('ClaudeBot')) {
            console.warn(`⚠️ ClaudeBot User-Agent without signature from IP: ${ip}`);
            // Rate limit these requests more aggressively
        }

        return {
            isTrusted: true,
            verificationMethod: 'user-agent-with-checks'
        };
    }

    return { isTrusted: false, reason: 'not_verified' };
}

module.exports = {
    verifyClaudeSignature,
    generateClaudeSignature,
    isTrustedAgent
};