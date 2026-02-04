import { api } from './api';
import type { MediaItem, SearchFilters, SearchSort } from '@/types';

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

export const searchService = {
  async search(params: SearchParams): Promise<SearchResponse> {
    const { query, filters = {}, sort = 'relevance', offset = 0, limit = 20 } = params;

    return api.post<SearchResponse>('/search', {
      query,
      filters,
      sort,
      offset,
      limit,
    });
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    return api.get<string[]>('/search/suggestions', { query });
  },

  async getTrendingSearches(): Promise<string[]> {
    return api.get<string[]>('/search/trending');
  },

  async getPersonalizedSuggestions(): Promise<string[]> {
    return api.get<string[]>('/search/personalized');
  },

  async semanticSearch(params: {
    query: string;
    useEmbeddings?: boolean;
    contextItemId?: string;
  }): Promise<MediaItem[]> {
    return api.post<MediaItem[]>('/search/semantic', params);
  },

  async visualSearch(imageData: string): Promise<MediaItem[]> {
    return api.post<MediaItem[]>('/search/visual', { image: imageData });
  },

  async voiceSearch(audioData: Blob): Promise<{
    transcript: string;
    results: MediaItem[];
  }> {
    const formData = new FormData();
    formData.append('audio', audioData);
    return api.post('/search/voice', formData);
  },

  async recordSearchClick(query: string, itemId: string): Promise<void> {
    await api.post('/search/analytics/click', { query, itemId });
  },
};
