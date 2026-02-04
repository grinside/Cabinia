import { motion } from 'framer-motion';
import { Plus, Check, Trash2, CreditCard, Smartphone, Building2 } from 'lucide-react';
import type { PaymentMethod, PaymentMethodType } from '@/types';
import { cn, maskPhone } from '@/lib/utils';

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  selectedId?: string;
  onSelect?: (method: PaymentMethod) => void;
  onAdd?: () => void;
  onRemove?: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
  showActions?: boolean;
}

const METHOD_ICONS: Record<PaymentMethodType, React.ElementType> = {
  mobile_money: Smartphone,
  bank_card: CreditCard,
  bank_transfer: Building2,
  paypal: CreditCard,
  crypto: CreditCard,
};

const PROVIDER_LOGOS: Record<string, string> = {
  mtn_momo: '/icons/mtn.svg',
  orange_money: '/icons/orange.svg',
  wave: '/icons/wave.svg',
  mpesa: '/icons/mpesa.svg',
  airtel_money: '/icons/airtel.svg',
  visa: '/icons/visa.svg',
  mastercard: '/icons/mastercard.svg',
  paypal: '/icons/paypal.svg',
  flutterwave: '/icons/flutterwave.svg',
};

export function PaymentMethodList({
  methods,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onSetDefault,
  showActions = true,
}: PaymentMethodListProps) {
  return (
    <div className="space-y-3">
      {methods.map((method, index) => {
        const Icon = METHOD_ICONS[method.type];
        const isSelected = selectedId === method.id;

        return (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(method)}
            className={cn(
              'relative p-4 rounded-xl border transition-all',
              onSelect && 'cursor-pointer',
              isSelected
                ? 'bg-primary-500/10 border-primary-500'
                : 'bg-dark-800 border-dark-700 hover:border-dark-600'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Icon/Logo */}
              <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden">
                {PROVIDER_LOGOS[method.provider] ? (
                  <img
                    src={PROVIDER_LOGOS[method.provider]}
                    alt={method.provider}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Icon className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium truncate">{method.name}</p>
                  {method.isDefault && (
                    <span className="text-xs text-primary-500 bg-primary-500/20 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                  {method.isVerified && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-dark-400 text-sm">
                  {maskPhone(method.accountNumber)}
                </p>
              </div>

              {/* Selection indicator */}
              {onSelect && (
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && !onSelect && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-700">
                {!method.isDefault && onSetDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefault(method.id);
                    }}
                    className="text-sm text-primary-500 hover:underline"
                  >
                    Set as default
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(method.id);
                    }}
                    className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Add new method */}
      {onAdd && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onAdd}
          className="w-full p-4 rounded-xl border-2 border-dashed border-dark-700 hover:border-dark-600 hover:bg-dark-800/50 transition-all flex items-center justify-center gap-2 text-dark-400 hover:text-white"
        >
          <Plus className="w-5 h-5" />
          <span>Add payment method</span>
        </motion.button>
      )}
    </div>
  );
}
