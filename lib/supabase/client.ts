"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton browser client — one `GoTrueClient` per tab.
 *
 * Constructing more than one Supabase client in the same browser
 * context has each instance independently manage the same
 * `localStorage` session key, which races on token refresh (Supabase
 * itself warns "Multiple GoTrueClient instances detected"). The
 * session this client wraps is valid for the whole page load, so its
 * lifetime should be too — cache it at module scope and hand back
 * the same instance to every caller.
 *
 * Contrast with `lib/supabase/server.ts`, which must NOT do this: the
 * server client is scoped to a single request's cookies, and a
 * process-wide singleton there would leak one user's session into
 * another user's concurrent request.
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
