// User & Authentication Types
export interface User {
  id: string;
  phone: string;
  countryCode: string;
  displayName?: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
  wallet: WalletInfo;
  telcoBalances: TelcoBalance[];
}

export interface UserPreferences {
  language: string;
  currency: string;
  notificationsEnabled: boolean;
  autoplayEnabled: boolean;
  dataMode: 'auto' | 'low' | 'high';
  categories: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Media & Feed Types
export interface MediaItem {
  id: string;
  type: 'video' | 'short' | 'live';
  title: string;
  description: string;
  thumbnailUrl: string;
  mediaUrl: string;
  hlsUrl?: string;
  duration: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  creator: Creator;
  tags: string[];
  category: string;
  createdAt: Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  isFollowing?: boolean;
}

export interface FeedState {
  items: MediaItem[];
  currentIndex: number;
  isLoading: boolean;
  hasMore: boolean;
  category: string | null;
}

// Wallet & Payment Types
export interface WalletInfo {
  id: string;
  balance: number;
  currency: string;
  linkedMethods: PaymentMethod[];
  transactions: Transaction[];
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  provider: string;
  name: string;
  accountNumber: string;
  isDefault: boolean;
  isVerified: boolean;
  icon: string;
}

export type PaymentMethodType =
  | 'mobile_money'
  | 'bank_card'
  | 'bank_transfer'
  | 'paypal'
  | 'crypto';

export interface PaymentProvider {
  id: string;
  name: string;
  type: PaymentMethodType;
  countries: string[];
  icon: string;
  fees: {
    deposit: number;
    withdrawal: number;
  };
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  description: string;
  createdAt: Date;
  reference: string;
}

// Telco Types
export interface TelcoBalance {
  id: string;
  operator: TelcoOperator;
  phone: string;
  balances: {
    airtime: number;
    data: DataBalance;
    sms: number;
  };
  lastUpdated: Date;
}

export interface TelcoOperator {
  id: string;
  name: string;
  country: string;
  icon: string;
  ussdCode: string;
}

export interface DataBalance {
  remaining: number;
  total: number;
  unit: 'MB' | 'GB';
  expiresAt: Date;
}

// Search Types
export interface SearchQuery {
  text: string;
  filters: SearchFilters;
  sort: SearchSort;
}

export interface SearchFilters {
  category?: string;
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'today' | 'week' | 'month' | 'year';
  creator?: string;
}

export type SearchSort = 'relevance' | 'date' | 'views' | 'likes';

export interface SearchResult {
  items: MediaItem[];
  suggestions: string[];
  relatedSearches: string[];
  totalCount: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

// Recommendation Types
export interface RecommendationContext {
  userId: string;
  currentItemId?: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
  behaviorSignals: BehaviorSignal[];
}

export interface BehaviorSignal {
  type: 'view' | 'like' | 'share' | 'skip' | 'complete' | 'search' | 'follow';
  itemId?: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface DeviceInfo {
  platform: string;
  screenWidth: number;
  screenHeight: number;
  connectionType: string;
}

// CMS Types
export interface CMSContent {
  id: string;
  type: 'banner' | 'category' | 'featured' | 'promotion';
  title: string;
  content: Record<string, unknown>;
  placement: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  priority: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  itemCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
