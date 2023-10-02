import { Pool, PoolConnection, createPool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const parseDatabaseUrl = (url: string): PoolOptions => {
  const parsedUrl = new URL(url);
  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    user: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.substr(1)
  };
};

const pool: Pool = createPool(parseDatabaseUrl(process.env.DATABASE_URL || ''));

export const getConnection = async (): Promise<PoolConnection> => {
  return pool.getConnection();
};
