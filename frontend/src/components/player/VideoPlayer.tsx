import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { cn, formatDuration } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  hlsSrc?: string;
  poster?: string;
  isActive?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
}

export function VideoPlayer({
  src,
  hlsSrc,
  poster,
  isActive = true,
  autoplay = true,
  loop = true,
  showControls = true,
  onProgress,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoSrc = hlsSrc || src;

  const { videoRef, state, controls } = useVideoPlayer(videoSrc, {
    autoplay: autoplay && isActive,
    loop,
    onProgress,
    onEnded,
  });

  // Pause when not active (scrolled away)
  useEffect(() => {
    if (isActive) {
      controls.play();
    } else {
      controls.pause();
    }
  }, [isActive, controls]);

  return (
    <div
      className={cn('relative w-full h-full bg-dark-900 overflow-hidden', className)}
      onClick={controls.toggle}
    >
      <video
        ref={videoRef}
        poster={poster}
        loop={loop}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Loading indicator */}
      <AnimatePresence>
        {state.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-dark-900/50"
          >
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!state.isPlaying && !state.isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-dark-900/60 backdrop-blur flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 gradient-bottom p-4 pointer-events-none">
          {/* Progress bar */}
          <div className="mb-3 pointer-events-auto">
            <div
              className="h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const progress = (e.clientX - rect.left) / rect.width;
                controls.seekToProgress(progress);
              }}
            >
              {/* Buffered */}
              <div
                className="h-full bg-white/30 absolute"
                style={{ width: `${state.buffered * 100}%` }}
              />
              {/* Progress */}
              <div
                className="h-full bg-primary-500 relative"
                style={{ width: `${state.progress * 100}%` }}
              />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  controls.toggle();
                }}
                className="text-white"
              >
                {state.isPlaying ? (
                  <Pause className="w-6 h-6" fill="white" />
                ) : (
                  <Play className="w-6 h-6" fill="white" />
                )}
              </button>

              <span className="text-white text-sm">
                {formatDuration(state.currentTime)} / {formatDuration(state.duration)}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                controls.toggleMute();
              }}
              className="text-white"
            >
              {state.isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80">
          <div className="text-center">
            <p className="text-red-500 mb-2">{state.error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.reload();
              }}
              className="btn-secondary text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
