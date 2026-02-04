import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MediaItem,
  SearchFilters,
  SearchSort,
  SearchHistory
} from '@/types';
import { searchService } from '@/services/searchService';

interface SearchStore {
  query: string;
  results: MediaItem[];
  suggestions: string[];
  relatedSearches: string[];
  history: SearchHistory[];
  filters: SearchFilters;
  sort: SearchSort;
  isLoading: boolean;
  totalCount: number;
  hasMore: boolean;

  // Actions
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSort: (sort: SearchSort) => void;
  clearFilters: () => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      suggestions: [],
      relatedSearches: [],
      history: [],
      filters: DEFAULT_FILTERS,
      sort: 'relevance',
      isLoading: false,
      totalCount: 0,
      hasMore: false,

      setQuery: (query: string) => {
        set({ query });
        if (query.length > 1) {
          get().getSuggestions(query);
        } else {
          set({ suggestions: [] });
        }
      },

      search: async (searchQuery?: string) => {
        const query = searchQuery ?? get().query;
        if (!query.trim()) return;

        set({ isLoading: true, query });
        try {
          const { filters, sort, history } = get();
          const response = await searchService.search({
            query,
            filters,
            sort,
            offset: 0,
            limit: 20,
          });

          // Add to history
          const newHistoryEntry: SearchHistory = {
            query,
            timestamp: new Date(),
            resultCount: response.totalCount,
          };

          const updatedHistory = [
            newHistoryEntry,
            ...history.filter((h) => h.query !== query),
          ].slice(0, 50); // Keep last 50 searches

          set({
            results: response.items,
            suggestions: [],
            relatedSearches: response.relatedSearches,
            totalCount: response.totalCount,
            hasMore: response.items.length < response.totalCount,
            history: updatedHistory,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false, results: [] });
        }
      },

      loadMore: async () => {
        const { query, results, filters, sort, isLoading, hasMore } = get();
        if (isLoading || !hasMore) return;

        set({ isLoading: true });
        try {
          const response = await searchService.search({
            query,
            filters,
            sort,
            offset: results.length,
            limit: 20,
          });

          set({
            results: [...results, ...response.items],
            hasMore: results.length + response.items.length < response.totalCount,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      getSuggestions: async (query: string) => {
        try {
          const suggestions = await searchService.getSuggestions(query);
          set({ suggestions });
        } catch {
          set({ suggestions: [] });
        }
      },

      setFilters: (newFilters: Partial<SearchFilters>) => {
        set({ filters: { ...get().filters, ...newFilters } });
        // Re-search with new filters
        if (get().query) {
          get().search();
        }
      },

      setSort: (sort: SearchSort) => {
        set({ sort });
        // Re-search with new sort
        if (get().query) {
          get().search();
        }
      },

      clearFilters: () => {
        set({ filters: DEFAULT_FILTERS, sort: 'relevance' });
        if (get().query) {
          get().search();
        }
      },

      clearHistory: () => {
        set({ history: [] });
      },

      removeFromHistory: (query: string) => {
        set({ history: get().history.filter((h) => h.query !== query) });
      },
    }),
    {
      name: 'cabinia-search',
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
