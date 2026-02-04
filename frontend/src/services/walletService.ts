import { api } from './api';
import type { WalletInfo, PaymentMethod, Transaction } from '@/types';

export const walletService = {
  async getWallet(): Promise<WalletInfo> {
    return api.get<WalletInfo>('/wallet');
  },

  async deposit(amount: number, methodId: string): Promise<Transaction> {
    return api.post<Transaction>('/wallet/deposit', { amount, methodId });
  },

  async withdraw(amount: number, methodId: string): Promise<Transaction> {
    return api.post<Transaction>('/wallet/withdraw', { amount, methodId });
  },

  async transfer(amount: number, recipientPhone: string): Promise<Transaction> {
    return api.post<Transaction>('/wallet/transfer', { amount, recipientPhone });
  },

  async getTransactions(page = 1, limit = 20): Promise<Transaction[]> {
    return api.get<Transaction[]>('/wallet/transactions', { page, limit });
  },

  async addPaymentMethod(
    method: Omit<PaymentMethod, 'id'>
  ): Promise<PaymentMethod> {
    return api.post<PaymentMethod>('/wallet/payment-methods', method);
  },

  async removePaymentMethod(methodId: string): Promise<void> {
    await api.delete(`/wallet/payment-methods/${methodId}`);
  },

  async setDefaultMethod(methodId: string): Promise<void> {
    await api.patch(`/wallet/payment-methods/${methodId}/default`);
  },

  async verifyPaymentMethod(
    methodId: string,
    verificationCode: string
  ): Promise<PaymentMethod> {
    return api.post<PaymentMethod>(
      `/wallet/payment-methods/${methodId}/verify`,
      { code: verificationCode }
    );
  },

  async getPaymentProviders(country: string): Promise<{
    mobileMoney: Array<{ id: string; name: string; icon: string }>;
    cards: Array<{ id: string; name: string; icon: string }>;
    banks: Array<{ id: string; name: string; icon: string }>;
  }> {
    return api.get('/wallet/providers', { country });
  },

  async initiatePayment(params: {
    amount: number;
    methodId: string;
    type: 'deposit' | 'withdrawal';
  }): Promise<{
    transactionId: string;
    redirectUrl?: string;
    ussdCode?: string;
    instructions?: string;
  }> {
    return api.post('/wallet/initiate-payment', params);
  },

  async checkPaymentStatus(
    transactionId: string
  ): Promise<{ status: Transaction['status']; transaction?: Transaction }> {
    return api.get(`/wallet/transactions/${transactionId}/status`);
  },
};
