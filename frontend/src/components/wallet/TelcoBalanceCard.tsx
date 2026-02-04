import { motion } from 'framer-motion';
import { RefreshCw, Phone, Wifi, MessageSquare, MoreVertical } from 'lucide-react';
import type { TelcoBalance } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TelcoBalanceCardProps {
  balance: TelcoBalance;
  onRefresh: () => void;
  onBuyAirtime: () => void;
  onBuyData: () => void;
  onRemove: () => void;
  isRefreshing?: boolean;
}

const OPERATOR_COLORS: Record<string, string> = {
  mtn: 'from-yellow-500 to-yellow-600',
  orange: 'from-orange-500 to-orange-600',
  moov: 'from-blue-500 to-blue-600',
  airtel: 'from-red-500 to-red-600',
  safaricom: 'from-green-500 to-green-600',
  vodafone: 'from-red-600 to-red-700',
};

export function TelcoBalanceCard({
  balance,
  onRefresh,
  onBuyAirtime,
  onBuyData,
  onRemove,
  isRefreshing,
}: TelcoBalanceCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const operatorKey = balance.operator.name.toLowerCase().split(' ')[0];
  const gradient = OPERATOR_COLORS[operatorKey] || 'from-gray-500 to-gray-600';

  const dataPercent = balance.balances.data.total > 0
    ? (balance.balances.data.remaining / balance.balances.data.total) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <img
                src={balance.operator.icon}
                alt={balance.operator.name}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p className="text-white font-semibold">{balance.operator.name}</p>
              <p className="text-white/70 text-sm">{balance.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5 text-white', isRefreshing && 'animate-spin')} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-dark-800 rounded-xl shadow-xl overflow-hidden z-10"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRemove();
                    }}
                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-dark-700 transition-colors"
                  >
                    Remove account
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Airtime */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Airtime</span>
            </div>
            <p className="text-white font-bold">
              {formatCurrency(balance.balances.airtime, 'XOF')}
            </p>
          </div>

          {/* Data */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Data</span>
            </div>
            <p className="text-white font-bold">
              {balance.balances.data.remaining} {balance.balances.data.unit}
            </p>
          </div>

          {/* SMS */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">SMS</span>
            </div>
            <p className="text-white font-bold">{balance.balances.sms}</p>
          </div>
        </div>

        {/* Data progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/70">Data remaining</span>
            <span className="text-white">
              {balance.balances.data.remaining}/{balance.balances.data.total} {balance.balances.data.unit}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${dataPercent}%` }}
            />
          </div>
          {balance.balances.data.expiresAt && (
            <p className="text-white/50 text-xs mt-1">
              Expires {formatRelativeTime(new Date(balance.balances.data.expiresAt))}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBuyAirtime}
            className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-colors"
          >
            Buy Airtime
          </button>
          <button
            onClick={onBuyData}
            className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-colors"
          >
            Buy Data
          </button>
        </div>

        {/* Last updated */}
        <p className="text-white/40 text-xs text-center mt-3">
          Updated {formatRelativeTime(new Date(balance.lastUpdated))}
        </p>
      </div>
    </motion.div>
  );
}
