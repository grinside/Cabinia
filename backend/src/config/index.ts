import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cabinia',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Twilio (SMS/OTP)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

  // Payment providers
  flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',

  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Feature flags
  enableRecommendations: process.env.ENABLE_RECOMMENDATIONS !== 'false',
  enablePayments: process.env.ENABLE_PAYMENTS !== 'false',
};
