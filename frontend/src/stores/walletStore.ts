import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WalletInfo,
  PaymentMethod,
  Transaction,
  TelcoBalance
} from '@/types';
import { walletService } from '@/services/walletService';
import { telcoService } from '@/services/telcoService';

interface WalletStore {
  wallet: WalletInfo | null;
  telcoBalances: TelcoBalance[];
  isLoading: boolean;
  error: string | null;

  // Wallet actions
  fetchWallet: () => Promise<void>;
  deposit: (amount: number, methodId: string) => Promise<Transaction>;
  withdraw: (amount: number, methodId: string) => Promise<Transaction>;
  transfer: (amount: number, recipientPhone: string) => Promise<Transaction>;

  // Payment methods
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultMethod: (methodId: string) => Promise<void>;

  // Telco actions
  fetchTelcoBalances: () => Promise<void>;
  addTelcoAccount: (phone: string, operatorId: string) => Promise<void>;
  removeTelcoAccount: (accountId: string) => Promise<void>;
  refreshTelcoBalance: (accountId: string) => Promise<void>;

  // Transaction history
  fetchTransactions: (page?: number) => Promise<Transaction[]>;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallet: null,
      telcoBalances: [],
      isLoading: false,
      error: null,

      fetchWallet: async () => {
        set({ isLoading: true, error: null });
        try {
          const wallet = await walletService.getWallet();
          set({ wallet, isLoading: false });
        } catch {
          set({ error: 'Failed to fetch wallet', isLoading: false });
        }
      },

      deposit: async (amount: number, methodId: string) => {
        set({ isLoading: true, error: null });
        try {
          const transaction = await walletService.deposit(amount, methodId);

          // Update wallet balance
          const { wallet } = get();
          if (wallet && transaction.status === 'completed') {
            set({
              wallet: {
                ...wallet,
                balance: wallet.balance + amount,
                transactions: [transaction, ...wallet.transactions],
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          return transaction;
        } catch {
          set({ error: 'Deposit failed', isLoading: false });
          throw new Error('Deposit failed');
        }
      },

      withdraw: async (amount: number, methodId: string) => {
        const { wallet } = get();
        if (!wallet || wallet.balance < amount) {
          throw new Error('Insufficient balance');
        }

        set({ isLoading: true, error: null });
        try {
          const transaction = await walletService.withdraw(amount, methodId);

          if (transaction.status === 'completed' || transaction.status === 'pending') {
            set({
              wallet: {
                ...wallet,
                balance: wallet.balance - amount,
                transactions: [transaction, ...wallet.transactions],
              },
              isLoading: false,
            });
          }

          return transaction;
        } catch {
          set({ error: 'Withdrawal failed', isLoading: false });
          throw new Error('Withdrawal failed');
        }
      },

      transfer: async (amount: number, recipientPhone: string) => {
        const { wallet } = get();
        if (!wallet || wallet.balance < amount) {
          throw new Error('Insufficient balance');
        }

        set({ isLoading: true, error: null });
        try {
          const transaction = await walletService.transfer(amount, recipientPhone);

          set({
            wallet: {
              ...wallet,
              balance: wallet.balance - amount,
              transactions: [transaction, ...wallet.transactions],
            },
            isLoading: false,
          });

          return transaction;
        } catch {
          set({ error: 'Transfer failed', isLoading: false });
          throw new Error('Transfer failed');
        }
      },

      addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>) => {
        set({ isLoading: true, error: null });
        try {
          const newMethod = await walletService.addPaymentMethod(method);
          const { wallet } = get();
          if (wallet) {
            set({
              wallet: {
                ...wallet,
                linkedMethods: [...wallet.linkedMethods, newMethod],
              },
              isLoading: false,
            });
          }
        } catch {
          set({ error: 'Failed to add payment method', isLoading: false });
          throw new Error('Failed to add payment method');
        }
      },

      removePaymentMethod: async (methodId: string) => {
        set({ isLoading: true, error: null });
        try {
          await walletService.removePaymentMethod(methodId);
          const { wallet } = get();
          if (wallet) {
            set({
              wallet: {
                ...wallet,
                linkedMethods: wallet.linkedMethods.filter((m) => m.id !== methodId),
              },
              isLoading: false,
            });
          }
        } catch {
          set({ error: 'Failed to remove payment method', isLoading: false });
        }
      },

      setDefaultMethod: async (methodId: string) => {
        set({ isLoading: true, error: null });
        try {
          await walletService.setDefaultMethod(methodId);
          const { wallet } = get();
          if (wallet) {
            set({
              wallet: {
                ...wallet,
                linkedMethods: wallet.linkedMethods.map((m) => ({
                  ...m,
                  isDefault: m.id === methodId,
                })),
              },
              isLoading: false,
            });
          }
        } catch {
          set({ error: 'Failed to set default method', isLoading: false });
        }
      },

      fetchTelcoBalances: async () => {
        set({ isLoading: true, error: null });
        try {
          const balances = await telcoService.getBalances();
          set({ telcoBalances: balances, isLoading: false });
        } catch {
          set({ error: 'Failed to fetch telco balances', isLoading: false });
        }
      },

      addTelcoAccount: async (phone: string, operatorId: string) => {
        set({ isLoading: true, error: null });
        try {
          const account = await telcoService.addAccount(phone, operatorId);
          set({
            telcoBalances: [...get().telcoBalances, account],
            isLoading: false,
          });
        } catch {
          set({ error: 'Failed to add telco account', isLoading: false });
          throw new Error('Failed to add telco account');
        }
      },

      removeTelcoAccount: async (accountId: string) => {
        set({ isLoading: true, error: null });
        try {
          await telcoService.removeAccount(accountId);
          set({
            telcoBalances: get().telcoBalances.filter((b) => b.id !== accountId),
            isLoading: false,
          });
        } catch {
          set({ error: 'Failed to remove telco account', isLoading: false });
        }
      },

      refreshTelcoBalance: async (accountId: string) => {
        try {
          const updatedBalance = await telcoService.refreshBalance(accountId);
          set({
            telcoBalances: get().telcoBalances.map((b) =>
              b.id === accountId ? updatedBalance : b
            ),
          });
        } catch {
          set({ error: 'Failed to refresh balance' });
        }
      },

      fetchTransactions: async (page = 1) => {
        try {
          const transactions = await walletService.getTransactions(page);
          return transactions;
        } catch {
          return [];
        }
      },
    }),
    {
      name: 'cabinia-wallet',
      partialize: (state) => ({
        wallet: state.wallet,
        telcoBalances: state.telcoBalances,
      }),
    }
  )
);
