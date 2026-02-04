import { create } from 'zustand';
import type { MediaItem, FeedState, BehaviorSignal } from '@/types';
import { feedService } from '@/services/feedService';
import { recommendationService } from '@/services/recommendationService';

interface FeedStore extends FeedState {
  fetchFeed: (refresh?: boolean) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  likeItem: (itemId: string) => Promise<void>;
  bookmarkItem: (itemId: string) => Promise<void>;
  shareItem: (itemId: string) => Promise<void>;
  recordBehavior: (signal: Omit<BehaviorSignal, 'timestamp'>) => void;
  setCategory: (category: string | null) => void;
  getNextItems: () => Promise<MediaItem[]>;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  items: [],
  currentIndex: 0,
  isLoading: false,
  hasMore: true,
  category: null,

  fetchFeed: async (refresh = false) => {
    const { items, category, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const offset = refresh ? 0 : items.length;
      const response = await feedService.getFeed({
        offset,
        limit: 10,
        category,
      });

      set({
        items: refresh ? response.items : [...items, ...response.items],
        hasMore: response.hasMore,
        isLoading: false,
        currentIndex: refresh ? 0 : get().currentIndex,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setCurrentIndex: (index: number) => {
    const { items } = get();
    if (index >= 0 && index < items.length) {
      set({ currentIndex: index });

      // Record view behavior
      const item = items[index];
      if (item) {
        get().recordBehavior({ type: 'view', itemId: item.id });
      }

      // Prefetch more items when near the end
      if (index >= items.length - 3 && get().hasMore) {
        get().fetchFeed();
      }
    }
  },

  likeItem: async (itemId: string) => {
    const { items } = get();
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = items[itemIndex];
    const newLikedState = !item.isLiked;

    // Optimistic update
    set({
      items: items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              isLiked: newLikedState,
              likes: newLikedState ? i.likes + 1 : i.likes - 1,
            }
          : i
      ),
    });

    try {
      await feedService.likeItem(itemId, newLikedState);
      get().recordBehavior({ type: 'like', itemId });
    } catch {
      // Revert on error
      set({
        items: items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                isLiked: item.isLiked,
                likes: item.likes,
              }
            : i
        ),
      });
    }
  },

  bookmarkItem: async (itemId: string) => {
    const { items } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newBookmarkedState = !item.isBookmarked;

    set({
      items: items.map((i) =>
        i.id === itemId ? { ...i, isBookmarked: newBookmarkedState } : i
      ),
    });

    try {
      await feedService.bookmarkItem(itemId, newBookmarkedState);
    } catch {
      set({
        items: items.map((i) =>
          i.id === itemId ? { ...i, isBookmarked: item.isBookmarked } : i
        ),
      });
    }
  },

  shareItem: async (itemId: string) => {
    const { items } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    get().recordBehavior({ type: 'share', itemId });

    // Update share count
    set({
      items: items.map((i) =>
        i.id === itemId ? { ...i, shares: i.shares + 1 } : i
      ),
    });

    // Native share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: `${window.location.origin}/watch/${itemId}`,
        });
      } catch {
        // User cancelled or error
      }
    }
  },

  recordBehavior: (signal: Omit<BehaviorSignal, 'timestamp'>) => {
    const fullSignal: BehaviorSignal = {
      ...signal,
      timestamp: new Date(),
    };
    recommendationService.recordBehavior(fullSignal);
  },

  setCategory: (category: string | null) => {
    set({ category, items: [], currentIndex: 0 });
    get().fetchFeed(true);
  },

  getNextItems: async () => {
    const { items, currentIndex } = get();
    const currentItem = items[currentIndex];

    if (!currentItem) return [];

    const recommendations = await recommendationService.getRecommendations({
      currentItemId: currentItem.id,
      limit: 5,
    });

    return recommendations;
  },
}));
