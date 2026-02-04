import { api } from './api';
import type { TelcoBalance, TelcoOperator } from '@/types';

export const telcoService = {
  async getBalances(): Promise<TelcoBalance[]> {
    return api.get<TelcoBalance[]>('/telco/balances');
  },

  async addAccount(phone: string, operatorId: string): Promise<TelcoBalance> {
    return api.post<TelcoBalance>('/telco/accounts', { phone, operatorId });
  },

  async removeAccount(accountId: string): Promise<void> {
    await api.delete(`/telco/accounts/${accountId}`);
  },

  async refreshBalance(accountId: string): Promise<TelcoBalance> {
    return api.post<TelcoBalance>(`/telco/accounts/${accountId}/refresh`);
  },

  async getOperators(country?: string): Promise<TelcoOperator[]> {
    return api.get<TelcoOperator[]>('/telco/operators', { country });
  },

  async buyAirtime(params: {
    accountId: string;
    amount: number;
    useWallet: boolean;
  }): Promise<{
    success: boolean;
    newBalance: number;
    transaction: { id: string; amount: number };
  }> {
    return api.post('/telco/airtime/purchase', params);
  },

  async buyData(params: {
    accountId: string;
    bundleId: string;
    useWallet: boolean;
  }): Promise<{
    success: boolean;
    newBalance: { remaining: number; total: number; unit: 'MB' | 'GB' };
    transaction: { id: string; amount: number };
  }> {
    return api.post('/telco/data/purchase', params);
  },

  async getDataBundles(operatorId: string): Promise<
    Array<{
      id: string;
      name: string;
      size: number;
      unit: 'MB' | 'GB';
      price: number;
      validity: string;
    }>
  > {
    return api.get(`/telco/operators/${operatorId}/bundles`);
  },

  async verifyPhone(phone: string, operatorId: string): Promise<{
    valid: boolean;
    operatorName?: string;
  }> {
    return api.post('/telco/verify-phone', { phone, operatorId });
  },

  async initiateUssdSession(
    accountId: string,
    action: 'balance' | 'airtime' | 'data'
  ): Promise<{
    ussdCode: string;
    instructions: string;
  }> {
    return api.post(`/telco/accounts/${accountId}/ussd`, { action });
  },
};
