import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  trustedOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
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
