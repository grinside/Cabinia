import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import type { MediaItem } from '@/types';
import { cn, formatNumber } from '@/lib/utils';

interface FeedItemProps {
  item: MediaItem;
  isActive: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onComment: () => void;
  onFollow: () => void;
  onCreatorClick: () => void;
}

export function FeedItem({
  item,
  isActive,
  onLike,
  onBookmark,
  onShare,
  onComment,
  onFollow,
  onCreatorClick,
}: FeedItemProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="feed-item relative bg-dark-950">
      {/* Video */}
      <VideoPlayer
        src={item.mediaUrl}
        hlsSrc={item.hlsUrl}
        poster={item.thumbnailUrl}
        isActive={isActive}
        showControls={false}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-32 gradient-top pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 gradient-bottom pointer-events-none" />

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        {/* Creator avatar */}
        <div className="relative">
          <button
            onClick={onCreatorClick}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white"
          >
            <img
              src={item.creator.avatar}
              alt={item.creator.name}
              className="w-full h-full object-cover"
            />
          </button>
          {!item.creator.isFollowing && (
            <button
              onClick={onFollow}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
            >
              <UserPlus className="w-3 h-3 text-white" />
            </button>
          )}
        </div>

        {/* Like */}
        <ActionButton
          icon={Heart}
          count={item.likes}
          isActive={item.isLiked}
          activeColor="text-primary-500"
          onClick={onLike}
          filled={item.isLiked}
        />

        {/* Comment */}
        <ActionButton
          icon={MessageCircle}
          count={item.comments}
          onClick={onComment}
        />

        {/* Bookmark */}
        <ActionButton
          icon={Bookmark}
          count={0}
          isActive={item.isBookmarked}
          activeColor="text-yellow-500"
          onClick={onBookmark}
          filled={item.isBookmarked}
          showCount={false}
        />

        {/* Share */}
        <ActionButton
          icon={Share2}
          count={item.shares}
          onClick={onShare}
        />

        {/* More */}
        <button className="action-btn-icon">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 right-20 bottom-6">
        {/* Creator info */}
        <button onClick={onCreatorClick} className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white text-shadow">
            @{item.creator.username}
          </span>
          {item.creator.isVerified && (
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </span>
          )}
        </button>

        {/* Description */}
        <div className="mb-3">
          <p
            className={cn(
              'text-white text-sm text-shadow',
              !showMore && 'line-clamp-2'
            )}
          >
            {item.description}
          </p>
          {item.description.length > 100 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-white/70 text-sm mt-1"
            >
              {showMore ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-white/80 text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Music/Audio */}
        <motion.div
          animate={{ x: isActive ? [0, -200, 0] : 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-2"
        >
          <Music2 className="w-4 h-4 text-white" />
          <span className="text-white text-sm whitespace-nowrap">
            Original sound - {item.creator.name}
          </span>
        </motion.div>
      </div>

      {/* Spinning disc */}
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute right-4 bottom-6 w-12 h-12 rounded-full bg-dark-800 border-4 border-dark-700 overflow-hidden"
      >
        <img
          src={item.creator.avatar}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  count: number;
  isActive?: boolean;
  activeColor?: string;
  onClick: () => void;
  filled?: boolean;
  showCount?: boolean;
}

function ActionButton({
  icon: Icon,
  count,
  isActive = false,
  activeColor = 'text-white',
  onClick,
  filled = false,
  showCount = true,
}: ActionButtonProps) {
  return (
    <button className="action-btn" onClick={onClick}>
      <motion.div
        whileTap={{ scale: 1.3 }}
        className="action-btn-icon"
      >
        <Icon
          className={cn('w-7 h-7', isActive ? activeColor : 'text-white')}
          fill={filled ? 'currentColor' : 'none'}
        />
      </motion.div>
      {showCount && (
        <span className="text-white text-xs font-medium">
          {formatNumber(count)}
        </span>
      )}
    </button>
  );
}
