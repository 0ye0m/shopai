// Set DATABASE_URL explicitly before any Prisma imports
// This is needed because system-level env variables can override .env
import fs from 'fs';
import path from 'path';

if (process.env.DATABASE_URL?.startsWith('file:')) {
  // System has wrong DATABASE_URL, load from .env with override
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (dbUrlMatch) {
      process.env.DATABASE_URL = dbUrlMatch[1].trim();
    }
    const directUrlMatch = envContent.match(/DIRECT_DATABASE_URL=(.+)/);
    if (directUrlMatch) {
      process.env.DIRECT_DATABASE_URL = directUrlMatch[1].trim();
    }
  } catch (e) {
    console.error('Failed to load DATABASE_URL from .env:', e);
  }
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client - it will automatically use DATABASE_URL from env
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
