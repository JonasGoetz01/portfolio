# Portfolio

Personal portfolio site (Next.js, Tailwind, shadcn/ui), deployed on Railway with Railpack.

---

## Local development

### Devbox — what it is and why I use it

**[Devbox](https://www.jetify.com/devbox)** is a dev-environment manager that installs tools (e.g. Bun, Node, AWS CLI) per project via a single config file. No global installs, no “works on my machine.”

- **Why I use it for local dev:** Same tool versions (Bun, AWS CLI, git, etc.) for everyone and in CI. No need to remember to install things; `devbox shell` or direnv does it.
- **Comparison:**
  - **Docker / Dev Containers:** Full OS image, heavier, great for “exact production clone.” Devbox only installs **binaries** (like a better `asdf`/`mise`), so it’s faster and lighter; you still use your host OS and editor.
  - **Devbox:** Declarative `devbox.json`, no Docker daemon, fast shell startup. Best when you want consistent **tools** (runtimes, CLIs) without containers.

Docs: [jetify.com/docs/devbox](https://www.jetify.com/docs/devbox)

### .envrc — what it is and how to enable it the first time

**[direnv](https://direnv.net/)** loads environment variables and commands when you `cd` into a directory. This repo uses it to load the Devbox environment and optional `.env` secrets.

- **What it does here:** Runs `devbox generate direnv`, so `cd`-ing into the project automatically activates Devbox (Bun, AWS CLI, etc.) and runs `dotenv_if_exists .env` for secrets. It also aliases `npm` → `bun` and `npx` → `bunx`.

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
You don’t run `devbox shell` or `nvm use` manually. Enter the repo → direnv runs `.envrc` → Devbox tools (Bun, AWS CLI, etc.) and optional `.env` are active. Leave the directory → they’re unloaded. Same setup for everyone who runs `direnv allow`.

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

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of reusable components (buttons, dialogs, forms, etc.) that you copy into your repo and own the code. It’s not an npm component library; it’s built on **Radix UI** and styled with **Tailwind**.

- Docs: [ui.shadcn.com](https://ui.shadcn.com)
- This project: components live under `portfolio/components/ui/` and are customized there.

### Next.js (basics)

- **App Router:** Routes and layouts live under `portfolio/app/` (`page.tsx`, `layout.tsx`, etc.).
- **Server vs client:** By default components are Server Components; add `"use client"` when you need hooks, browser APIs, or client interactivity.
- **Run dev:** From `portfolio/` run `bun run dev`.
- **Build:** `bun run build` in `portfolio/` — the same command Railway runs.

Docs: [nextjs.org/docs](https://nextjs.org/docs)

### Tailwind CSS

Utility-first CSS: use classes like `flex`, `gap-4`, `text-lg` in JSX. Config in `tailwind.config.*` (or Tailwind v4 in `postcss.config` / `globals.css`). The project uses Tailwind for layout and styling; shadcn components are built on top of it.

Docs: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Site structure

The site is the Personal Page design implemented with the App Router.

- **Routes** — `/` (home), `/resume`, `/projects`, `/blog`, plus a page per entry at
  `/projects/<slug>` and `/blog/<slug>`. Each sub-page is a server component that exports
  metadata and renders a client `view.tsx`.
- **Content** — projects and blog posts are Markdown files, one per entry, in
  `portfolio/content/projects/` and `portfolio/content/blog/`. Dropping a file in either
  folder adds an entry and its own page; see `portfolio/content/README.md` for the format.
  The remaining copy — navigation, résumé, page intros — lives in `portfolio/lib/content.ts`.
  The site is English only.
- **Server components** — only the header (active-link highlight) and the contact form need
  the client. Every page and view is a server component.
- **Theme** — light only. `color-scheme: light` is pinned in `globals.css`, and the `dark:`
  variant stays scoped to a `.dark` ancestor that nothing sets, so a visitor whose OS
  prefers dark still gets the light design.
- **Design tokens** — `--bg`, `--surface`, `--line`, `--ink`, `--dim` and `--brand` are
  defined in `portfolio/app/globals.css` and exposed to Tailwind as `bg-bg`, `border-line`,
  `text-dim`, `text-brand` and so on. The shadcn tokens are untouched next to them.
- **Images** — `ImageSlot` (`portfolio/app/_components/image-slot.tsx`) renders a labelled
  placeholder until a picture exists, so a page is never broken while pictures are still
  missing. Project and post pictures are best kept in `assets/` at the repo root and
  referenced as `gh:<path>`, which serves them from GitHub instead of shipping them in the
  deploy — see `assets/README.md`. Files in `portfolio/public/` and plain remote URLs work
  too; `images.remotePatterns` in `portfolio/next.config.ts` lists the hosts allowed.

---

## Image optimizer

Convert images to AVIF for faster loading. From the `image-optimizer/` folder run:

```bash
./convert.sh
```

Output is written to `image-optimizer/output/`. Copy the generated `.avif` files into `portfolio/public/` as needed.

---

## Libraries & references

- **Animated icons:**  
  [itshover.com/icons](https://www.itshover.com/icons) · [lucide-animated.com](https://lucide-animated.com/)
