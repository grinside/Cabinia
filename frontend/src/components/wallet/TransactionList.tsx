import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const TYPE_CONFIG = {
  deposit: {
    icon: ArrowDownLeft,
    label: 'Deposit',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  withdrawal: {
    icon: ArrowUpRight,
    label: 'Withdrawal',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  transfer: {
    icon: Repeat,
    label: 'Transfer',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  purchase: {
    icon: ShoppingCart,
    label: 'Purchase',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-yellow-500',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-green-500',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-500',
  },
};

export function TransactionList({
  transactions,
  onLoadMore,
  hasMore,
  isLoading,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-dark-500" />
        </div>
        <p className="text-dark-400">No transactions yet</p>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce((groups, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <h3 className="text-dark-400 text-sm font-medium mb-3">{date}</h3>
          <div className="space-y-2">
            {txs.map((tx, index) => (
              <TransactionItem key={tx.id} transaction={tx} index={index} />
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-3 text-center text-primary-500 hover:bg-dark-800 rounded-xl transition-colors"
        >
          {isLoading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

function TransactionItem({ transaction, index }: TransactionItemProps) {
  const typeConfig = TYPE_CONFIG[transaction.type];
  const statusConfig = STATUS_CONFIG[transaction.status];
  const Icon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isPositive = transaction.type === 'deposit';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl"
    >
      {/* Icon */}
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeConfig.bgColor)}>
        <Icon className={cn('w-6 h-6', typeConfig.color)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium">{typeConfig.label}</p>
          <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
        </div>
        <p className="text-dark-400 text-sm truncate">{transaction.description}</p>
        <p className="text-dark-500 text-xs mt-0.5">
          {formatRelativeTime(new Date(transaction.createdAt))}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className={cn('font-semibold', isPositive ? 'text-green-500' : 'text-white')}>
          {isPositive ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-dark-500 text-xs">{transaction.method}</p>
      </div>
    </motion.div>
  );
}
