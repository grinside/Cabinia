import { Router, Request, Response } from 'express';
import { optionalAuth, authenticate } from '../../middleware/auth.js';
import { TwoTowerRecommendationEngine } from '../../services/recommendationEngine.js';

const router = Router();
const recommendationEngine = new TwoTowerRecommendationEngine();

// Sample content pool for recommendations
const contentPool = [
  { id: '1', title: 'Dance in Abidjan', category: 'Entertainment', tags: ['dance', 'africa'], embedding: [0.1, 0.9, 0.3, 0.4] },
  { id: '2', title: 'Alloco Recipe', category: 'Food', tags: ['food', 'recipe'], embedding: [0.8, 0.2, 0.6, 0.3] },
  { id: '3', title: 'Football Lagos', category: 'Sports', tags: ['football', 'sports'], embedding: [0.3, 0.4, 0.9, 0.2] },
  { id: '4', title: 'Afrobeats Tutorial', category: 'Entertainment', tags: ['music', 'dance'], embedding: [0.2, 0.8, 0.4, 0.5] },
  { id: '5', title: 'Tech Startups', category: 'Technology', tags: ['tech', 'business'], embedding: [0.7, 0.3, 0.2, 0.8] },
  { id: '6', title: 'Comedy Skits', category: 'Comedy', tags: ['comedy', 'funny'], embedding: [0.4, 0.7, 0.5, 0.3] },
  { id: '7', title: 'Fashion Week', category: 'Fashion', tags: ['fashion', 'style'], embedding: [0.5, 0.5, 0.3, 0.6] },
  { id: '8', title: 'Street Food', category: 'Food', tags: ['food', 'travel'], embedding: [0.9, 0.1, 0.7, 0.2] },
];

// User behavior store (in-memory for demo)
const userBehaviors = new Map<string, any[]>();
const sessionBehaviors = new Map<string, any[]>();

function getRecommendedContent(userId: string | undefined, sessionId: string, currentItemId?: string, excludeIds: string[] = []) {
  // Get user behaviors
  const userSignals = userId ? userBehaviors.get(userId) || [] : [];
  const sessionSignals = sessionBehaviors.get(sessionId) || [];
  const allSignals = [...userSignals, ...sessionSignals];

  // Use recommendation engine to score content
  const userProfile = recommendationEngine.buildUserProfile(allSignals);
  const scoredContent = contentPool
    .filter((c) => !excludeIds.includes(c.id) && c.id !== currentItemId)
    .map((content) => ({
      content,
      score: recommendationEngine.computeScore(userProfile, content.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return scoredContent.map((sc) => sc.content);
}

// Get personalized recommendations
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  const { currentItemId, limit = 10, excludeIds = [], sessionId } = req.body;

  const recommended = getRecommendedContent(
    req.user?.userId,
    sessionId || 'anonymous',
    currentItemId,
    excludeIds
  ).slice(0, Number(limit));

  const items = recommended.map((r) => ({
    id: r.id,
    type: 'short',
    title: r.title,
    description: `Recommended content in ${r.category}`,
    thumbnailUrl: `https://picsum.photos/seed/${r.id}/360/640`,
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: Math.floor(Math.random() * 60) + 15,
    views: Math.floor(Math.random() * 1000000),
    likes: Math.floor(Math.random() * 50000),
    shares: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 1000),
    creator: {
      id: `creator-${r.id}`,
      name: `Creator ${r.id}`,
      username: `creator_${r.id}`,
      avatar: `https://i.pravatar.cc/150?u=${r.id}`,
      isVerified: Math.random() > 0.5,
      followers: Math.floor(Math.random() * 100000),
    },
    tags: r.tags,
    category: r.category,
    createdAt: new Date(),
  }));

  res.json({
    success: true,
    data: items,
  });
});

// For You feed
router.get('/for-you', optionalAuth, async (req: Request, res: Response) => {
  const { offset = 0, limit = 10, sessionId } = req.query;

  const recommended = getRecommendedContent(
    req.user?.userId,
    String(sessionId) || 'anonymous'
  );

  // Shuffle for variety
  const shuffled = recommended.sort(() => Math.random() - 0.5);
  const paged = shuffled.slice(Number(offset), Number(offset) + Number(limit));

  const items = paged.map((r) => ({
    id: `${r.id}-${Date.now()}-${Math.random()}`,
    type: 'short',
    title: r.title,
    description: `Personalized recommendation`,
    thumbnailUrl: `https://picsum.photos/seed/${r.id}/360/640`,
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: Math.floor(Math.random() * 60) + 15,
    views: Math.floor(Math.random() * 1000000),
    likes: Math.floor(Math.random() * 50000),
    shares: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 1000),
    creator: {
      id: `creator-${r.id}`,
      name: `Creator ${r.id}`,
      username: `creator_${r.id}`,
      avatar: `https://i.pravatar.cc/150?u=${r.id}`,
      isVerified: Math.random() > 0.5,
      followers: Math.floor(Math.random() * 100000),
    },
    tags: r.tags,
    category: r.category,
    createdAt: new Date(),
  }));

  res.json({
    success: true,
    data: {
      items,
      hasMore: true,
    },
  });
});

