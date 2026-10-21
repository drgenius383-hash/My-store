import { createClient } from '@supabase/supabase-js';

// Browser client (anon key). Placeholders keep the build working before the
// environment variables are set; requests simply fail until they are.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
