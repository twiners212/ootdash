import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string; // Supabase user UUID
        email?: string;
        role?: string;
      };
    }
  }
}

// JWKS client for verifying ES256 tokens from Supabase Auth
const client = jwksClient({
  jwksUri: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
  cache: true,
  cacheMaxAge: 600000, // Cache keys for 10 minutes
});

/**
 * Retrieves the signing key from the JWKS endpoint by key ID.
 */
function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) {
      return reject(new Error('JWT header missing kid'));
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      const signingKey = key?.getPublicKey();
      if (!signingKey) return reject(new Error('No signing key found'));
      resolve(signingKey);
    });
  });
}

/**
 * Middleware to validate Supabase JWT tokens.
 * 
 * Supports two verification methods:
 * 1. ES256 (asymmetric) via JWKS — used by modern Supabase Auth
 * 2. HS256 (symmetric) via SUPABASE_JWT_SECRET — legacy fallback
 * 
 * In dev mode without a token, bypasses auth entirely.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Dev-mode bypass: skip JWT validation when running locally without a token
  if (process.env.NODE_ENV !== 'production' && (!authHeader || !authHeader.startsWith('Bearer '))) {
    console.warn('[AUTH] Dev-mode: bypassing JWT validation. Set NODE_ENV=production to enforce auth.');
    req.user = {
      sub: 'dev-user-00000000-0000-0000-0000-000000000000',
      email: 'dev@ootdash.local',
      role: 'authenticated',
    };
    next();
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Decode the header to determine the algorithm
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded || !decoded.header) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token format.',
    });
    return;
  }

  if (decoded.header.alg === 'ES256') {
    // Modern Supabase Auth: verify with JWKS (asymmetric ES256)
    verifyWithJWKS(token, decoded.header, req, res, next);
  } else {
    // Legacy: verify with symmetric secret (HS256)
    verifyWithSecret(token, req, res, next);
  }
}

/**
 * Verify token using JWKS endpoint (ES256).
 */
async function verifyWithJWKS(
  token: string,
  header: jwt.JwtHeader,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signingKey = await getSigningKey(header);
    
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['ES256'],
    }) as jwt.JwtPayload;

    req.user = {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      role: payload.role as string | undefined,
    };

    next();
  } catch (err) {
    console.error('[AUTH] ES256 token verification failed:', (err as Error).message);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
}

/**
 * Verify token using symmetric secret (HS256 — legacy).
 */
function verifyWithSecret(
  token: string,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    console.error('[AUTH] SUPABASE_JWT_SECRET is not set in environment variables.');
    res.status(500).json({
      status: 'error',
      message: 'Server authentication configuration error.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    req.user = {
      sub: decoded.sub as string,
      email: decoded.email as string | undefined,
      role: decoded.role as string | undefined,
    };

    next();
  } catch (err) {
    console.error('[AUTH] HS256 token verification failed:', (err as Error).message);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
}
