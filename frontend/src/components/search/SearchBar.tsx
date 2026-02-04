import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Mic,
  Camera,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function SearchBar({ onFocus, onBlur, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    history,
    search,
    removeFromHistory,
  } = useSearchStore();

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay blur to allow click on suggestions
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search();
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    search(suggestion);
  };

  const handleVoiceSearch = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionClass();

    recognition.lang = 'fr-FR';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      search(transcript);
    };

    recognition.start();
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center gap-3 bg-dark-800 rounded-full px-4 py-3 transition-all border-2',
            isFocused ? 'border-primary-500' : 'border-transparent'
          )}
        >
          <Search className="w-5 h-5 text-dark-400 flex-shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search videos, creators, topics..."
            className="flex-1 bg-transparent text-white placeholder-dark-400 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-dark-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-dark-400" />
            </button>
          )}

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={cn(
              'p-2 rounded-full transition-colors',
              isListening ? 'bg-primary-500 animate-pulse' : 'hover:bg-dark-700'
            )}
          >
            <Mic className={cn('w-5 h-5', isListening ? 'text-white' : 'text-dark-400')} />
          </button>

          <button
            type="button"
            className="p-2 hover:bg-dark-700 rounded-full transition-colors"
          >
            <Camera className="w-5 h-5 text-dark-400" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || history.length > 0 || !query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-dark-800 rounded-2xl overflow-hidden shadow-xl border border-dark-700"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 rounded-xl transition-colors"
                  >
                    <Search className="w-4 h-4 text-dark-400" />
                    <span className="flex-1 text-left text-white">
                      <HighlightText text={suggestion} highlight={query} />
                    </span>
                    <ArrowRight className="w-4 h-4 text-dark-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Search history */}
            {!query && history.length > 0 && (
              <div className="p-2">
                <h3 className="px-4 py-2 text-dark-400 text-sm font-medium">Recent searches</h3>
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.query}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 rounded-xl transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-dark-400" />
                    <button
                      onClick={() => handleSuggestionClick(item.query)}
                      className="flex-1 text-left text-white"
                    >
                      {item.query}
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.query)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                    >
                      <X className="w-4 h-4 text-dark-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trending */}
            {!query && (
              <div className="p-2 border-t border-dark-700">
                <h3 className="px-4 py-2 text-dark-400 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </h3>
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {['Dance', 'Comedy', 'Music', 'Sports', 'Food'].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSuggestionClick(trend)}
                      className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-full text-sm text-white transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className="font-semibold text-primary-500">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
