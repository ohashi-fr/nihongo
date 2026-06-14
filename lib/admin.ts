/**
 * Tiny helper that decides whether a given email is an "admin" — used
 * to gate the visibility of admin-only links in the navigation.
 *
 * Configuration: set `NEXT_PUBLIC_ADMIN_EMAILS` in your environment to a
 * comma-separated list of admin email addresses, e.g.
 *
 *   NEXT_PUBLIC_ADMIN_EMAILS=alice@example.com,bob@example.com
 *
 * If the variable is unset or empty, *no one* is considered an admin —
 * the safer default for public sign-ups. Comparison is case-insensitive
 * and ignores surrounding whitespace.
 *
 * This is a visibility check only — it doesn't enforce server-side
 * access. The middleware still gates the actual `/admin/*` routes; this
 * helper only hides the link in the nav so non-admins don't even see it.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}
