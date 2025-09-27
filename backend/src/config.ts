import dotenv from 'dotenv';
dotenv.config();

const get = (key: string, def?: string) => process.env[key] ?? def ?? '';

export const config = {
  port: Number(get('PORT', '4000')),
  mongoUri: get('MONGO_URI'),
  jwtSecret: get('JWT_SECRET', 'change_me'),
  corsOrigins: get('CORS_ORIGINS', '*').split(',').map((s) => s.trim()),
};

if (!config.mongoUri) {
  console.warn('MONGO_URI is not set. Set it in .env');
}

