// src/config/cookieConfig.js

/**
 * Shared cookie configuration to ensure consistent creation and clearing.
 * Using `secure: true` in production ensures cookies are only sent over HTTPS.
 */
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Agar production hai toh true, else false
  sameSite: 'strict', // CSRF protection ke liye strict recommended hai
  path: '/', // Ensure cookie is valid for the entire site
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (Optional, if you use maxAge while setting)
};

module.exports = { cookieConfig };