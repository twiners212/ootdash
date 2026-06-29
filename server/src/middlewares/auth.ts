import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string; // compatibility with dashboardController: user.id
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Middleware to validate Better Auth sessions.
 * 
 * In dev mode without a session, bypasses auth to use a mock dev user.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      // Dev-mode bypass: skip session validation when running locally without token or cookie
      if (process.env.NODE_ENV !== 'production' && !req.headers.authorization && !req.headers.cookie) {
        console.warn('[AUTH] Dev-mode: bypassing session validation. Set NODE_ENV=production to enforce auth.');
        req.user = {
          sub: 'dev-user-00000000-0000-0000-0000-000000000000',
          email: 'dev@ootdash.local',
        };
        next();
        return;
      }

      res.status(401).json({
        status: 'error',
        message: 'Unauthorized. Missing or invalid session.',
      });
      return;
    }

    req.user = {
      sub: session.user.id,
      email: session.user.email,
    };
    next();
  } catch (error) {
    console.error('[AUTH] Middleware error checking session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server authentication error.',
    });
  }
}
