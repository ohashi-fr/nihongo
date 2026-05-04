# Nihongo — 日本語

A small, calm Japanese-study app. Modules contain levels, levels contain cards, you flip through them one at a time and get a score at the end. Built with Next.js 14 (App Router) + Supabase + Tailwind.

---

## 1. Install commands

```bash
# inside the project folder
npm install
cp .env.local.example .env.local   # then fill in the Supabase values (step 2)
npm run dev
```

That's it. No global tools required.

---

## 2. Set up Supabase

### a. Create a project
1. Go to <https://supabase.com> and create a new project.
2. Pick a region close to you. Save the database password somewhere safe.
3. Wait ~1 minute for the project to provision.

### b. Run the SQL
1. In your Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of `supabase/schema.sql` and run it. This creates the four tables and the row-level security policies.
3. (Optional but recommended) Open another query, paste `supabase/seed.sql`, and run it. This adds the **Vocabulaire → Niveau 1** module with all 73 starter cards.

### c. Get your keys
1. In the dashboard go to **Project Settings → API**.
2. Copy:
   - **Project URL** → goes in `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste both into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### d. Create your admin user
1. In the dashboard go to **Authentication → Users → Add user → Create new user**.
2. Enter your email + a password. Tick **Auto Confirm User** so you can log in immediately.
3. That email/password pair is what you'll use at `/admin`.

> By default Supabase Auth allows anyone to sign up. If you want to lock it down to just you, go to **Authentication → Providers → Email** and turn **Enable Sign Ups** off.

---

## 3. Run locally

```bash
npm run dev
```

Then open <http://localhost:3000>.

- Public app: `/` → `/modules/vocabulaire` → click a level → quiz.
- Admin: `/admin` → log in with the user you created above.

---

## 4. Deploy to Vercel

1. Push the project to GitHub (or GitLab/Bitbucket).
2. Go to <https://vercel.com/new>, import the repo. Vercel auto-detects Next.js.
3. In the **Environment Variables** step, add both:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. After ~1 min you'll get a `*.vercel.app` URL.
5. Optional: in **Project Settings → Domains** add a custom domain.

If you change Supabase keys later, update the env vars in Vercel and redeploy. No build settings to tweak — `npm run build` and `npm start` are the standard Next.js commands.

---

## Project layout

```
app/
  page.tsx                                       Home (module grid)
  modules/[slug]/page.tsx                        Levels in a module
  modules/[slug]/[levelId]/page.tsx              Quiz
  admin/
    page.tsx                                     Login
    dashboard/page.tsx                           All modules + stats
    modules/new/page.tsx                         Create module
    modules/[id]/page.tsx                        Edit module + manage levels
    modules/[id]/levels/[levelId]/page.tsx       Edit level + manage cards
components/
  QuizClient.tsx          Card flow, scoring, save session
  LoginForm.tsx           Email/password sign-in
  ModuleForm.tsx          Create / edit a module
  LevelManager.tsx        Add / reorder / delete levels
  LevelEditor.tsx         Inline card edit + bulk import
  SignOutButton.tsx
  DeleteModuleButton.tsx
lib/
  supabase/client.ts      Browser Supabase client
  supabase/server.ts      Server Supabase client (cookies)
  types.ts
middleware.ts             Protects /admin/* via Supabase session
supabase/
  schema.sql              Tables + RLS policies
  seed.sql                Vocabulaire / Niveau 1 starter cards
```

## Notes

- Public reads are open; writes to `modules`, `module_levels`, `cards` require an authenticated user (admin). Anonymous users can only insert into `sessions`. This is enforced at the database level by RLS — it's fine that the anon key is shipped to the browser.
- Quiz answers are matched after `.trim().normalize("NFC").toLowerCase()`, so trailing whitespace and unicode normalization differences won't trip you up.
- Bulk import understands plain `english,japanese` per line for quiz modules and `verb,form,answer` for conjugation modules. Wrap a field in `"…"` if it contains a comma.
- Sessions are anonymous. The end of a quiz writes one row to `sessions` with `total_cards` and `correct_first_try`; the dashboard averages these per module.
