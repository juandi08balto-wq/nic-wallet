// Supabase admin client (service role). DO NOT import this from client
// components or any code that runs in the browser — the service role key
// bypasses RLS.

import { createClient } from "@supabase/supabase-js";

// Note: not generic over `Database` on purpose. The hand-rolled Database
// type in src/types/db.ts doesn't fully satisfy postgrest-js's
// `GenericSchema` constraint (Insert columns require an index signature
// shape that hand-written types can't easily produce). Once migrations
// are applied, regenerate types via:
//   supabase gen types typescript --project-id <id> > src/types/db.ts
// and add the generic back.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
