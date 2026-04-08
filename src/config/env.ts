import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bauelemente_kasten',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars!!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3004,https://bauelemente-kasten.de',
  nodeEnv: process.env.NODE_ENV || 'development',
};
