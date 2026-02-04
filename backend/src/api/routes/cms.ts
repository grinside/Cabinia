import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// CMS Content Store (in-memory for demo)
const cmsContent = new Map<string, any>();
const categories = new Map<string, any>();

// Initialize default categories
const defaultCategories = [
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', icon: '🎬', color: '#FF6B6B', itemCount: 1250000 },
  { id: 'music', name: 'Music', slug: 'music', icon: '🎵', color: '#4ECDC4', itemCount: 890000 },
  { id: 'sports', name: 'Sports', slug: 'sports', icon: '⚽', color: '#45B7D1', itemCount: 650000 },
  { id: 'gaming', name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#96CEB4', itemCount: 520000 },
  { id: 'education', name: 'Education', slug: 'education', icon: '📚', color: '#FFEAA7', itemCount: 320000 },
  { id: 'food', name: 'Food', slug: 'food', icon: '🍔', color: '#DDA0DD', itemCount: 450000 },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', icon: '😂', color: '#FFD93D', itemCount: 780000 },
  { id: 'technology', name: 'Technology', slug: 'technology', icon: '💻', color: '#6BCB77', itemCount: 280000 },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '👗', color: '#FF8E9E', itemCount: 410000 },
  { id: 'travel', name: 'Travel', slug: 'travel', icon: '✈️', color: '#74C0FC', itemCount: 350000 },
];

defaultCategories.forEach((cat) => categories.set(cat.id, cat));

// Initialize sample CMS content
const sampleContent = [
  {
    id: uuidv4(),
    type: 'banner',
    title: 'Welcome to Cabinia',
    content: {
      imageUrl: 'https://picsum.photos/seed/banner1/800/400',
      actionUrl: '/discover',
      actionText: 'Explore Now',
    },
    placement: 'home_top',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    priority: 1,
  },
  {
    id: uuidv4(),
    type: 'featured',
    title: 'Featured Creators',
    content: {
      creators: [
        { id: 'c1', name: 'Dance Master', avatar: 'https://i.pravatar.cc/150?u=c1' },
        { id: 'c2', name: 'Chef Aya', avatar: 'https://i.pravatar.cc/150?u=c2' },
        { id: 'c3', name: 'Baller King', avatar: 'https://i.pravatar.cc/150?u=c3' },
      ],
    },
    placement: 'home_featured',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    priority: 2,
  },
  {
    id: uuidv4(),
    type: 'promotion',
    title: 'Earn Rewards',
    content: {
      description: 'Invite friends and earn up to 5000 XOF!',
      imageUrl: 'https://picsum.photos/seed/promo1/400/200',
      termsUrl: '/terms/referral',
    },
    placement: 'wallet_promo',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isActive: true,
    priority: 1,
  },
];

sampleContent.forEach((content) => cmsContent.set(content.id, content));

// Get content by placement
router.get('/content', async (req: Request, res: Response) => {
  const { placement, type } = req.query;
  const now = new Date();

  let content = Array.from(cmsContent.values())
    .filter((c) => c.isActive && new Date(c.startDate) <= now && new Date(c.endDate) >= now);

  if (placement) {
    content = content.filter((c) => c.placement === placement);
  }

  if (type) {
    content = content.filter((c) => c.type === type);
  }

  // Sort by priority
  content.sort((a, b) => a.priority - b.priority);

  res.json({
    success: true,
    data: content,
  });
});

// Get single content
router.get('/content/:id', async (req: Request, res: Response) => {
  const content = cmsContent.get(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found',
    });
  }

  res.json({
    success: true,
    data: content,
  });
});

// Create content (admin only in production)
router.post('/content', authenticate, async (req: Request, res: Response) => {
  const content = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  cmsContent.set(content.id, content);

  res.status(201).json({
    success: true,
    data: content,
  });
});

// Update content
router.put('/content/:id', authenticate, async (req: Request, res: Response) => {
  const existing = cmsContent.get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Content not found',
    });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date(),
  };

  cmsContent.set(req.params.id, updated);

  res.json({
    success: true,
    data: updated,
  });
});

// Delete content
router.delete('/content/:id', authenticate, async (req: Request, res: Response) => {
  if (!cmsContent.has(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: 'Content not found',
    });
  }

  cmsContent.delete(req.params.id);

  res.json({
    success: true,
    data: { deleted: true },
  });
});

// Get categories
router.get('/categories', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Array.from(categories.values()),
  });
});

// Get single category
router.get('/categories/:id', async (req: Request, res: Response) => {
  const category = categories.get(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  res.json({
    success: true,
    data: category,
  });
});

// Create category
router.post('/categories', authenticate, async (req: Request, res: Response) => {
  const category = {
    id: req.body.slug || uuidv4(),
    ...req.body,
    itemCount: 0,
  };

  categories.set(category.id, category);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// Update category
router.put('/categories/:id', authenticate, async (req: Request, res: Response) => {
  const existing = categories.get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
  };

  categories.set(req.params.id, updated);

  res.json({
    success: true,
    data: updated,
  });
});

// App configuration (versioning, feature flags)
router.get('/config', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      appVersion: '1.0.0',
      minVersion: '1.0.0',
      features: {
        wallet: true,
        telco: true,
        recommendations: true,
        liveStreaming: false,
        creatorProgram: false,
      },
      maintenance: {
        enabled: false,
        message: null,
        estimatedEnd: null,
      },
      supportedCountries: ['CI', 'SN', 'ML', 'BF', 'TG', 'BJ', 'NG', 'GH', 'KE', 'TZ', 'UG', 'ZA'],
      defaultCurrency: 'XOF',
    },
  });
});

export default router;
