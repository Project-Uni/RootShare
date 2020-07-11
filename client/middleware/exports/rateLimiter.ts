import * as rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 1000 * 60, // 1 minute window
  max: 100, //Maximum requests per window
  message: 'Maximum requests per minute exceeded.',
  headers: true,
});
