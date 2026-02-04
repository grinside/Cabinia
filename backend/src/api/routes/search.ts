import { Router, Request, Response } from 'express';
import { optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Sample search data
const searchableContent = [
  { id: '1', title: 'Amazing dance moves in Abidjan', tags: ['dance', 'africa', 'viral'], category: 'Entertainment', views: 1250000 },
  { id: '2', title: 'Cooking Alloco like a pro', tags: ['food', 'africa', 'recipe'], category: 'Food', views: 890000 },
  { id: '3', title: 'Football skills from Lagos', tags: ['football', 'skills', 'nigeria'], category: 'Sports', views: 2100000 },
  { id: '4', title: 'Afrobeats dance tutorial', tags: ['dance', 'music', 'tutorial'], category: 'Entertainment', views: 500000 },
  { id: '5', title: 'Street food tour Dakar', tags: ['food', 'travel', 'senegal'], category: 'Food', views: 750000 },
  { id: '6', title: 'Tech startup stories Africa', tags: ['tech', 'startup', 'africa'], category: 'Technology', views: 320000 },
  { id: '7', title: 'Fashion week Abidjan', tags: ['fashion', 'style', 'africa'], category: 'Fashion', views: 450000 },
  { id: '8', title: 'Comedy skits compilation', tags: ['comedy', 'funny', 'viral'], category: 'Comedy', views: 1800000 },
];

// Search suggestions based on user behavior
const trendingSearches = [
  'dance',
  'afrobeats',
  'comedy',
  'food',
  'football',
  'music',
  'fashion',
  'tech',
];

// Main search endpoint
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  const { query, filters = {}, sort = 'relevance', offset = 0, limit = 20 } = req.body;

  let results = [...searchableContent];

  // Text search (simple matching)
  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter((item) =>
      item.title.toLowerCase().includes(queryLower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
      item.category.toLowerCase().includes(queryLower)
    );
  }

  // Apply filters
  if (filters.category) {
    results = results.filter((item) => item.category === filters.category);
  }

  // Sort
  switch (sort) {
    case 'views':
      results.sort((a, b) => b.views - a.views);
      break;
    case 'date':
      results.reverse(); // Simulate date sorting
      break;
    case 'relevance':
    default:
      // Keep original order (most relevant first based on search algorithm)
      break;
  }

  // Paginate
  const total = results.length;
  results = results.slice(Number(offset), Number(offset) + Number(limit));

  // Generate related searches
  const relatedSearches = query
    ? trendingSearches.filter((s) => s !== query.toLowerCase()).slice(0, 5)
    : [];

  // Convert to full media format
  const items = results.map((r) => ({
    id: r.id,
    type: 'short',
    title: r.title,
    description: `Amazing content about ${r.tags.join(', ')}`,
    thumbnailUrl: `https://picsum.photos/seed/${r.id}/360/640`,
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: Math.floor(Math.random() * 60) + 15,
    views: r.views,
    likes: Math.floor(r.views * 0.1),
    shares: Math.floor(r.views * 0.01),
    comments: Math.floor(r.views * 0.005),
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
      suggestions: [],
      relatedSearches,
      totalCount: total,
    },
  });
});

// Get suggestions (autocomplete)
router.get('/suggestions', async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || String(query).length < 2) {
    return res.json({ success: true, data: [] });
  }

  const queryLower = String(query).toLowerCase();

  // Generate suggestions from trending and content
  const suggestions = [
    ...trendingSearches.filter((s) => s.includes(queryLower)),
    ...searchableContent
      .filter((c) => c.title.toLowerCase().includes(queryLower))
      .map((c) => c.title),
  ].slice(0, 8);

  res.json({
    success: true,
    data: suggestions,
  });
});

// Get trending searches
router.get('/trending', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: trendingSearches,
  });
});

// Personalized suggestions
router.get('/personalized', optionalAuth, async (req: Request, res: Response) => {
  // In production, this would use user's search/watch history
  const personalized = trendingSearches.slice(0, 5);

  res.json({
    success: true,
    data: personalized,
  });
});

// Semantic search (placeholder for vector-based search)
router.post('/semantic', optionalAuth, async (req: Request, res: Response) => {
  const { query } = req.body;

  // In production, this would use embeddings and vector similarity
  // For now, return regular search results
  const results = searchableContent.slice(0, 5).map((r) => ({
    id: r.id,
    type: 'short',
    title: r.title,
    description: `Related to: ${query}`,
    thumbnailUrl: `https://picsum.photos/seed/${r.id}/360/640`,
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 30,
    views: r.views,
    likes: Math.floor(r.views * 0.1),
    shares: Math.floor(r.views * 0.01),
    comments: Math.floor(r.views * 0.005),
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
    data: results,
  });
});

// Record search click (for improving search rankings)
router.post('/analytics/click', optionalAuth, async (req: Request, res: Response) => {
  const { query, itemId } = req.body;

  // In production, store this for analytics and improving search rankings
  console.log(`Search click: query="${query}", itemId="${itemId}", userId="${req.user?.userId || 'anonymous'}"`);

  res.json({
    success: true,
    data: { recorded: true },
  });
});

export default router;
