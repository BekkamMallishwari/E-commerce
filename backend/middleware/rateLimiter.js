/**
 * Rate Limiter Middleware with Advanced Configuration
 * @module middleware/rateLimiter
 */

const rateLimit = require("express-rate-limit");

// ==================== CONSTANTS FROM ENV ====================
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX = parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5;
const SIGNUP_MAX = parseInt(process.env.RATE_LIMIT_SIGNUP_MAX) || 5;
const REFRESH_TOKEN_MAX = parseInt(process.env.RATE_LIMIT_REFRESH_MAX) || 10;
const FORGOT_PASSWORD_MAX = parseInt(process.env.RATE_LIMIT_FORGOT_PASSWORD_MAX) || 3;
const OTP_VERIFY_MAX = parseInt(process.env.RATE_LIMIT_OTP_VERIFY_MAX) || 3;
const RESET_PASSWORD_MAX = parseInt(process.env.RATE_LIMIT_RESET_PASSWORD_MAX) || 3;
const OTP_REQUEST_MAX = parseInt(process.env.RATE_LIMIT_OTP_REQUEST_MAX) || 3;
const OTP_WINDOW_MS = parseInt(process.env.RATE_LIMIT_OTP_WINDOW_MS) || 5 * 60 * 1000; // 5 minutes

// ==================== CUSTOM KEY GENERATOR ====================
const customKeyGenerator = (req) => {
    // Use IP + user ID if available (for authenticated requests)
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `${ip}_${userId}`;
};

// ==================== ON LIMIT REACHED CALLBACK ====================
const onLimitReached = (req, res, options) => {
    const key = customKeyGenerator(req);
    console.warn(`Rate limit exceeded for: ${key} on endpoint: ${req.path}`);
    
    // Log suspicious activity (can be integrated with logging service)
    // logger.warn(`Rate limit exceeded: ${key}`, { path: req.path, ip: req.ip });
};

// ==================== SKIP SUCCESSFUL ATTEMPTS ====================
const skipSuccessfulAttempts = (req) => {
    // Skip rate limiting if request was successful (for login)
    // This is handled by the route handler
    return false;
};

// ==================== LOGIN LIMITER ====================
const loginLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: LOGIN_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    skip: skipSuccessfulAttempts,
    handler: (req, res) => {
        const key = customKeyGenerator(req);
        console.warn(`Login rate limit exceeded for: ${key}`);
        return res.status(429).json({
            success: false,
            message: `Too many login attempts. Please try again after ${DEFAULT_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

// ==================== SIGNUP LIMITER ====================
const signupLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: SIGNUP_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many signup attempts. Please try again after ${DEFAULT_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many signup attempts. Please try again later."
    }
});

// ==================== REFRESH TOKEN LIMITER ====================
const refreshTokenLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: REFRESH_TOKEN_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many refresh requests. Please try again after ${DEFAULT_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// ==================== FORGOT PASSWORD LIMITER ====================
const forgotPasswordLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: FORGOT_PASSWORD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many password reset requests. Please try again after ${DEFAULT_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later."
    }
});

// ==================== OTP VERIFICATION LIMITER (NEW) ====================
const otpVerifyLimiter = rateLimit({
    windowMs: OTP_WINDOW_MS,
    max: OTP_VERIFY_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many OTP verification attempts. Please try again after ${OTP_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many OTP verification attempts. Please try again later."
    }
});

// ==================== RESET PASSWORD LIMITER (NEW) ====================
const resetPasswordLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: RESET_PASSWORD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many reset password attempts. Please try again after ${DEFAULT_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many reset password attempts. Please try again later."
    }
});

// ==================== OTP REQUEST LIMITER (NEW) ====================
const otpRequestLimiter = rateLimit({
    windowMs: OTP_WINDOW_MS,
    max: OTP_REQUEST_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: customKeyGenerator,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: `Too many OTP requests. Please try again after ${OTP_WINDOW_MS / 60000} minutes.`
        });
    },
    onLimitReached: onLimitReached,
    message: {
        success: false,
        message: "Too many OTP requests. Please try again later."
    }
});

// ==================== SUSPICIOUS IP RATE LIMITER (NEW) ====================
const suspiciousIpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown',
    handler: (req, res) => {
        console.error(`Suspicious activity detected from IP: ${req.ip}`);
        return res.status(429).json({
            success: false,
            message: "Too many requests from this IP. Please try again later."
        });
    },
    onLimitReached: (req, res, options) => {
        console.error(`IP blocked: ${req.ip} for suspicious activity`);
    },
    message: {
        success: false,
        message: "Too many requests. Your IP has been flagged."
    }
});

// ==================== EXPORTS ====================
module.exports = {
    // Existing limiters
    loginLimiter,
    signupLimiter,
    refreshTokenLimiter,
    forgotPasswordLimiter,
    
    // New limiters
    otpVerifyLimiter,
    resetPasswordLimiter,
    otpRequestLimiter,
    suspiciousIpLimiter,
    
    // Utility exports for testing
    customKeyGenerator,
    onLimitReached
};