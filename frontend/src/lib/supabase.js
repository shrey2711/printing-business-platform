import { createClient } from '@supabase/supabase-js';

// Supabase credentials come from Vercel/`.env` at build time.
// See DEPLOY.md for how to create the project and set these.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app must still run locally before Supabase is configured, so we only
// create a client when both values are present. Components check `isSupabaseReady`.
export const isSupabaseReady = Boolean(url && anonKey);

export const supabase = isSupabaseReady ? createClient(url, anonKey) : null;

// Storage bucket that holds submitted / drawn artwork.
export const DESIGN_BUCKET = 'designs';
