import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Sample data for demonstration
const sampleMedia = [
  {
    id: '1',
    type: 'short',
    title: 'Amazing dance moves in Abidjan',
    description: 'Check out these incredible dance moves from the streets of Abidjan! #dance #africa #viral',
    thumbnailUrl: 'https://picsum.photos/seed/1/360/640',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 45,
    views: 1250000,
    likes: 85000,
    shares: 12000,
    comments: 3200,
    creator: {
      id: 'c1',
      name: 'Dance Master',
      username: 'dancemaster_ci',
      avatar: 'https://i.pravatar.cc/150?u=c1',
      isVerified: true,
      followers: 500000,
    },
    tags: ['dance', 'africa', 'viral'],
    category: 'Entertainment',
    createdAt: new Date(),
  },
  {
    id: '2',
    type: 'short',
    title: 'Cooking Alloco like a pro',
    description: 'Traditional Ivorian Alloco recipe passed down through generations #food #africa #recipe',
    thumbnailUrl: 'https://picsum.photos/seed/2/360/640',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 60,
    views: 890000,
    likes: 45000,
    shares: 8000,
    comments: 1500,
    creator: {
      id: 'c2',
      name: 'Chef Aya',
      username: 'chef_aya',
      avatar: 'https://i.pravatar.cc/150?u=c2',
      isVerified: true,
      followers: 250000,
    },
    tags: ['food', 'africa', 'recipe'],
    category: 'Food',
    createdAt: new Date(),
  },
  {
    id: '3',
    type: 'short',
    title: 'Football skills from Lagos',
    description: 'Street football at its finest! #football #skills #nigeria',
    thumbnailUrl: 'https://picsum.photos/seed/3/360/640',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 30,
    views: 2100000,
    likes: 150000,
    shares: 25000,
    comments: 5000,
    creator: {
      id: 'c3',
      name: 'Baller King',
      username: 'baller_king_ng',
      avatar: 'https://i.pravatar.cc/150?u=c3',
      isVerified: false,
      followers: 750000,
    },
    tags: ['football', 'skills', 'nigeria'],
    category: 'Sports',
    createdAt: new Date(),
  },
];

// Get feed
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const { offset = 0, limit = 10, category } = req.query;

  let items = [...sampleMedia];

  // Filter by category
  if (category) {
    items = items.filter((item) => item.category === category);
  }

  // Shuffle for variety
  items = items.sort(() => Math.random() - 0.5);

  // Generate more items for pagination demo
  const generatedItems = [];
  for (let i = 0; i < Number(limit); i++) {
    const base = items[i % items.length];
    generatedItems.push({
      ...base,
      id: `${base.id}-${offset}-${i}`,
    });
  }

  res.json({
    success: true,
    data: {
      items: generatedItems,
      hasMore: true,
      total: 1000,
    },
  });
});

// Get single item
router.get('/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = sampleMedia.find((m) => m.id === id.split('-')[0]);

  res.json({
    success: true,
    data: item || sampleMedia[0],
  });
});

// Like item
router.post('/items/:id/like', authenticate, async (req: Request, res: Response) => {
  res.json({ success: true, data: { liked: true } });
});

router.delete('/items/:id/like', authenticate, async (req: Request, res: Response) => {
  res.json({ success: true, data: { liked: false } });
});

// Bookmark item
router.post('/items/:id/bookmark', authenticate, async (req: Request, res: Response) => {
  res.json({ success: true, data: { bookmarked: true } });
});

router.delete('/items/:id/bookmark', authenticate, async (req: Request, res: Response) => {
  res.json({ success: true, data: { bookmarked: false } });
});

// Get trending
router.get('/trending', async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  res.json({
    success: true,
    data: sampleMedia.slice(0, Number(limit)),
  });
});

// Get by category
router.get('/category/:category', async (req: Request, res: Response) => {
  const { category } = req.params;
  const { offset = 0, limit = 10 } = req.query;

  const items = sampleMedia.filter(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );

  res.json({
    success: true,
    data: {
      items,
      hasMore: items.length >= Number(limit),
      total: items.length,
    },
  });
});

export default router;
