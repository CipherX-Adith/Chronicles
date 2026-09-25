import rateLimit from 'express-rate-limit';

// Public submission rate limiter: max 10 requests per 10 minutes per IP
export const submissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many submissions from this connection. Please take a quiet moment and try again later.',
  },
});

// Admin login rate limiter: max 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many sign-in attempts. Please try again in 15 minutes.',
  },
});
