// @ts-nocheck
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let rawConn = process.env.DATABASE_URL || 'postgres://localhost:5432/defaultdb';
if (!rawConn.includes('schema=')) {
  rawConn += (rawConn.includes('?') ? '&' : '?') + 'schema=cricverse';
}
const connectionString = rawConn;

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  options: '-c search_path=cricverse,public'
});

pool.on('error', (err) => {
  console.warn('Unexpected error on idle pg client pool', err);
});

const adapter = new PrismaPg(pool, { schema: 'cricverse' });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
