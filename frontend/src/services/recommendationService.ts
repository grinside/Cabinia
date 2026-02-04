import { api } from './api';
import type { MediaItem, BehaviorSignal } from '@/types';

interface RecommendationParams {
  currentItemId?: string;
  limit?: number;
  excludeIds?: string[];
}

interface BehaviorBatch {
  signals: BehaviorSignal[];
  sessionId: string;
}

// Local behavior buffer for batching
const behaviorBuffer: BehaviorSignal[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const sessionId = crypto.randomUUID();

export const recommendationService = {
  async getRecommendations(params: RecommendationParams): Promise<MediaItem[]> {
    const { currentItemId, limit = 10, excludeIds = [] } = params;

    return api.post<MediaItem[]>('/recommendations', {
      currentItemId,
      limit,
      excludeIds,
      sessionId,
    });
  },

  async getForYouFeed(offset = 0, limit = 10): Promise<{
    items: MediaItem[];
    hasMore: boolean;
  }> {
    return api.get('/recommendations/for-you', {
      offset,
      limit,
      sessionId,
    });
  },

  recordBehavior(signal: BehaviorSignal): void {
    behaviorBuffer.push(signal);

    // Debounce flush
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }

    flushTimeout = setTimeout(() => {
      this.flushBehaviors();
    }, 2000);

    // Flush immediately if buffer is large
    if (behaviorBuffer.length >= 10) {
      this.flushBehaviors();
    }
  },

  async flushBehaviors(): Promise<void> {
    if (behaviorBuffer.length === 0) return;

    const batch: BehaviorBatch = {
      signals: [...behaviorBuffer],
      sessionId,
    };

    behaviorBuffer.length = 0;

    try {
      await api.post('/recommendations/behaviors', batch);
    } catch {
      // Re-add to buffer on failure
      behaviorBuffer.push(...batch.signals);
    }
  },

  async getSimilarItems(itemId: string, limit = 10): Promise<MediaItem[]> {
    return api.get<MediaItem[]>(`/recommendations/similar/${itemId}`, { limit });
  },

  async getCreatorRecommendations(limit = 10): Promise<
    Array<{
      id: string;
      name: string;
      avatar: string;
      followers: number;
      sampleItems: MediaItem[];
    }>
  > {
    return api.get('/recommendations/creators', { limit });
  },

  async getCategoryRecommendations(): Promise<
    Array<{
      category: string;
      items: MediaItem[];
      reason: string;
    }>
  > {
    return api.get('/recommendations/categories');
  },

  async provideFeedback(itemId: string, feedback: 'not_interested' | 'report'): Promise<void> {
    await api.post('/recommendations/feedback', { itemId, feedback });
  },

  getSessionId(): string {
    return sessionId;
  },
};
