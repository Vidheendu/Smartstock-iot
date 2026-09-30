import dotenv from 'dotenv';
dotenv.config();

const DEV_DEFAULT_SECRET = 'dev-insecure-jwt-secret-for-smartstock-testing';

export const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredProductionVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

  if (isProduction) {
    const missing = requiredProductionVars.filter((varName) => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`[CONFIG ERROR] Missing required production environment variables: ${missing.join(', ')}`);
    }
    if (process.env.JWT_SECRET === DEV_DEFAULT_SECRET) {
      throw new Error('[CONFIG ERROR] Cannot use default development JWT_SECRET in production mode.');
    }
  } else {
    const missingDev = ['JWT_SECRET'].filter((varName) => !process.env[varName]);
    if (missingDev.length > 0) {
      console.warn(
        `[CONFIG WARNING] Missing recommended environment variable(s): ${missingDev.join(', ')}. ` +
        `Using local development fallback. Ensure you configure server/.env before production deployment.`
      );
    }
  }
};

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl,
  allowedOrigins: [...new Set(allowedOrigins.filter(Boolean))],
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  },
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || DEV_DEFAULT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

export default config;
