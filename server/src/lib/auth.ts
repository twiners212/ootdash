import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'https://ootdash.vercel.app',
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://ootdash.vercel.app',
    'https://*.vercel.app',
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      birthDate: {
        type: 'string',
        required: false,
        input: true,
      },
      gender: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
});
