# Portfolio

Personal portfolio site (Next.js, Tailwind, shadcn/ui), deployed with SST on AWS.

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

## SST & OpenNext

- **[SST](https://sst.dev)** — Framework to build and deploy serverless apps (and more) on AWS (and other clouds). You define resources in TypeScript (`sst.config.ts`); SST turns your Next.js app into Lambda + CloudFront (or similar) and manages infra.
- **[OpenNext](https://opennext.js.org)** — Adapter that makes Next.js run on AWS (Lambda@Edge / Lambda + CloudFront). SST’s `sst.aws.Nextjs` uses OpenNext under the hood so the app runs serverlessly without changing your Next.js code.

Docs: [sst.dev/docs](https://sst.dev/docs), [opennext.js.org](https://opennext.js.org)

### Using `sst dev`

Runs your app in “dev” mode: local Next.js dev server (e.g. `bun run dev`) plus SST’s dev pipeline (hot reload, live Lambda preview, etc., depending on config).

From the **repo root** (where `sst.config.ts` lives):

```bash
sst dev
```

With Devbox + direnv, the right `bun` and tools are already in your path. The config’s `dev.autostart` and `dev.command` control how the Next app is started.

### Deploying with SST

From the **repo root**:

```bash
sst deploy
```

Or with a stage (e.g. `staging`):

```bash
sst deploy --stage staging
```

Ensure AWS (and Cloudflare, if used for DNS) credentials are configured (e.g. `aws configure` or env vars). SST will build the Next app and deploy the Lambda/CloudFront (and other) resources defined in `sst.config.ts`.

### Deploy pipeline (tag-only)

Deploys run via **GitHub Actions** when you **push a version tag** (e.g. `v1.0.0`). The workflow is in `.github/workflows/deploy.yml`.

**To deploy:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow runs `sst deploy --stage production`. Only tag pushes trigger it; normal pushes to `main` do not deploy.

**Secrets/variables (Settings → Secrets and variables → Actions):**

- **AWS:** Add secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- **Optional variable:** `AWS_REGION` (default in workflow: `eu-central-1`).
- **Cloudflare (for DNS):** Add secret `CLOUDFLARE_API_TOKEN` (create token in Cloudflare dashboard with Zone DNS edit).

---

## Stack overview

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of reusable components (buttons, dialogs, forms, etc.) that you copy into your repo and own the code. It’s not an npm component library; it’s built on **Radix UI** and styled with **Tailwind**.

- Docs: [ui.shadcn.com](https://ui.shadcn.com)
- This project: components live under `portfolio/components/ui/` and are customized there.

### Next.js (basics)

- **App Router:** Routes and layouts live under `portfolio/app/` (`page.tsx`, `layout.tsx`, etc.).
- **Server vs client:** By default components are Server Components; add `"use client"` when you need hooks, browser APIs, or client interactivity.
- **Run dev:** From repo root with SST use `sst dev`; or from `portfolio/` run `bun run dev` for a plain Next dev server.
- **Build:** `bun run build` in `portfolio/` (or via SST deploy).

Docs: [nextjs.org/docs](https://nextjs.org/docs)

### Tailwind CSS

Utility-first CSS: use classes like `flex`, `gap-4`, `text-lg` in JSX. Config in `tailwind.config.*` (or Tailwind v4 in `postcss.config` / `globals.css`). The project uses Tailwind for layout and styling; shadcn components are built on top of it.

Docs: [tailwindcss.com/docs](https://tailwindcss.com/docs)

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
