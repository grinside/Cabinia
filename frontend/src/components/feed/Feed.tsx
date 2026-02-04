import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { FeedItem } from './FeedItem';
import { useFeedStore } from '@/stores/feedStore';
import { cn } from '@/lib/utils';

interface FeedProps {
  onCommentOpen?: (itemId: string) => void;
  onCreatorClick?: (creatorId: string) => void;
  className?: string;
}

export function Feed({ onCommentOpen, onCreatorClick, className }: FeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    items,
    currentIndex,
    isLoading,
    hasMore,
    fetchFeed,
    setCurrentIndex,
    likeItem,
    bookmarkItem,
    shareItem,
    recordBehavior,
  } = useFeedStore();

  // Initial fetch
  useEffect(() => {
    if (items.length === 0) {
      fetchFeed();
    }
  }, [items.length, fetchFeed]);

  // Handle scroll/swipe navigation
  const goToNext = useCallback(() => {
    if (currentIndex < items.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, items.length, isTransitioning, setCurrentIndex]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, isTransitioning, setCurrentIndex]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;

      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart - touchEnd;
      const threshold = 50;

      if (diff > threshold) {
        goToNext();
      } else if (diff < -threshold) {
        goToPrevious();
      }

      setTouchStart(null);
    },
    [touchStart, goToNext, goToPrevious]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Wheel navigation
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout;
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTime < 500) return; // Debounce

      if (e.deltaY > 30) {
        goToNext();
        lastWheelTime = now;
      } else if (e.deltaY < -30) {
        goToPrevious();
        lastWheelTime = now;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(wheelTimeout);
    };
  }, [goToNext, goToPrevious]);

  // Prefetch more when near end
  useEffect(() => {
    if (currentIndex >= items.length - 3 && hasMore && !isLoading) {
      fetchFeed();
    }
  }, [currentIndex, items.length, hasMore, isLoading, fetchFeed]);

  // Handle follow
  const handleFollow = useCallback(
    (creatorId: string) => {
      recordBehavior({ type: 'follow', itemId: creatorId });
      // API call would go here
    },
    [recordBehavior]
  );

  if (items.length === 0 && isLoading) {
    return (
      <div className="full-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative full-screen overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => {
          // Only render current, previous, and next items for performance
          if (Math.abs(index - currentIndex) > 1) return null;

          const offset = index - currentIndex;

          return (
            <motion.div
              key={item.id}
              initial={{ y: offset > 0 ? '100%' : '-100%' }}
              animate={{ y: offset * 100 + '%' }}
              exit={{ y: offset > 0 ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0"
            >
              <FeedItem
                item={item}
                isActive={index === currentIndex}
                onLike={() => likeItem(item.id)}
                onBookmark={() => bookmarkItem(item.id)}
                onShare={() => shareItem(item.id)}
                onComment={() => onCommentOpen?.(item.id)}
                onFollow={() => handleFollow(item.creator.id)}
                onCreatorClick={() => onCreatorClick?.(item.creator.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading indicator at bottom */}
      {isLoading && currentIndex >= items.length - 2 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}

      {/* Swipe hint for first-time users */}
      {currentIndex === 0 && items.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 2 }}
          className="swipe-indicator"
        >
          Swipe up for more
        </motion.div>
      )}
    </div>
  );
}
