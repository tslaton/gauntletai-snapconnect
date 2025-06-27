import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client factory.
 *
 * This helper intentionally avoids importing any React-Native-only
 * libraries (e.g. AsyncStorage) so it can run in a Node/Edge runtime
 * where `window` and other browser globals are not available.
 *
 * @param authHeader Optional "Authorization" header value to execute all
 *                   requests as the authenticated user. Pass the raw
 *                   header string from the incoming request.
 *
 * @returns A configured, stateless Supabase client. Since `persistSession`
 *          and `autoRefreshToken` are disabled, this client is safe to
 *          instantiate on every request and consumes **no** global state.
 */
export function createSupabaseClientForServer(authHeader?: string) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: authHeader
      ? {
          headers: {
            Authorization: authHeader,
          },
        }
      : undefined,
  });
} 