/**
 * This is a API server
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import bannerRoutes from './routes/banners.js';
import solutionRoutes from './routes/solutions.js';
import productRoutes from './routes/products.js';
import analyticsRoutes from './routes/analytics.js';
// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// load env
dotenv.config();
const app = express();
// CORS配置
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-domain.vercel.app', 'https://your-custom-domain.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
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
app.use('/api/health', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'ok'
    });
});
/**
 * error handler middleware
 */
app.use((error, req, res, next) => {
    res.status(500).json({
        success: false,
        error: 'Server internal error'
    });
});
/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'API not found'
    });
});
export default app;
