import rateLimit from 'express-rate-limit';

// Standard response formatter for rate limits
const limitReachedHandler = (req: any, res: any, next: any, options: any) => {
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
    errors: [
      {
        field: 'rate-limit',
        message: 'Request quota exceeded for this time window. Please wait and try again.',
      },
    ],
  });
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 mins for auth routes
  message: 'Too many authentication requests from this IP. Please try again after 15 minutes.',
  statusCode: 429,
  handler: limitReachedHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins for general api routes
  message: 'Too many API requests from this IP. Please try again after 15 minutes.',
  statusCode: 429,
  handler: limitReachedHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
