import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Supabase env vars missing. URL: "${supabaseUrl}", KEY: "${supabaseAnonKey ? 'set' : 'not set'}"`);
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('[supabase init]', e.message);
  supabase = null;
}

export { supabase };
