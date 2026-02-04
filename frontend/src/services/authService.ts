import type { User } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

// Demo user for standalone mode
const DEMO_USER: User = {
  id: 'demo-user-1',
  phone: '225XXXXXXXX',
  countryCode: 'CI',
  displayName: 'Demo User',
  avatar: 'https://i.pravatar.cc/150?u=demo',
  createdAt: new Date(),
  preferences: {
    language: 'fr',
    currency: 'XOF',
    notificationsEnabled: true,
    autoplayEnabled: true,
    dataMode: 'auto',
    categories: ['entertainment', 'music', 'comedy'],
  },
  wallet: {
    id: 'wallet-1',
    balance: 25000,
    currency: 'XOF',
    linkedMethods: [],
    transactions: [],
  },
  telcoBalances: [],
};

// Store OTP in memory for demo (in real app, this is server-side)
let pendingOtp: string | null = null;

export const authService = {
  async requestOtp(phone: string, _countryCode: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a demo OTP (always 123456 for demo)
    pendingOtp = '123456';
    console.log(`[Demo] OTP for ${phone}: ${pendingOtp}`);
  },

  async verifyOtp(
    phone: string,
    countryCode: string,
    otp: string
  ): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In demo mode, accept '123456' as valid OTP
    if (otp !== '123456' && otp !== pendingOtp) {
      throw new Error('Invalid OTP');
    }

    pendingOtp = null;

    const user: User = {
      ...DEMO_USER,
      phone,
      countryCode,
    };

    const token = 'demo-token-' + Date.now();

    return { user, token };
  },

  async refreshToken(_token: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'demo-token-' + Date.now();
  },

  async updateProfile(data: Partial<User>, _token: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...DEMO_USER, ...data };
  },

  logout(): void {
    localStorage.removeItem('cabinia-auth');
  },

  async checkPhoneExists(_phone: string, _countryCode: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return false; // In demo, phone never exists
  },
};
