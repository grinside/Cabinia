import { api } from './api';
import type { MediaItem } from '@/types';

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
    return api.get<FeedResponse>('/feed', {
      offset,
      limit,
      category: category || undefined,
    });
  },

  async getItem(itemId: string): Promise<MediaItem> {
    return api.get<MediaItem>(`/feed/items/${itemId}`);
  },

  async likeItem(itemId: string, liked: boolean): Promise<void> {
    if (liked) {
      await api.post(`/feed/items/${itemId}/like`);
    } else {
      await api.delete(`/feed/items/${itemId}/like`);
    }
  },

  async bookmarkItem(itemId: string, bookmarked: boolean): Promise<void> {
    if (bookmarked) {
      await api.post(`/feed/items/${itemId}/bookmark`);
    } else {
      await api.delete(`/feed/items/${itemId}/bookmark`);
    }
  },

  async getComments(
    itemId: string,
    offset = 0,
    limit = 20
  ): Promise<{ comments: Comment[]; hasMore: boolean }> {
    return api.get(`/feed/items/${itemId}/comments`, { offset, limit });
  },

  async addComment(itemId: string, text: string): Promise<Comment> {
    return api.post(`/feed/items/${itemId}/comments`, { text });
  },

  async followCreator(creatorId: string): Promise<void> {
    await api.post(`/creators/${creatorId}/follow`);
  },

  async unfollowCreator(creatorId: string): Promise<void> {
    await api.delete(`/creators/${creatorId}/follow`);
  },

  async getTrending(limit = 10): Promise<MediaItem[]> {
    return api.get<MediaItem[]>('/feed/trending', { limit });
  },

  async getByCategory(
    category: string,
    offset = 0,
    limit = 10
  ): Promise<FeedResponse> {
    return api.get<FeedResponse>(`/feed/category/${category}`, {
      offset,
      limit,
    });
  },
};
