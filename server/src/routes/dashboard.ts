import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();

/**
 * GET /api/dashboard?lat={x}&lon={y}
 * Protected route — requires a valid Supabase JWT in Authorization header.
 */
router.get('/dashboard', authMiddleware, getDashboard);

export default router;
