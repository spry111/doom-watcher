import { createClient } from '@supabase/supabase-js'

// WARNING: This client bypasses Row Level Security.
// Only import this in server-side code (API routes, cron job).
// NEVER import in components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
