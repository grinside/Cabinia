import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

// In-memory stores (use database in production)
const users = new Map<string, any>();
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Validation schemas
const phoneSchema = z.object({
  phone: z.string().min(8).max(15),
  countryCode: z.string().length(2),
});

const otpVerifySchema = z.object({
  phone: z.string().min(8).max(15),
  countryCode: z.string().length(2),
  otp: z.string().length(6),
});

// Request OTP
router.post('/otp/request', async (req: Request, res: Response) => {
  const { phone, countryCode } = phoneSchema.parse(req.body);
  const fullPhone = `${countryCode}${phone}`;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(fullPhone, {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  // In production, send via Twilio/SMS
  console.log(`OTP for ${fullPhone}: ${otp}`);

  res.json({
    success: true,
    data: { message: 'OTP sent successfully' },
  });
});

// Verify OTP
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, countryCode, otp } = otpVerifySchema.parse(req.body);
  const fullPhone = `${countryCode}${phone}`;

  const storedOtp = otpStore.get(fullPhone);

  if (!storedOtp) {
    throw new AppError('OTP not found or expired', 400, 'OTP_NOT_FOUND');
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(fullPhone);
    throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
  }

  if (storedOtp.attempts >= 3) {
    otpStore.delete(fullPhone);
    throw new AppError('Too many attempts', 400, 'TOO_MANY_ATTEMPTS');
  }

  if (storedOtp.code !== otp) {
    storedOtp.attempts++;
    throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  }

  // OTP verified, delete it
  otpStore.delete(fullPhone);

  // Find or create user
  let user = users.get(fullPhone);

  if (!user) {
    user = {
      id: uuidv4(),
      phone: fullPhone,
      countryCode,
      displayName: null,
      avatar: null,
      createdAt: new Date(),
      preferences: {
        language: 'fr',
        currency: 'XOF',
        notificationsEnabled: true,
        autoplayEnabled: true,
        dataMode: 'auto',
        categories: [],
      },
      wallet: {
        id: uuidv4(),
        balance: 0,
        currency: 'XOF',
        linkedMethods: [],
        transactions: [],
      },
      telcoBalances: [],
    };
    users.set(fullPhone, user);
  }

  // Generate token
  const token = generateToken({ userId: user.id, phone: fullPhone });

  res.json({
    success: true,
    data: { user, token },
  });
});

// Refresh token
router.post('/refresh', authenticate, async (req: Request, res: Response) => {
  const { userId, phone } = req.user!;
  const newToken = generateToken({ userId, phone });

  res.json({
    success: true,
    data: { token: newToken },
  });
});

// Update profile
router.patch('/profile', authenticate, async (req: Request, res: Response) => {
  const { phone } = req.user!;
  const user = users.get(phone);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const allowedFields = ['displayName', 'avatar', 'preferences'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'preferences') {
        user.preferences = { ...user.preferences, ...req.body[field] };
      } else {
        user[field] = req.body[field];
      }
    }
  }

  users.set(phone, user);

  res.json({
    success: true,
    data: user,
  });
});

// Check phone exists
router.get('/check-phone', async (req: Request, res: Response) => {
  const { phone, countryCode } = req.query;
  const fullPhone = `${countryCode}${phone}`;

  res.json({
    success: true,
    data: { exists: users.has(fullPhone) },
  });
});

export default router;
