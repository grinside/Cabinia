import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  login: (phone: string, countryCode: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  pendingPhone: string | null;
  pendingCountryCode: string | null;
  setPending: (phone: string, countryCode: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      pendingPhone: null,
      pendingCountryCode: null,

      setPending: (phone: string, countryCode: string) => {
        set({ pendingPhone: phone, pendingCountryCode: countryCode });
      },

      login: async (phone: string, countryCode: string) => {
        set({ isLoading: true });
        try {
          await authService.requestOtp(phone, countryCode);
          set({
            pendingPhone: phone,
            pendingCountryCode: countryCode,
            isLoading: false
          });
        } catch {
          set({ isLoading: false });
          throw new Error('Failed to send OTP');
        }
      },

      verifyOtp: async (otp: string) => {
        const { pendingPhone, pendingCountryCode } = get();
        if (!pendingPhone || !pendingCountryCode) {
          throw new Error('No pending verification');
        }

        set({ isLoading: true });
        try {
          const response = await authService.verifyOtp(
            pendingPhone,
            pendingCountryCode,
            otp
          );
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            pendingPhone: null,
            pendingCountryCode: null,
          });
        } catch {
          set({ isLoading: false });
          throw new Error('Invalid OTP');
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingPhone: null,
          pendingCountryCode: null,
        });
      },

      updateProfile: async (data: Partial<User>) => {
        const { user, token } = get();
        if (!user || !token) return;

        set({ isLoading: true });
        try {
          const updatedUser = await authService.updateProfile(data, token);
          set({ user: updatedUser, isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error('Failed to update profile');
        }
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const newToken = await authService.refreshToken(token);
          set({ token: newToken });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'cabinia-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
