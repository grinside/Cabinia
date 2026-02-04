import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Telco operators by country
const TELCO_OPERATORS = {
  CI: [
    { id: 'mtn_ci', name: 'MTN Côte d\'Ivoire', country: 'CI', icon: '/icons/mtn.svg', ussdCode: '*133#' },
    { id: 'orange_ci', name: 'Orange Côte d\'Ivoire', country: 'CI', icon: '/icons/orange.svg', ussdCode: '#149#' },
    { id: 'moov_ci', name: 'Moov Africa', country: 'CI', icon: '/icons/moov.svg', ussdCode: '*155#' },
  ],
  SN: [
    { id: 'orange_sn', name: 'Orange Sénégal', country: 'SN', icon: '/icons/orange.svg', ussdCode: '#123#' },
    { id: 'free_sn', name: 'Free Sénégal', country: 'SN', icon: '/icons/free.svg', ussdCode: '*800#' },
    { id: 'expresso_sn', name: 'Expresso', country: 'SN', icon: '/icons/expresso.svg', ussdCode: '*111#' },
  ],
  NG: [
    { id: 'mtn_ng', name: 'MTN Nigeria', country: 'NG', icon: '/icons/mtn.svg', ussdCode: '*556#' },
    { id: 'airtel_ng', name: 'Airtel Nigeria', country: 'NG', icon: '/icons/airtel.svg', ussdCode: '*123#' },
    { id: 'glo_ng', name: 'Glo', country: 'NG', icon: '/icons/glo.svg', ussdCode: '*124#' },
    { id: '9mobile_ng', name: '9mobile', country: 'NG', icon: '/icons/9mobile.svg', ussdCode: '*232#' },
  ],
  KE: [
    { id: 'safaricom_ke', name: 'Safaricom', country: 'KE', icon: '/icons/safaricom.svg', ussdCode: '*144#' },
    { id: 'airtel_ke', name: 'Airtel Kenya', country: 'KE', icon: '/icons/airtel.svg', ussdCode: '*131#' },
    { id: 'telkom_ke', name: 'Telkom Kenya', country: 'KE', icon: '/icons/telkom.svg', ussdCode: '*555#' },
  ],
};

// Data bundles
const DATA_BUNDLES = {
  mtn_ci: [
    { id: 'mtn_ci_500mb', name: '500 MB', size: 500, unit: 'MB', price: 500, validity: '24 hours' },
    { id: 'mtn_ci_1gb', name: '1 GB', size: 1, unit: 'GB', price: 1000, validity: '7 days' },
    { id: 'mtn_ci_3gb', name: '3 GB', size: 3, unit: 'GB', price: 2500, validity: '30 days' },
    { id: 'mtn_ci_10gb', name: '10 GB', size: 10, unit: 'GB', price: 5000, validity: '30 days' },
  ],
  orange_ci: [
    { id: 'orange_ci_500mb', name: '500 MB', size: 500, unit: 'MB', price: 500, validity: '24 hours' },
    { id: 'orange_ci_1gb', name: '1 GB', size: 1, unit: 'GB', price: 1000, validity: '7 days' },
    { id: 'orange_ci_5gb', name: '5 GB', size: 5, unit: 'GB', price: 3000, validity: '30 days' },
  ],
};

// In-memory telco accounts store
const telcoAccounts = new Map<string, any[]>();

function getUserTelcoAccounts(userId: string): any[] {
  if (!telcoAccounts.has(userId)) {
    telcoAccounts.set(userId, []);
  }
  return telcoAccounts.get(userId)!;
}

// Get balances
router.get('/balances', authenticate, async (req: Request, res: Response) => {
  const accounts = getUserTelcoAccounts(req.user!.userId);

  res.json({
    success: true,
    data: accounts,
  });
});

