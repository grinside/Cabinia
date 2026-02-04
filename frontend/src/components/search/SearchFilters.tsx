import { motion } from 'framer-motion';
import { X, SlidersHorizontal, Calendar, Clock, User } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import type { SearchFilters, SearchSort } from '@/types';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { value: 'short', label: 'Under 1 min' },
  { value: 'medium', label: '1-5 min' },
  { value: 'long', label: 'Over 5 min' },
] as const;

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
] as const;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'date', label: 'Most recent' },
  { value: 'views', label: 'Most viewed' },
  { value: 'likes', label: 'Most liked' },
] as const;

const CATEGORY_OPTIONS = [
  'Entertainment',
  'Music',
  'Dance',
  'Comedy',
  'Sports',
  'Gaming',
  'Education',
  'News',
  'Food',
  'Travel',
  'Fashion',
  'Technology',
];

export function SearchFiltersPanel({ onClose }: SearchFiltersProps) {
  const { filters, sort, setFilters, setSort, clearFilters } = useSearchStore();

  const hasActiveFilters =
    filters.category ||
    filters.duration ||
    filters.uploadDate ||
    sort !== 'relevance';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-dark-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-white">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:underline"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Sort */}
        <FilterSection icon={SlidersHorizontal} title="Sort by">
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isActive={sort === option.value}
                onClick={() => setSort(option.value as SearchSort)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection icon={Clock} title="Duration">
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isActive={filters.duration === option.value}
                onClick={() =>
                  setFilters({
                    duration:
                      filters.duration === option.value
                        ? undefined
                        : option.value,
                  })
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Upload date */}
        <FilterSection icon={Calendar} title="Upload date">
          <div className="flex flex-wrap gap-2">
            {DATE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isActive={filters.uploadDate === option.value}
                onClick={() =>
                  setFilters({
                    uploadDate:
                      filters.uploadDate === option.value
                        ? undefined
                        : option.value,
                  })
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection icon={User} title="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((category) => (
              <FilterChip
                key={category}
                label={category}
                isActive={filters.category === category}
                onClick={() =>
                  setFilters({
                    category: filters.category === category ? undefined : category,
                  })
                }
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply button */}
      <div className="p-4 border-t border-dark-700">
        <button onClick={onClose} className="btn-primary w-full">
          Apply filters
        </button>
      </div>
    </motion.div>
  );
}

interface FilterSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

function FilterSection({ icon: Icon, title, children }: FilterSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-dark-400" />
        <h4 className="text-white font-medium">{title}</h4>
      </div>
      {children}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        isActive
          ? 'bg-primary-500 text-white'
          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
      )}
    >
      {label}
    </button>
  );
}
