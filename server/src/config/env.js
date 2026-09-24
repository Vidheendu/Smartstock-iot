import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn(
      `[CONFIG WARNING] Missing recommended environment variable(s): ${missing.join(', ')}. ` +
      `Ensure you configure server/.env before connecting to Supabase or running auth.`
    );
  }
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-in-production'
  }
};

export default config;
