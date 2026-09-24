import { createClient } from '@supabase/supabase-js';
import config from './env.js';

let supabaseClient = null;

if (config.supabase.url && config.supabase.anonKey) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
    console.log('[DB] Supabase client initialized.');
  } catch (error) {
    console.error('[DB ERROR] Failed to initialize Supabase client:', error.message);
  }
} else {
  console.info('[DB INFO] Supabase credentials not yet configured in server/.env. DB operations will require valid credentials in Phase 2.');
}

export const supabase = supabaseClient;
export default supabase;
