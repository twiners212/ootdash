import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();

/**
 * GET /api/dashboard
 * Protected route — requires a valid session via Better Auth.
 * Accepts ?lat=xxx&lon=yyy for weather data fetching.
 */
router.get('/dashboard', authMiddleware, getDashboard);

export default router;
