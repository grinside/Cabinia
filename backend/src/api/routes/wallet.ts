import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

// In-memory wallet store (use database in production)
const wallets = new Map<string, any>();

// Payment providers by country
const PAYMENT_PROVIDERS = {
  CI: {
    mobileMoney: [
      { id: 'mtn_momo', name: 'MTN Mobile Money', icon: '/icons/mtn.svg' },
      { id: 'orange_money', name: 'Orange Money', icon: '/icons/orange.svg' },
      { id: 'moov_money', name: 'Moov Money', icon: '/icons/moov.svg' },
      { id: 'wave', name: 'Wave', icon: '/icons/wave.svg' },
    ],
    cards: [
      { id: 'visa', name: 'Visa', icon: '/icons/visa.svg' },
      { id: 'mastercard', name: 'Mastercard', icon: '/icons/mastercard.svg' },
    ],
    banks: [
      { id: 'ecobank', name: 'Ecobank', icon: '/icons/ecobank.svg' },
      { id: 'sgci', name: 'SGCI', icon: '/icons/sgci.svg' },
    ],
  },
  SN: {
    mobileMoney: [
      { id: 'orange_money', name: 'Orange Money', icon: '/icons/orange.svg' },
      { id: 'wave', name: 'Wave', icon: '/icons/wave.svg' },
      { id: 'free_money', name: 'Free Money', icon: '/icons/free.svg' },
    ],
    cards: [
      { id: 'visa', name: 'Visa', icon: '/icons/visa.svg' },
      { id: 'mastercard', name: 'Mastercard', icon: '/icons/mastercard.svg' },
    ],
    banks: [
      { id: 'ecobank', name: 'Ecobank', icon: '/icons/ecobank.svg' },
      { id: 'cbao', name: 'CBAO', icon: '/icons/cbao.svg' },
    ],
  },
  NG: {
    mobileMoney: [
      { id: 'opay', name: 'OPay', icon: '/icons/opay.svg' },
      { id: 'palmpay', name: 'PalmPay', icon: '/icons/palmpay.svg' },
    ],
    cards: [
      { id: 'visa', name: 'Visa', icon: '/icons/visa.svg' },
      { id: 'mastercard', name: 'Mastercard', icon: '/icons/mastercard.svg' },
      { id: 'verve', name: 'Verve', icon: '/icons/verve.svg' },
    ],
    banks: [
      { id: 'gtbank', name: 'GTBank', icon: '/icons/gtbank.svg' },
      { id: 'access', name: 'Access Bank', icon: '/icons/access.svg' },
    ],
  },
  KE: {
    mobileMoney: [
      { id: 'mpesa', name: 'M-Pesa', icon: '/icons/mpesa.svg' },
      { id: 'airtel_money', name: 'Airtel Money', icon: '/icons/airtel.svg' },
    ],
    cards: [
      { id: 'visa', name: 'Visa', icon: '/icons/visa.svg' },
      { id: 'mastercard', name: 'Mastercard', icon: '/icons/mastercard.svg' },
    ],
    banks: [
      { id: 'kcb', name: 'KCB', icon: '/icons/kcb.svg' },
      { id: 'equity', name: 'Equity Bank', icon: '/icons/equity.svg' },
    ],
  },
};

// Initialize wallet for user
function getOrCreateWallet(userId: string) {
  if (!wallets.has(userId)) {
    wallets.set(userId, {
      id: uuidv4(),
      userId,
      balance: 0,
      currency: 'XOF',
      linkedMethods: [],
      transactions: [],
    });
  }
  return wallets.get(userId);
}

// Get wallet
router.get('/', authenticate, async (req: Request, res: Response) => {
  const wallet = getOrCreateWallet(req.user!.userId);

  res.json({
    success: true,
    data: wallet,
  });
});