// Add account
router.post('/accounts', authenticate, async (req: Request, res: Response) => {
  const { phone, operatorId } = req.body;
  const accounts = getUserTelcoAccounts(req.user!.userId);

  // Find operator
  let operator = null;
  for (const country of Object.values(TELCO_OPERATORS)) {
    operator = country.find((op) => op.id === operatorId);
    if (operator) break;
  }

  if (!operator) {
    return res.status(400).json({
      success: false,
      message: 'Operator not found',
    });
  }

  const account = {
    id: uuidv4(),
    operator,
    phone,
    balances: {
      airtime: Math.floor(Math.random() * 5000),
      data: {
        remaining: Math.floor(Math.random() * 2000),
        total: 2000,
        unit: 'MB',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      sms: Math.floor(Math.random() * 100),
    },
    lastUpdated: new Date(),
  };

  accounts.push(account);

  res.json({
    success: true,
    data: account,
  });
});

// Remove account
router.delete('/accounts/:id', authenticate, async (req: Request, res: Response) => {
  const accounts = getUserTelcoAccounts(req.user!.userId);
  const index = accounts.findIndex((a) => a.id === req.params.id);

  if (index !== -1) {
    accounts.splice(index, 1);
  }

  res.json({
    success: true,
    data: { removed: true },
  });
});

// Refresh balance
router.post('/accounts/:id/refresh', authenticate, async (req: Request, res: Response) => {
  const accounts = getUserTelcoAccounts(req.user!.userId);
  const account = accounts.find((a) => a.id === req.params.id);

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  // Simulate balance update
  account.balances.airtime = Math.floor(Math.random() * 5000);
  account.balances.data.remaining = Math.floor(Math.random() * account.balances.data.total);
  account.balances.sms = Math.floor(Math.random() * 100);
  account.lastUpdated = new Date();

  res.json({
    success: true,
    data: account,
  });
});

// Get operators
router.get('/operators', async (req: Request, res: Response) => {
  const { country } = req.query;

  if (country && TELCO_OPERATORS[country as keyof typeof TELCO_OPERATORS]) {
    return res.json({
      success: true,
      data: TELCO_OPERATORS[country as keyof typeof TELCO_OPERATORS],
    });
  }

  // Return all operators
  const allOperators = Object.values(TELCO_OPERATORS).flat();

  res.json({
    success: true,
    data: allOperators,
  });
});

// Buy airtime
router.post('/airtime/purchase', authenticate, async (req: Request, res: Response) => {
  const { accountId, amount } = req.body;
  const accounts = getUserTelcoAccounts(req.user!.userId);
  const account = accounts.find((a) => a.id === accountId);

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  account.balances.airtime += amount;
  account.lastUpdated = new Date();

  res.json({
    success: true,
    data: {
      success: true,
      newBalance: account.balances.airtime,
      transaction: { id: uuidv4(), amount },
    },
  });
});

// Buy data
router.post('/data/purchase', authenticate, async (req: Request, res: Response) => {
  const { accountId, bundleId } = req.body;
  const accounts = getUserTelcoAccounts(req.user!.userId);
  const account = accounts.find((a) => a.id === accountId);

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  // Find bundle
  const operatorBundles = DATA_BUNDLES[account.operator.id as keyof typeof DATA_BUNDLES];
  const bundle = operatorBundles?.find((b) => b.id === bundleId);

  if (bundle) {
    const addAmount = bundle.unit === 'GB' ? bundle.size * 1000 : bundle.size;
    account.balances.data.remaining += addAmount;
    account.balances.data.total = Math.max(account.balances.data.total, account.balances.data.remaining);
  }

  account.lastUpdated = new Date();

  res.json({
    success: true,
    data: {
      success: true,
      newBalance: account.balances.data,
      transaction: { id: uuidv4(), amount: bundle?.price || 0 },
    },
  });
});

// Get data bundles
router.get('/operators/:operatorId/bundles', async (req: Request, res: Response) => {
  const { operatorId } = req.params;
  const bundles = DATA_BUNDLES[operatorId as keyof typeof DATA_BUNDLES] || [];

  res.json({
    success: true,
    data: bundles,
  });
});

export default router;
