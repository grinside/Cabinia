# Cabinia - TikTok-Style Media PWA with Wallet Integration

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CABINIA PLATFORM                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (PWA)                            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ TikTok  │ │ Wallet  │ │ Search  │ │ Profile │           │   │
│  │  │ Feed    │ │ Module  │ │ Engine  │ │ Manager │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │              HLS/Media Player Engine                 │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    BACKEND SERVICES                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │   CMS   │ │  Auth   │ │ Payment │ │ Telco   │           │   │
│  │  │  API    │ │ Service │ │ Gateway │ │ Bridge  │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │         Two-Tower Recommendation Engine              │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                                │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ MongoDB │ │  Redis  │ │ Vector  │ │  CDN    │           │   │
│  │  │ (Data)  │ │ (Cache) │ │   DB    │ │ (Media) │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

- **TikTok-Style Navigation**: Vertical swipe feed for HLS/YouTube Shorts
- **PWA Support**: Installable, offline-capable, push notifications
- **Multi-Currency Wallet**: African & International payment methods
- **Telco Integration**: Real-time mobile balance tracking
- **Phone Authentication**: OTP-based registration
- **Two-Tower Recommendation**: ML-powered content discovery
- **Advanced Search**: Semantic search with behavioral learning
- **Adaptive UI**: Personalized experience based on user behavior

## 📁 Project Structure

```
cabinia/
├── frontend/              # React PWA Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # State management (Zustand)
│   │   ├── services/      # API & external services
│   │   ├── lib/           # Utilities and helpers
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── backend/               # Node.js API Server
│   ├── src/
│   │   ├── api/           # REST API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── lib/           # Utilities
│   └── config/            # Configuration files
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS + Framer Motion
- Zustand (State management)
- HLS.js (Video streaming)
- Workbox (PWA/Service Worker)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis (Caching)
- JWT + OTP Authentication
- TensorFlow.js (Recommendations)

### Payment Integrations
- MTN MoMo, Orange Money, Wave
- M-Pesa, Airtel Money
- Stripe, PayPal, Flutterwave

## 🚦 Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📄 License

MIT License - Cabinia 2024
