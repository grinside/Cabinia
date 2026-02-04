import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + config.rateLimitWindow,
    });
    return next();
  }

  if (entry.count >= config.rateLimitMax) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    res.set('Retry-After', String(retryAfter));
    res.set('X-RateLimit-Limit', String(config.rateLimitMax));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(entry.resetTime));

    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter,
    });
  }

  entry.count++;
  rateLimitStore.set(ip, entry);

  res.set('X-RateLimit-Limit', String(config.rateLimitMax));
  res.set('X-RateLimit-Remaining', String(config.rateLimitMax - entry.count));
  res.set('X-RateLimit-Reset', String(entry.resetTime));

  next();
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
