const helmet = require("helmet");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5500";

const helmetMiddleware = helmet({
  crossOriginEmbedderPolicy: false,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.gstatic.com",
        "https://apis.google.com",
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],

      imgSrc: ["'self'", "data:", "https:"],

      connectSrc: ["'self'", FRONTEND_URL],
    },
  },
});

module.exports = helmetMiddleware;