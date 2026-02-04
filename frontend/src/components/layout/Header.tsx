import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  transparent?: boolean;
  showCategories?: boolean;
  title?: string;
}

const CATEGORIES = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'live', label: 'LIVE' },
];

export function Header({ transparent = false, showCategories = false, title }: HeaderProps) {
  const [activeCategory, setActiveCategory] = useState('for-you');
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 safe-area-top',
        transparent
          ? 'bg-gradient-to-b from-black/60 to-transparent'
          : 'bg-dark-950/95 backdrop-blur-lg border-b border-dark-800'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left */}
        <div className="flex items-center gap-2 w-24">
          {title ? (
            <h1 className="text-white font-semibold text-lg">{title}</h1>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            </Link>
          )}
        </div>

        {/* Center - Categories */}
        {showCategories && (
          <div className="flex items-center gap-6">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="relative py-3"
              >
                <span
                  className={cn(
                    'text-base font-semibold transition-colors',
                    activeCategory === category.id
                      ? 'text-white'
                      : 'text-dark-400'
                  )}
                >
                  {category.label}
                </span>
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="categoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-2 w-24 justify-end">
          <button className="p-2 hover:bg-dark-800 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {isAuthenticated ? (
            <Link to="/profile">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-dark-700"
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-full"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
