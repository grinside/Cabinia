import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { WalletCard } from '@/components/wallet/WalletCard';
import { TelcoBalanceCard } from '@/components/wallet/TelcoBalanceCard';
import { TransactionList } from '@/components/wallet/TransactionList';
import { PaymentMethodList } from '@/components/wallet/PaymentMethodList';
import { useWalletStore } from '@/stores/walletStore';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/components/auth/AuthModal';

type Tab = 'overview' | 'transactions' | 'methods';

export function WalletPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [transactions, setTransactions] = useState<typeof wallet.transactions>([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const { isAuthenticated } = useAuthStore();
  const {
    wallet,
    telcoBalances,
    isLoading,
    fetchWallet,
    fetchTelcoBalances,
    fetchTransactions,
    refreshTelcoBalance,
    removeTelcoAccount,
  } = useWalletStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
      fetchTelcoBalances();
    }
  }, [isAuthenticated, fetchWallet, fetchTelcoBalances]);

  useEffect(() => {
    if (activeTab === 'transactions' && transactions.length === 0) {
      loadTransactions();
    }
  }, [activeTab]);

  const loadTransactions = async () => {
    const txs = await fetchTransactions(transactionsPage);
    setTransactions((prev) => [...prev, ...txs]);
    setHasMoreTransactions(txs.length === 20);
    setTransactionsPage((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 pb-20">
        <Header title="Wallet" />

        <div className="pt-20 px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-dark-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Sign in to access your wallet</h2>
          <p className="text-dark-400 text-center mb-6">
            Manage your balance, payments, and mobile credits
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
          >
            Sign in
          </button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <Header title="Wallet" />

      <div className="pt-16 px-4">
        {/* Wallet card */}
        {wallet && (
          <div className="mb-6">
            <WalletCard
              wallet={wallet}
              onDeposit={() => console.log('Deposit')}
              onWithdraw={() => console.log('Withdraw')}
              onTransfer={() => console.log('Transfer')}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          {(['overview', 'transactions', 'methods'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Telco balances */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Mobile Balances</h2>
                <button className="flex items-center gap-2 text-primary-500 text-sm">
                  <Plus className="w-4 h-4" />
                  Add account
                </button>
              </div>

              {telcoBalances.length > 0 ? (
                <div className="space-y-4">
                  {telcoBalances.map((balance) => (
                    <TelcoBalanceCard
                      key={balance.id}
                      balance={balance}
                      onRefresh={() => refreshTelcoBalance(balance.id)}
                      onBuyAirtime={() => console.log('Buy airtime')}
                      onBuyData={() => console.log('Buy data')}
                      onRemove={() => removeTelcoAccount(balance.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-dark-800 rounded-2xl">
                  <p className="text-dark-400">No mobile accounts linked</p>
                  <button className="text-primary-500 text-sm mt-2">
                    Add your first account
                  </button>
                </div>
              )}

              {/* Recent transactions */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-primary-500 text-sm"
                  >
                    See all
                  </button>
                </div>
                {wallet && (
                  <TransactionList
                    transactions={wallet.transactions.slice(0, 5)}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TransactionList
                transactions={transactions}
                onLoadMore={loadTransactions}
                hasMore={hasMoreTransactions}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {activeTab === 'methods' && (
            <motion.div
              key="methods"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {wallet && (
                <PaymentMethodList
                  methods={wallet.linkedMethods}
                  onAdd={() => console.log('Add method')}
                  onRemove={(id) => console.log('Remove', id)}
                  onSetDefault={(id) => console.log('Set default', id)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
