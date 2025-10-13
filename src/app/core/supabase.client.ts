// src/app/core/supabase.client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// HMR-safe: guardamos el cliente en window para no duplicarlo
declare global {
  interface Window { __supabase?: SupabaseClient }
}

export function getSupabase(): SupabaseClient {
  if (typeof window !== 'undefined' && window.__supabase) return window.__supabase!;

  const client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: {
      // 👉 Desactiva manejo de sesión (no necesitas Auth para inserts anónimos)
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      // (sin multiTab)
    },
  });

  if (typeof window !== 'undefined') window.__supabase = client;
  return client;
}