// Deposit
router.post('/deposit', authenticate, async (req: Request, res: Response) => {
  const { amount, methodId } = req.body;
  const wallet = getOrCreateWallet(req.user!.userId);

  if (amount <= 0) {
    throw new AppError('Invalid amount', 400, 'INVALID_AMOUNT');
  }

  const transaction = {
    id: uuidv4(),
    type: 'deposit',
    amount,
    currency: wallet.currency,
    status: 'completed',
    method: methodId,
    description: 'Wallet deposit',
    createdAt: new Date(),
    reference: `DEP-${Date.now()}`,
  };

  wallet.balance += amount;
  wallet.transactions.unshift(transaction);

  res.json({
    success: true,
    data: transaction,
  });
});

// Withdraw
router.post('/withdraw', authenticate, async (req: Request, res: Response) => {
  const { amount, methodId } = req.body;
  const wallet = getOrCreateWallet(req.user!.userId);

  if (amount <= 0) {
    throw new AppError('Invalid amount', 400, 'INVALID_AMOUNT');
  }

  if (wallet.balance < amount) {
    throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
  }

  const transaction = {
    id: uuidv4(),
    type: 'withdrawal',
    amount,
    currency: wallet.currency,
    status: 'pending',
    method: methodId,
    description: 'Wallet withdrawal',
    createdAt: new Date(),
    reference: `WTH-${Date.now()}`,
  };

  wallet.balance -= amount;
  wallet.transactions.unshift(transaction);

  res.json({
    success: true,
    data: transaction,
  });
});

// Transfer
router.post('/transfer', authenticate, async (req: Request, res: Response) => {
  const { amount, recipientPhone } = req.body;
  const wallet = getOrCreateWallet(req.user!.userId);

  if (amount <= 0) {
    throw new AppError('Invalid amount', 400, 'INVALID_AMOUNT');
  }

  if (wallet.balance < amount) {
    throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
  }

  const transaction = {
    id: uuidv4(),
    type: 'transfer',
    amount,
    currency: wallet.currency,
    status: 'completed',
    method: 'wallet',
    description: `Transfer to ${recipientPhone}`,
    createdAt: new Date(),
    reference: `TRF-${Date.now()}`,
  };

  wallet.balance -= amount;
  wallet.transactions.unshift(transaction);

  res.json({
    success: true,
    data: transaction,
  });
});

// Get transactions
router.get('/transactions', authenticate, async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const wallet = getOrCreateWallet(req.user!.userId);

  const start = (Number(page) - 1) * Number(limit);
  const transactions = wallet.transactions.slice(start, start + Number(limit));

  res.json({
    success: true,
    data: transactions,
  });
});

// Add payment method
router.post('/payment-methods', authenticate, async (req: Request, res: Response) => {
  const wallet = getOrCreateWallet(req.user!.userId);

  const method = {
    id: uuidv4(),
    ...req.body,
    isVerified: false,
    isDefault: wallet.linkedMethods.length === 0,
  };

  wallet.linkedMethods.push(method);

  res.json({
    success: true,
    data: method,
  });
});

// Remove payment method
router.delete('/payment-methods/:id', authenticate, async (req: Request, res: Response) => {
  const wallet = getOrCreateWallet(req.user!.userId);

  wallet.linkedMethods = wallet.linkedMethods.filter(
    (m: any) => m.id !== req.params.id
  );

  res.json({
    success: true,
    data: { removed: true },
  });
});

// Set default method
router.patch('/payment-methods/:id/default', authenticate, async (req: Request, res: Response) => {
  const wallet = getOrCreateWallet(req.user!.userId);

  wallet.linkedMethods = wallet.linkedMethods.map((m: any) => ({
    ...m,
    isDefault: m.id === req.params.id,
  }));

  res.json({
    success: true,
    data: { updated: true },
  });
});

// Get payment providers
router.get('/providers', async (req: Request, res: Response) => {
  const { country = 'CI' } = req.query;
  const providers = PAYMENT_PROVIDERS[country as keyof typeof PAYMENT_PROVIDERS] || PAYMENT_PROVIDERS.CI;

  res.json({
    success: true,
    data: providers,
  });
});

export default router;
