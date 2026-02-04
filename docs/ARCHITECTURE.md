# Cabinia Architecture Documentation

## Overview

Cabinia is a modern PWA that combines TikTok-style media consumption with financial services (wallet and telco integration).

## System Architecture

### Frontend (React + Vite PWA)

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components (PhoneInput, OtpInput, AuthModal)
│   ├── feed/           # Feed components (Feed, FeedItem)
│   ├── player/         # Video player (HLS support)
│   ├── search/         # Search components (SearchBar, Filters, Results)
│   ├── wallet/         # Wallet components (WalletCard, PaymentMethods, Transactions)
│   ├── layout/         # Layout components (Header, BottomNav)
│   └── common/         # Shared UI components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── services/           # API service layer
├── lib/                # Utilities
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

### Backend (Node.js + Express)

```
src/
├── api/
│   ├── routes/         # Express routes
│   └── controllers/    # Request handlers
├── services/           # Business logic
│   └── recommendationEngine.ts  # Two-tower recommendation system
├── models/             # Database models
├── middleware/         # Express middleware
├── lib/                # Utilities
└── config/             # Configuration
```

## Key Features

### 1. TikTok-Style Navigation
- Vertical swipe feed with snap scrolling
- HLS video streaming support
- Optimistic UI updates
- Infinite scroll with prefetching

### 2. Phone Authentication
- OTP-based authentication
- Multi-country support (Africa + International)
- Secure token management

### 3. Wallet System
- Multi-currency support (XOF, NGN, KES, etc.)
- Mobile Money integration (MTN, Orange, Wave, M-Pesa)
- Bank card support (Visa, Mastercard)
- Transaction history

### 4. Telco Integration
- Real-time balance checking
- Airtime purchase
- Data bundle purchase
- Multi-operator support

### 5. Two-Tower Recommendation Engine
- User tower: Encodes user preferences from behavior
- Item tower: Encodes content features
- Real-time personalization
- Diversity and exploration balance

### 6. Advanced Search
- Full-text search
- Voice search support
- Visual search (placeholder)
- Semantic search with embeddings
- Personalized suggestions

## Data Flow

```
User Action → UI Component → Store → Service → API → Backend
                              ↑                        ↓
                              └──────── Response ──────┘
```

## State Management (Zustand)

- **authStore**: User authentication state
- **feedStore**: Feed items and current position
- **walletStore**: Wallet, payments, and telco balances
- **searchStore**: Search query, results, and history

## API Endpoints

### Auth
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh token
- `PATCH /api/auth/profile` - Update profile

### Feed
- `GET /api/feed` - Get feed items
- `POST /api/feed/items/:id/like` - Like item
- `POST /api/feed/items/:id/bookmark` - Bookmark item

### Wallet
- `GET /api/wallet` - Get wallet info
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/transfer` - Transfer funds

### Telco
- `GET /api/telco/balances` - Get all telco balances
- `POST /api/telco/accounts` - Add telco account
- `POST /api/telco/airtime/purchase` - Buy airtime
- `POST /api/telco/data/purchase` - Buy data

### Search
- `POST /api/search` - Search content
- `GET /api/search/suggestions` - Get autocomplete
- `POST /api/search/semantic` - Semantic search

### Recommendations
- `POST /api/recommendations` - Get recommendations
- `GET /api/recommendations/for-you` - Personalized feed
- `POST /api/recommendations/behaviors` - Record behaviors

### CMS
- `GET /api/cms/content` - Get CMS content
- `GET /api/cms/categories` - Get categories
- `GET /api/cms/config` - Get app configuration

## Deployment

### Frontend (GitHub Pages)
1. Build: `npm run build --workspace=frontend`
2. Deploy: `gh-pages -d frontend/dist`

### Backend (Any Node.js host)
- Railway, Render, Heroku, AWS, etc.
- Docker support recommended for production

## Security Considerations

- JWT-based authentication
- Rate limiting
- CORS configuration
- Input validation with Zod
- No sensitive data in frontend

## Performance Optimizations

- Code splitting (vendor, player, ui chunks)
- Image lazy loading
- Video preloading
- Service worker caching
- Optimistic UI updates
