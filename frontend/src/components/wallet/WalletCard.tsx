import { motion } from 'framer-motion';
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { WalletInfo } from '@/types';

interface WalletCardProps {
  wallet: WalletInfo;
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
}

export function WalletCard({ wallet, onDeposit, onWithdraw, onTransfer }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="wallet-card"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm font-medium">Available Balance</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5 text-white/80" />
            ) : (
              <Eye className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <motion.p
            key={showBalance ? 'shown' : 'hidden'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            {showBalance ? formatCurrency(wallet.balance, wallet.currency) : '••••••'}
          </motion.p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <ActionButton
            icon={Plus}
            label="Deposit"
            onClick={onDeposit}
          />
          <ActionButton
            icon={ArrowUpRight}
            label="Withdraw"
            onClick={onWithdraw}
          />
          <ActionButton
            icon={Repeat}
            label="Transfer"
            onClick={onTransfer}
          />
        </div>
      </div>

      {/* Card decoration */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10" />
      <div className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/10" />
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
    >
      <Icon className="w-5 h-5 text-white" />
      <span className="text-white text-xs font-medium">{label}</span>
    </button>
  );
}
