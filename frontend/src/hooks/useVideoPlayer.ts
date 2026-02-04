import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

interface UseVideoPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

interface VideoPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  buffered: number;
  error: string | null;
}

export function useVideoPlayer(
  src: string,
  options: UseVideoPlayerOptions = {}
) {
  const {
    autoplay = true,
    loop = true,
    muted = false,
    onProgress,
    onEnded,
    onError,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    isLoading: true,
    isMuted: muted,
    progress: 0,
    duration: 0,
    currentTime: 0,
    buffered: 0,
    error: null,
  });

  // Initialize HLS or native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const isHls = src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState((prev) => ({ ...prev, isLoading: false }));
        if (autoplay) {
          video.play().catch(() => {
            // Autoplay blocked, need user interaction
            setState((prev) => ({ ...prev, isMuted: true }));
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setState((prev) => ({
            ...prev,
            error: 'Video playback error',
            isLoading: false,
          }));
          onError?.('Video playback error');
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      if (autoplay) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      // Standard video
      video.src = src;
      if (autoplay) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay, onError]);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleTimeUpdate = () => {
      const progress = video.duration ? video.currentTime / video.duration : 0;
      setState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        progress,
      }));
      onProgress?.(progress);
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: video.duration,
        isLoading: false,
      }));
    };

    const handleWaiting = () => {
      setState((prev) => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({ ...prev, isLoading: false }));
    };

    const handleEnded = () => {
      if (!loop) {
        setState((prev) => ({ ...prev, isPlaying: false }));
        onEnded?.();
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = video.buffered.end(video.buffered.length - 1);
        setState((prev) => ({
          ...prev,
          buffered: video.duration ? buffered / video.duration : 0,
        }));
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);
    };
  }, [loop, onProgress, onEnded]);

  const play = useCallback(() => {
    videoRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setState((prev) => ({ ...prev, isMuted: videoRef.current!.muted }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const seekToProgress = useCallback((progress: number) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = progress * videoRef.current.duration;
    }
  }, []);

  return {
    videoRef,
    state,
    controls: {
      play,
      pause,
      toggle,
      toggleMute,
      seek,
      seekToProgress,
    },
  };
}
