import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, PlusSquare, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/create', icon: PlusSquare, label: 'Create', special: true },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-t border-dark-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.special) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn('nav-item relative', isActive && 'active')}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-white' : 'text-dark-400'
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs transition-colors',
                  isActive ? 'text-white' : 'text-dark-400'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
