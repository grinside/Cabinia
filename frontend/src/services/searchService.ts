import type { MediaItem, SearchFilters, SearchSort } from '@/types';
import { feedService } from './feedService';

interface SearchParams {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  offset?: number;
  limit?: number;
}

interface SearchResponse {
  items: MediaItem[];
  suggestions: string[];
  relatedSearches: string[];
  totalCount: number;
}

// Demo trending searches
const TRENDING_SEARCHES = [
  'dance challenge',
  'afrobeats',
  'cooking',
  'football',
  'comedy',
  'lagos',
  'abidjan',
  'fashion',
];

export const searchService = {
  async search(params: SearchParams): Promise<SearchResponse> {
    const { query, offset = 0, limit = 20 } = params;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get all feed items and filter by query
    const allItems = await feedService.getFeed({ offset: 0, limit: 100 });
    const queryLower = query.toLowerCase();

    const filteredItems = allItems.items.filter(
      (item) =>
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
        item.creator.name.toLowerCase().includes(queryLower)
    );

    const items = filteredItems.slice(offset, offset + limit);

    return {
      items,
      suggestions: [],
      relatedSearches: TRENDING_SEARCHES.filter((s) => s.includes(queryLower)).slice(0, 5),
      totalCount: filteredItems.length,
    };
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    await new Promise((resolve) => setTimeout(resolve, 100));

    const queryLower = query.toLowerCase();
    return TRENDING_SEARCHES.filter((s) => s.includes(queryLower)).slice(0, 8);
  },

  async getTrendingSearches(): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return TRENDING_SEARCHES;
  },

  async getPersonalizedSuggestions(): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return TRENDING_SEARCHES.slice(0, 5);
  },

  async semanticSearch(_params: {
    query: string;
    useEmbeddings?: boolean;
    contextItemId?: string;
  }): Promise<MediaItem[]> {
    // In standalone mode, use regular search
    const result = await this.search({ query: _params.query });
    return result.items;
  },

  async visualSearch(_imageData: string): Promise<MediaItem[]> {
    // Not available in standalone mode
    return [];
  },

  async voiceSearch(_audioData: Blob): Promise<{
    transcript: string;
    results: MediaItem[];
  }> {
    // Not available in standalone mode
    return { transcript: '', results: [] };
  },

  async recordSearchClick(_query: string, _itemId: string): Promise<void> {
    // In standalone mode, just log
    console.log('Search click recorded');
  },
};
