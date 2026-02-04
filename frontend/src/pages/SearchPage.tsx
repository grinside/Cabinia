import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFiltersPanel } from '@/components/search/SearchFilters';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useSearchStore } from '@/stores/searchStore';
import type { MediaItem } from '@/types';

export function SearchPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { query, results } = useSearchStore();

  const handleItemClick = (item: MediaItem) => {
    navigate(`/watch/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <Header title="Search" />

      <div className="pt-20 px-4">
        <SearchBar className="mb-6" />

        {query || results.length > 0 ? (
          <SearchResults
            onItemClick={handleItemClick}
            onFilterClick={() => setShowFilters(true)}
          />
        ) : (
          <TrendingSection />
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <SearchFiltersPanel onClose={() => setShowFilters(false)} />
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function TrendingSection() {
  const navigate = useNavigate();

  const trendingTopics = [
    { id: '1', name: 'Dance Challenge', count: '1.2M videos' },
    { id: '2', name: 'Cooking Tips', count: '890K videos' },
    { id: '3', name: 'Comedy Skits', count: '2.1M videos' },
    { id: '4', name: 'Music Covers', count: '650K videos' },
    { id: '5', name: 'Fitness', count: '1.5M videos' },
  ];

  const categories = [
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮' },
    { id: 'education', name: 'Education', emoji: '📚' },
    { id: 'food', name: 'Food', emoji: '🍔' },
  ];

  return (
    <div className="space-y-8">
      {/* Trending topics */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Trending Now</h2>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <button
              key={topic.id}
              className="w-full flex items-center gap-4 p-3 bg-dark-800 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <span className="text-primary-500 font-bold text-lg w-6">
                {index + 1}
              </span>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{topic.name}</p>
                <p className="text-dark-400 text-sm">{topic.count}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Browse categories */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Browse Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="flex items-center gap-3 p-4 bg-dark-800 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <span className="text-2xl">{category.emoji}</span>
              <span className="text-white font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