// Record user behaviors
router.post('/behaviors', optionalAuth, async (req: Request, res: Response) => {
  const { signals, sessionId } = req.body;

  // Store signals
  if (req.user?.userId) {
    const existing = userBehaviors.get(req.user.userId) || [];
    userBehaviors.set(req.user.userId, [...existing, ...signals].slice(-100)); // Keep last 100
  }

  const sessionExisting = sessionBehaviors.get(sessionId) || [];
  sessionBehaviors.set(sessionId, [...sessionExisting, ...signals].slice(-50)); // Keep last 50

  // Update recommendation engine with new signals
  signals.forEach((signal: any) => {
    recommendationEngine.updateFromBehavior(signal);
  });

  res.json({
    success: true,
    data: { recorded: signals.length },
  });
});

// Get similar items
router.get('/similar/:itemId', async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { limit = 10 } = req.query;

  // Find base item
  const baseItem = contentPool.find((c) => c.id === itemId.split('-')[0]);

  if (!baseItem) {
    return res.json({
      success: true,
      data: [],
    });
  }

  // Find similar items by embedding distance
  const similar = contentPool
    .filter((c) => c.id !== baseItem.id)
    .map((c) => ({
      content: c,
      similarity: recommendationEngine.cosineSimilarity(baseItem.embedding, c.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Number(limit))
    .map((s) => s.content);

  const items = similar.map((r) => ({
    id: r.id,
    type: 'short',
    title: r.title,
    description: `Similar to what you watched`,
    thumbnailUrl: `https://picsum.photos/seed/${r.id}/360/640`,
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 30,
    views: Math.floor(Math.random() * 1000000),
    likes: Math.floor(Math.random() * 50000),
    shares: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 1000),
    creator: {
      id: `creator-${r.id}`,
      name: `Creator ${r.id}`,
      username: `creator_${r.id}`,
      avatar: `https://i.pravatar.cc/150?u=${r.id}`,
      isVerified: true,
      followers: 50000,
    },
    tags: r.tags,
    category: r.category,
    createdAt: new Date(),
  }));

  res.json({
    success: true,
    data: items,
  });
});

// Provide negative feedback
router.post('/feedback', authenticate, async (req: Request, res: Response) => {
  const { itemId, feedback } = req.body;

  // Record negative signal
  const signal = {
    type: feedback === 'not_interested' ? 'skip' : 'report',
    itemId,
    timestamp: new Date(),
    weight: -1, // Negative weight
  };

  const existing = userBehaviors.get(req.user!.userId) || [];
  userBehaviors.set(req.user!.userId, [...existing, signal]);

  res.json({
    success: true,
    data: { recorded: true },
  });
});

export default router;
