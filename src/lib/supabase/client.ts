import { createBrowserClient } from "@supabase/ssr";

// Untyped on purpose — see admin.ts for context. Re-add `<Database>` once
// migrations are applied and types are regenerated.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
