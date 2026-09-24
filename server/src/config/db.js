import { createClient } from '@supabase/supabase-js';
import config from './env.js';

let supabaseClient = null;

const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (config.supabase.url && supabaseKey) {
  try {
    supabaseClient = createClient(config.supabase.url, supabaseKey);
    console.log('[DB] Supabase client initialized.');
  } catch (error) {
    console.error('[DB ERROR] Failed to initialize Supabase client:', error.message);
  }
} else {
  console.info('[DB INFO] Supabase credentials not set in server/.env. Using resilient mock repository for in-memory testing.');
}

export const supabase = supabaseClient;
export default supabase;
