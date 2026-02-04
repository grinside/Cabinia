import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Edit2,
  Grid,
  Heart,
  Bookmark,
  LogOut,
  ChevronRight,
  Moon,
  Bell,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { formatNumber } from '@/lib/utils';

type Tab = 'videos' | 'liked' | 'saved';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 pb-20">
        <Header title="Profile" />

        <div className="pt-20 px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-dark-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Sign in to your profile</h2>
          <p className="text-dark-400 text-center mb-6">
            See your videos, likes, and saved content
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
          >
            Sign in
          </button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <BottomNav />
      </div>
    );
  }

  if (showSettings) {
    return (
      <SettingsView onBack={() => setShowSettings(false)} onLogout={logout} />
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      {/* Header with settings */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-b border-dark-800 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-white font-semibold text-lg">@{user?.displayName || 'user'}</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-dark-800 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="pt-16 px-4">
        {/* Profile header */}
        <div className="text-center py-6">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-dark-700"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center border-2 border-dark-950">
              <Edit2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Name */}
          <h2 className="text-white text-xl font-semibold mb-1">
            {user?.displayName || 'Add your name'}
          </h2>
          <p className="text-dark-400 text-sm mb-4">
            {user?.phone ? `+${user.phone}` : ''}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <StatItem value={0} label="Following" />
            <StatItem value={0} label="Followers" />
            <StatItem value={0} label="Likes" />
          </div>

          {/* Edit profile button */}
          <button className="btn-secondary">
            Edit profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800">
          <TabButton
            icon={Grid}
            isActive={activeTab === 'videos'}
            onClick={() => setActiveTab('videos')}
          />
          <TabButton
            icon={Heart}
            isActive={activeTab === 'liked'}
            onClick={() => setActiveTab('liked')}
          />
          <TabButton
            icon={Bookmark}
            isActive={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
          />
        </div>

        {/* Content */}
        <div className="py-6">
          <EmptyState tab={activeTab} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-white font-bold text-lg">{formatNumber(value)}</p>
      <p className="text-dark-400 text-sm">{label}</p>
    </div>
  );
}

function TabButton({
  icon: Icon,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 relative ${isActive ? 'text-white' : 'text-dark-400'}`}
    >
      <Icon className="w-6 h-6 mx-auto" />
      {isActive && (
        <motion.div
          layoutId="profileTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
        />
      )}
    </button>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const config = {
    videos: {
      icon: Grid,
      title: 'No videos yet',
      description: 'Videos you create will appear here',
    },
    liked: {
      icon: Heart,
      title: 'No liked videos',
      description: 'Videos you like will appear here',
    },
    saved: {
      icon: Bookmark,
      title: 'No saved videos',
      description: 'Videos you save will appear here',
    },
  };

  const { icon: Icon, title, description } = config[tab];

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-dark-500" />
      </div>
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-dark-400 text-sm">{description}</p>
    </div>
  );
}

function SettingsView({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  const settings = [
    { icon: Bell, label: 'Notifications', onClick: () => {} },
    { icon: Shield, label: 'Privacy', onClick: () => {} },
    { icon: Moon, label: 'Dark mode', toggle: true },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <div className="fixed top-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-b border-dark-800 safe-area-top">
        <div className="flex items-center h-14 px-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-dark-800 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <h1 className="text-white font-semibold text-lg ml-2">Settings</h1>
        </div>
      </div>

      <div className="pt-16 px-4">
        <div className="space-y-2">
          {settings.map(({ icon: Icon, label, onClick, toggle }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center justify-between p-4 bg-dark-800 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-dark-400" />
                <span className="text-white">{label}</span>
              </div>
              {toggle ? (
                <div className="w-12 h-7 bg-dark-700 rounded-full p-1">
                  <div className="w-5 h-5 bg-dark-500 rounded-full" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-dark-400" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-4 mt-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
