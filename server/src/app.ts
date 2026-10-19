import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

// --- Middleware ---
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests with no origin
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      process.env.APP_URL,
      process.env.BETTER_AUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ].filter(Boolean) as string[];

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// --- Better Auth Route ---
app.all('/api/auth/*splat', toNodeHandler(auth));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ootdash-server',
  });
});

// --- API Routes ---
app.use('/api', dashboardRoutes);

// --- 404 Fallback ---
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
export { app };
