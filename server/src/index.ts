import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// --- Middleware ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'], // Vite dev & preview
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

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🚀 OOTDash Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Dashboard:    GET http://localhost:${PORT}/api/dashboard?lat=X&lon=Y\n`);
});

export default app;
