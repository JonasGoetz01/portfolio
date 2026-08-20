# Portfolio

Personal portfolio site (Next.js, Tailwind, shadcn/ui), deployed on Railway with Railpack.

---

## Local development

### Devbox — what it is and why I use it

**[Devbox](https://www.jetify.com/devbox)** is a dev-environment manager that installs tools (e.g. Bun, git, ImageMagick) per project via a single config file. No global installs, no “works on my machine.”

- **Why I use it for local dev:** Same tool versions (Bun, git, ImageMagick) for everyone and in CI, pinned in `devbox.lock`. No need to remember to install things; `devbox shell` or direnv does it.
- **Comparison:**
  - **Docker / Dev Containers:** Full OS image, heavier, great for “exact production clone.” Devbox only installs **binaries** (like a better `asdf`/`mise`), so it’s faster and lighter; you still use your host OS and editor.
  - **Devbox:** Declarative `devbox.json`, no Docker daemon, fast shell startup. Best when you want consistent **tools** (runtimes, CLIs) without containers.

Docs: [jetify.com/docs/devbox](https://www.jetify.com/docs/devbox)

### .envrc — what it is and how to enable it the first time

**[direnv](https://direnv.net/)** loads environment variables and commands when you `cd` into a directory. This repo uses it to load the Devbox environment and optional `.env` secrets.

- **What it does here:** Runs `devbox generate direnv`, so `cd`-ing into the project automatically activates Devbox (Bun, git, ImageMagick) and runs `dotenv_if_exists .env` for secrets. It also aliases `npm` → `bun` and `npx` → `bunx`.

**Enable it the first time:**

1. Install direnv:
   - **macOS (Homebrew):** `brew install direnv`
   - **Linux:** `apt install direnv` / or your distro’s package.
2. Hook direnv into your shell (add to `~/.bashrc`, `~/.zshrc`, etc.):

   ```bash
   eval "$(direnv hook bash)"   # bash
   eval "$(direnv hook zsh)"     # zsh
   ```

3. Allow this project (one-time, so `.envrc` is allowed to run):

   ```bash
   cd /path/to/portfolio
   direnv allow
   ```

After that, every time you `cd` into the repo, Devbox + `.env` load automatically.

### The benefit of Devbox + .envrc together

**Automatic, project-scoped environment on `cd`:**  
You don’t run `devbox shell` or `nvm use` manually. Enter the repo → direnv runs `.envrc` → Devbox tools and the optional `.env` are active. Leave the directory → they’re unloaded. Same setup for everyone who runs `direnv allow`.

---

## Railway & Railpack

- **[Railway](https://railway.com)** — Hosting platform. It watches the repo,
  builds on push, and runs the app as a long-lived service with a managed domain
  and TLS.
- **[Railpack](https://railpack.com)** — Railway's builder. It inspects the repo,
  detects Bun and Next.js, and produces the image — no Dockerfile to maintain.

Because the app runs as a normal Node server (rather than as functions behind a
CDN), everything in Next works without adapters: the image optimizer, ISR, and
route handlers all behave as they do locally.

### Deploying

Push to `master` and Railway builds and releases. Watch the build in the Railway
dashboard; a failed build leaves the previous release running.

**Settings that matter**, since the Next app lives in a subfolder:

- **Root directory** — `portfolio`
- **Build** — `bun run build` (Railpack detects this)
- **Start** — `bun run start`
- **`PORT`** — injected by Railway; `next start` reads it automatically.

### Running it locally

From `portfolio/`:

```bash
bun run dev      # dev server on :3000
bun run build    # production build, same as CI
bun run start    # serve the production build
```

---

## Stack overview

Deliberately small: Next.js, Tailwind and one Markdown parser. The site pulled in
a full shadcn/ui component library that nothing rendered — 63 components and
~20 packages — so it was removed. `components.json` went with it; if a component
is ever needed, `bunx shadcn@latest init` followed by `add <component>` brings
back only that one.

Runtime dependencies are `next`, `react`, `react-dom`, `gray-matter` and two
Font Awesome icon packs used by the Open Graph image. That is the whole list.

### Next.js (basics)

- **App Router:** Routes and layouts live under `portfolio/app/` (`page.tsx`, `layout.tsx`, etc.).
- **Server vs client:** By default components are Server Components; add `"use client"` when you need hooks, browser APIs, or client interactivity.
- **Run dev:** From `portfolio/` run `bun run dev`.
- **Build:** `bun run build` in `portfolio/` — the same command Railway runs.

Docs: [nextjs.org/docs](https://nextjs.org/docs)

### Tailwind CSS

Utility-first CSS: use classes like `flex`, `gap-4`, `text-lg` in JSX. Config in `tailwind.config.*` (or Tailwind v4 in `postcss.config` / `globals.css`). Tailwind v4 is configured entirely in `portfolio/app/globals.css` — there is no `tailwind.config.*`. The design tokens and the keyframes live there too.

Docs: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Checks

Every one of these runs in CI on pull requests and on `master`
(`.github/workflows/ci.yml`), and each is a script in `portfolio/package.json`:

```bash
bun run format:check   # prettier, 100 columns
bun run lint           # eslint, next/core-web-vitals + typescript
bun run typecheck      # tsc --noEmit
bun run test           # vitest — the content pipeline
bun run build          # also validates every content file
bun run test:browser   # axe-core + mobile layout, in a real browser
bun run test:lh        # Lighthouse budgets
```

`bun run format` writes instead of checking, and `bun run test:watch` re-runs on
change. The last two need a browser: `bunx playwright install chromium` once.

`test:browser` runs axe-core against the production build on every route, with
`prefers-reduced-motion` emulated so it samples the settled page rather than a
half-finished fade-in. It also walks the keyboard path to the skip link, and
checks at 320px that no page scrolls sideways — the failure that makes a site
feel broken on a phone, and one that is invisible on a desktop screen.

`test:lh` asserts a budget, split by whether an audit is reproducible
(`lighthouserc.cjs` explains the split):

- **Errors** — the machine-independent ones: 100 for accessibility,
  best-practices and SEO; caps on page weight, layout shift and unminified or
  uncompressed assets. A failure here is a real regression.
- **Warnings** — everything timing-based, including the performance score
  itself. A GitHub runner is a throttled, shared VM: this site measures a Total
  Blocking Time of 0 ms locally and around 620 ms there. That number is the
  runner, not the site, so it is reported rather than enforced.

Locally the site scores 100 in all four categories on every route, with LCP
around 0.5 s and no layout shift.

The build is a real check, not just a compile: the content loaders throw on a
missing `title`, a duplicate slug, a slug that is not lowercase-hyphenated, or
frontmatter that does not parse — so a typo in a Markdown file fails the build
rather than shipping a card with a blank heading.

---

## Site structure

The site is the Personal Page design implemented with the App Router.

- **Routes** — `/` (home), `/resume`, `/projects`, `/blog`, plus a page per entry at
  `/projects/<slug>` and `/blog/<slug>`. `sitemap.xml` and `robots.txt` are generated from
  the content folders, and `not-found.tsx` / `error.tsx` cover the failure paths.
- **Content** — projects and blog posts are Markdown files, one per entry, in
  `portfolio/content/projects/` and `portfolio/content/blog/`. Dropping a file in either
  folder adds an entry and its own page; see `portfolio/content/README.md` for the format.
  The remaining copy — navigation, résumé, page intros — lives in `portfolio/lib/content.ts`.
  The site is English only.
- **Server components** — only the header (active-link highlight) and the contact form need
  the client. Every page and view is a server component, so almost nothing ships as JS.
- **Theme** — light only. `color-scheme: light` is pinned in `globals.css`, so a visitor
  whose OS prefers dark still gets the light design.
- **Design tokens** — `--bg`, `--surface`, `--line`, `--ink`, `--dim` and `--brand` are
  defined in `portfolio/app/globals.css` and exposed to Tailwind as `bg-bg`, `border-line`,
  `text-dim`, `text-brand` and so on.
- **Images** — `ImageSlot` (`portfolio/app/_components/image-slot.tsx`) renders a labelled
  placeholder until a picture exists, so a page is never broken while pictures are still
  missing. Project and post pictures are best kept in `assets/` at the repo root and
  referenced as `gh:<path>`, which serves them from GitHub instead of shipping them in the
  deploy — see `assets/README.md`. Files in `portfolio/public/` and plain remote URLs work
  too; `images.remotePatterns` in `portfolio/next.config.ts` lists the hosts allowed.
- **Headers** — `next.config.ts` sets a Content-Security-Policy plus HSTS, `nosniff`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and COOP, and disables the
  `X-Powered-By` header.
- **Share previews** — every URL has its own Open Graph image. One template in
  `app/_og/card.tsx` is rendered per route by an `opengraph-image.tsx`, so a link to a
  project or a post previews with that entry's own title, subtitle and tags rather than a
  generic site card. Twitter cards come from the same images.
- **SEO** — per-route canonical URLs, `article` Open Graph metadata with publish dates on
  posts, and schema.org JSON-LD from `app/_components/structured-data.tsx`: a `Person` graph
  built from the résumé data (`hasOccupation`, `alumniOf`, `hasCredential`), plus
  `BlogPosting` / `CreativeWork` and `BreadcrumbList` on detail pages.
- **Feed** — `/blog/rss.xml`, generated from the same loader as the pages and linked from
  the `<head>` of every page. The XML is built by `lib/feed.ts` so it can be unit tested.
- **Markdown** — project and post bodies are real Markdown, rendered by `lib/markdown.ts`:
  headings (with deep-linkable ids), lists, tables, blockquotes, emphasis, links and fenced
  code blocks highlighted at build time by Shiki, so no highlighter reaches the browser.
  A picture on its own line becomes a `next/image` figure instead of a bare `img`.
- **Résumé PDF** — `/resume/jonas-goetz-cv.pdf`, rendered from the same `lib/content.ts`
  data as the page by `lib/resume-pdf.tsx`, so the file cannot drift from the site.
- **Icons and manifest** — `/icon`, `/apple-icon` and `/manifest.webmanifest` are generated
  at build time, so there are no binary icons to keep in sync.
- **`/.well-known/security.txt`** — RFC 9116, with an `Expires` one year from each build.

---

## Image optimizer

Convert images to AVIF for faster loading. From the `image-optimizer/` folder run:

```bash
./convert.sh
```

Output is written to `image-optimizer/output/`. To convert everything under `assets/` in place instead:

```bash
./image-optimizer/convert.sh ../assets
```

Pass `--replace` to delete each source once converted. **This is automated**: pushing an image to `assets/` on `master` triggers `.github/workflows/images.yml`, which converts it to AVIF and commits the result — so a picture uploaded through the GitHub web UI ends up in the right format without a local checkout.

---

## Libraries & references

- **Animated icons:**  
  [itshover.com/icons](https://www.itshover.com/icons) · [lucide-animated.com](https://lucide-animated.com/)
