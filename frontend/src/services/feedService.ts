import type { MediaItem } from '@/types';

// Demo data for standalone mode
const DEMO_VIDEOS: MediaItem[] = [
  {
    id: '1',
    type: 'short',
    title: 'Amazing Dance Moves in Abidjan 🔥',
    description: 'Check out these incredible moves! #dance #abidjan #viral',
    thumbnailUrl: 'https://picsum.photos/seed/v1/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 45,
    views: 1250000,
    likes: 89000,
    shares: 12000,
    comments: 3400,
    creator: {
      id: 'c1',
      name: 'DanceKing',
      username: 'danceking',
      avatar: 'https://i.pravatar.cc/150?u=c1',
      isVerified: true,
      followers: 2500000,
      isFollowing: false,
    },
    tags: ['dance', 'abidjan', 'viral'],
    category: 'entertainment',
    createdAt: new Date('2024-01-15'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    type: 'short',
    title: 'Cooking Attiéké - Traditional Recipe 🍚',
    description: 'Learn how to make perfect attiéké at home! #food #cooking #africa',
    thumbnailUrl: 'https://picsum.photos/seed/v2/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 60,
    views: 890000,
    likes: 67000,
    shares: 8900,
    comments: 2100,
    creator: {
      id: 'c2',
      name: 'Chef Aya',
      username: 'chefaya',
      avatar: 'https://i.pravatar.cc/150?u=c2',
      isVerified: true,
      followers: 1800000,
      isFollowing: true,
    },
    tags: ['food', 'cooking', 'africa', 'attieke'],
    category: 'food',
    createdAt: new Date('2024-01-14'),
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: '3',
    type: 'short',
    title: 'Football Skills Challenge ⚽',
    description: 'Can you do this? Comment below! #football #skills #challenge',
    thumbnailUrl: 'https://picsum.photos/seed/v3/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 30,
    views: 2100000,
    likes: 156000,
    shares: 23000,
    comments: 8900,
    creator: {
      id: 'c3',
      name: 'BallMaster',
      username: 'ballmaster',
      avatar: 'https://i.pravatar.cc/150?u=c3',
      isVerified: true,
      followers: 3200000,
      isFollowing: false,
    },
    tags: ['football', 'skills', 'challenge'],
    category: 'sports',
    createdAt: new Date('2024-01-13'),
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: '4',
    type: 'short',
    title: 'Afrobeats Dance Tutorial 💃',
    description: 'Learn this easy dance in 60 seconds! #afrobeats #tutorial #dance',
    thumbnailUrl: 'https://picsum.photos/seed/v4/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 55,
    views: 3500000,
    likes: 234000,
    shares: 45000,
    comments: 12000,
    creator: {
      id: 'c4',
      name: 'AfroQueen',
      username: 'afroqueen',
      avatar: 'https://i.pravatar.cc/150?u=c4',
      isVerified: true,
      followers: 5600000,
      isFollowing: false,
    },
    tags: ['afrobeats', 'tutorial', 'dance'],
    category: 'music',
    createdAt: new Date('2024-01-12'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '5',
    type: 'short',
    title: 'Lagos Street Food Tour 🍗',
    description: 'The best suya spots in Lagos! #lagos #streetfood #nigeria',
    thumbnailUrl: 'https://picsum.photos/seed/v5/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 90,
    views: 780000,
    likes: 52000,
    shares: 6700,
    comments: 1800,
    creator: {
      id: 'c5',
      name: 'FoodieNG',
      username: 'foodieng',
      avatar: 'https://i.pravatar.cc/150?u=c5',
      isVerified: false,
      followers: 890000,
      isFollowing: false,
    },
    tags: ['lagos', 'streetfood', 'nigeria', 'suya'],
    category: 'food',
    createdAt: new Date('2024-01-11'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '6',
    type: 'short',
    title: 'Tech Review: iPhone in Africa 📱',
    description: 'Is it worth buying? Full review! #tech #iphone #africa',
    thumbnailUrl: 'https://picsum.photos/seed/v6/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 120,
    views: 450000,
    likes: 28000,
    shares: 3200,
    comments: 890,
    creator: {
      id: 'c6',
      name: 'TechAfrica',
      username: 'techafrica',
      avatar: 'https://i.pravatar.cc/150?u=c6',
      isVerified: true,
      followers: 1200000,
      isFollowing: true,
    },
    tags: ['tech', 'iphone', 'africa', 'review'],
    category: 'technology',
    createdAt: new Date('2024-01-10'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '7',
    type: 'short',
    title: 'Comedy Skit: African Parents 😂',
    description: 'When African parents find your hidden phone! #comedy #africanparents',
    thumbnailUrl: 'https://picsum.photos/seed/v7/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 40,
    views: 5600000,
    likes: 456000,
    shares: 89000,
    comments: 34000,
    creator: {
      id: 'c7',
      name: 'LaughKing',
      username: 'laughking',
      avatar: 'https://i.pravatar.cc/150?u=c7',
      isVerified: true,
      followers: 8900000,
      isFollowing: false,
    },
    tags: ['comedy', 'africanparents', 'funny'],
    category: 'comedy',
    createdAt: new Date('2024-01-09'),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '8',
    type: 'short',
    title: 'Safari Adventure in Kenya 🦁',
    description: 'Lions up close! Incredible moment in Masai Mara #safari #kenya #wildlife',
    thumbnailUrl: 'https://picsum.photos/seed/v8/720/1280',
    mediaUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 75,
    views: 2300000,
    likes: 189000,
    shares: 34000,
    comments: 7800,
    creator: {
      id: 'c8',
      name: 'WildAfrica',
      username: 'wildafrica',
      avatar: 'https://i.pravatar.cc/150?u=c8',
      isVerified: true,
      followers: 4500000,
      isFollowing: false,
    },
    tags: ['safari', 'kenya', 'wildlife', 'lions'],
    category: 'travel',
    createdAt: new Date('2024-01-08'),
    isLiked: false,
    isBookmarked: false,
  },
];

interface FeedParams {
  offset?: number;
  limit?: number;
  category?: string | null;
}

interface FeedResponse {
  items: MediaItem[];
  hasMore: boolean;
  total: number;
}

export const feedService = {
  async getFeed(params: FeedParams = {}): Promise<FeedResponse> {
    const { offset = 0, limit = 10, category } = params;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredItems = [...DEMO_VIDEOS];

    if (category) {
      filteredItems = filteredItems.filter((item) => item.category === category);
    }

    const items = filteredItems.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredItems.length;

    return {
      items,
      hasMore,
      total: filteredItems.length,
    };
  },

  async getItem(itemId: string): Promise<MediaItem | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return DEMO_VIDEOS.find((item) => item.id === itemId);
  },

  async likeItem(_itemId: string, _liked: boolean): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async bookmarkItem(_itemId: string, _bookmarked: boolean): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async getComments(
    _itemId: string,
    _offset = 0,
    _limit = 20
  ): Promise<{ comments: Comment[]; hasMore: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { comments: [], hasMore: false };
  },

  async addComment(_itemId: string, _text: string): Promise<Comment> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {} as Comment;
  },

  async followCreator(_creatorId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async unfollowCreator(_creatorId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async getTrending(limit = 10): Promise<MediaItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return DEMO_VIDEOS.slice(0, limit);
  },

  async getByCategory(
    category: string,
    offset = 0,
    limit = 10
  ): Promise<FeedResponse> {
    return this.getFeed({ offset, limit, category });
  },
};
