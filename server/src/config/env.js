import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn(
      `[CONFIG WARNING] Missing recommended environment variable(s): ${missing.join(', ')}. ` +
      `Ensure you configure server/.env before production deployment.`
    );
  }
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  },
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-jwt-secret-for-smartstock-testing',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

export default config;
