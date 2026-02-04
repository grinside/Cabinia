import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, SlidersHorizontal, Play } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import type { MediaItem } from '@/types';
import { formatNumber, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  onItemClick: (item: MediaItem) => void;
  onFilterClick: () => void;
}

export function SearchResults({ onItemClick, onFilterClick }: SearchResultsProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    results,
    relatedSearches,
    isLoading,
    totalCount,
    hasMore,
    loadMore,
    search,
  } = useSearchStore();

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-4">
          <Play className="w-10 h-10 text-dark-500" />
        </div>
        <p className="text-dark-400 text-lg">No results found</p>
        <p className="text-dark-500 text-sm mt-1">Try different keywords</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-dark-400 text-sm">
          {totalCount > 0 && `${formatNumber(totalCount)} results`}
        </p>
        <button
          onClick={onFilterClick}
          className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-dark-400" />
          <span className="text-white text-sm">Filters</span>
        </button>
      </div>

      {/* Related searches */}
      {relatedSearches.length > 0 && (
        <div className="mb-6">
          <p className="text-dark-400 text-sm mb-2">Related searches</p>
          <div className="flex flex-wrap gap-2">
            {relatedSearches.map((term) => (
              <button
                key={term}
                onClick={() => search(term)}
                className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-full text-sm text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((item, index) => (
          <SearchResultCard
            key={item.id}
            item={item}
            index={index}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="h-10" />
    </div>
  );
}

interface SearchResultCardProps {
  item: MediaItem;
  index: number;
  onClick: () => void;
}

function SearchResultCard({ item, index, onClick }: SearchResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-dark-800 mb-2">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
          {formatDuration(item.duration)}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-white text-sm font-medium line-clamp-2 mb-1">
          {item.title}
        </p>
        <div className="flex items-center gap-2">
          <img
            src={item.creator.avatar}
            alt={item.creator.name}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-dark-400 text-xs truncate">
            {item.creator.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-dark-500 text-xs mt-1">
          <span>{formatNumber(item.views)} views</span>
          <span>•</span>
          <span>{formatNumber(item.likes)} likes</span>
        </div>
      </div>
    </motion.div>
  );
}
