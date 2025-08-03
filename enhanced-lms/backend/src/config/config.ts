import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gail_lms',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
