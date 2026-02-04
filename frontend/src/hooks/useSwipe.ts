import { useState, useCallback, useRef } from 'react';

interface SwipeState {
  startY: number;
  currentY: number;
  isDragging: boolean;
  direction: 'up' | 'down' | null;
}

interface UseSwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const { onSwipeUp, onSwipeDown, threshold = 50, preventScroll = true } = options;

  const [state, setState] = useState<SwipeState>({
    startY: 0,
    currentY: 0,
    isDragging: false,
    direction: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setState({
      startY: touch.clientY,
      currentY: touch.clientY,
      isDragging: true,
      direction: null,
    });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!state.isDragging) return;

      if (preventScroll) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaY = state.startY - touch.clientY;
      const direction = deltaY > 0 ? 'up' : 'down';

      setState((prev) => ({
        ...prev,
        currentY: touch.clientY,
        direction,
      }));
    },
    [state.isDragging, state.startY, preventScroll]
  );

  const handleTouchEnd = useCallback(() => {
    if (!state.isDragging) return;

    const deltaY = state.startY - state.currentY;
    const absDelta = Math.abs(deltaY);

    if (absDelta > threshold) {
      if (deltaY > 0 && onSwipeUp) {
        onSwipeUp();
      } else if (deltaY < 0 && onSwipeDown) {
        onSwipeDown();
      }
    }

    setState({
      startY: 0,
      currentY: 0,
      isDragging: false,
      direction: null,
    });
  }, [state.isDragging, state.startY, state.currentY, threshold, onSwipeUp, onSwipeDown]);

  const delta = state.isDragging ? state.startY - state.currentY : 0;
  const progress = Math.min(Math.abs(delta) / threshold, 1);

  return {
    containerRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
    isDragging: state.isDragging,
    direction: state.direction,
    delta,
    progress,
  };
}
