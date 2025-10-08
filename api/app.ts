/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors, { type CorsOptions } from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import bannerRoutes from './routes/banners.js';
import solutionRoutes from './routes/solutions.js';
import productRoutes from './routes/products.js';
import analyticsRoutes from './routes/analytics.js';

// load env
dotenv.config();


const app: express.Application = express();

// CORS配置
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const fallbackOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:5173', 'http://localhost:3000'];

const allowedOrigins = envOrigins.length > 0 ? envOrigins : fallbackOrigins;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;