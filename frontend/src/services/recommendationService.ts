import type { MediaItem, BehaviorSignal } from '@/types';

// Local behavior buffer for batching
const behaviorBuffer: BehaviorSignal[] = [];
const sessionId = crypto.randomUUID();

export const recommendationService = {
  async getRecommendations(_params: {
    currentItemId?: string;
    limit?: number;
    excludeIds?: string[];
  }): Promise<MediaItem[]> {
    // In standalone mode, just return empty array
    // Real implementation would call the API
    return [];
  },

  async getForYouFeed(_offset = 0, _limit = 10): Promise<{
    items: MediaItem[];
    hasMore: boolean;
  }> {
    // In standalone mode, feedService handles this
    return { items: [], hasMore: false };
  },

  recordBehavior(signal: BehaviorSignal): void {
    behaviorBuffer.push(signal);
    // In standalone mode, just store locally
    // Could be sent to analytics or stored in localStorage
    if (behaviorBuffer.length > 100) {
      behaviorBuffer.splice(0, 50); // Keep last 50
    }
  },

  async flushBehaviors(): Promise<void> {
    // In standalone mode, behaviors are just stored locally
    console.log('Behaviors to flush:', behaviorBuffer.length);
  },

  async getSimilarItems(_itemId: string, _limit = 10): Promise<MediaItem[]> {
    return [];
  },

  async getCreatorRecommendations(_limit = 10): Promise<
    Array<{
      id: string;
      name: string;
      avatar: string;
      followers: number;
      sampleItems: MediaItem[];
    }>
  > {
    return [];
  },

  async getCategoryRecommendations(): Promise<
    Array<{
      category: string;
      items: MediaItem[];
      reason: string;
    }>
  > {
    return [];
  },

  async provideFeedback(_itemId: string, _feedback: 'not_interested' | 'report'): Promise<void> {
    // In standalone mode, just log
    console.log('Feedback recorded');
  },

  getSessionId(): string {
    return sessionId;
  },
};
