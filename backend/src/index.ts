import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './api/routes/auth.js';
import feedRoutes from './api/routes/feed.js';
import walletRoutes from './api/routes/wallet.js';
import telcoRoutes from './api/routes/telco.js';
import searchRoutes from './api/routes/search.js';
import recommendationRoutes from './api/routes/recommendations.js';
import cmsRoutes from './api/routes/cms.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/telco', telcoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/cms', cmsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Start server
const PORT = config.port || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
