import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route — Supabase's email confirmation and magic-link
 * emails redirect here with a `?code=` parameter that we exchange for
 * an active session.
 *
 *   GET /auth/callback?code=…&next=/some/path
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // No code or exchange failed — bounce back to login with a hint.
  return NextResponse.redirect(
    new URL("/login?error=callback_failed", url.origin)
  );
}
