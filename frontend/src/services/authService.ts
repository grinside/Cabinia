import { api } from './api';
import type { User } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async requestOtp(phone: string, countryCode: string): Promise<void> {
    await api.post('/auth/otp/request', { phone, countryCode });
  },

  async verifyOtp(
    phone: string,
    countryCode: string,
    otp: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/otp/verify', {
      phone,
      countryCode,
      otp,
    });
    api.setToken(response.token);
    return response;
  },

  async refreshToken(token: string): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/refresh', {
      token,
    });
    api.setToken(response.token);
    return response.token;
  },

  async updateProfile(data: Partial<User>, _token: string): Promise<User> {
    return api.patch<User>('/auth/profile', data);
  },

  logout(): void {
    api.setToken(null);
    localStorage.removeItem('cabinia-auth');
  },

  async checkPhoneExists(phone: string, countryCode: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>('/auth/check-phone', {
      phone,
      countryCode,
    });
    return response.exists;
  },
};
