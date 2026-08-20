# assets

Pictures for the site, served straight from GitHub.

This folder is **not** part of the Next.js app — it is not copied into the build,
so images here do not grow the deployed app. Files are fetched from
`raw.githubusercontent.com` instead, optimised by Next's image pipeline, and
cached from then on.

## Adding a picture

Put the file under a folder that matches where it is used:

```
assets/projects/<slug>/hero.avif
assets/blog/<slug>/rack.avif
```

Then reference it from the entry's Markdown file with `gh:` plus the path below
`assets/`:

```yaml
hero: gh:projects/learning-hub/hero.avif
```

You can do this entirely in the browser: **Add file → Upload files** on GitHub,
drop it in, commit.

## Two things to know

- The file must be **pushed to `master`** before the URL resolves. Until then the
  page shows a placeholder rather than breaking.
- This only works while the repo is **public**. `raw.githubusercontent.com` does
  not serve private repos to visitors — those images would need to live in
  `portfolio/public/` instead.

Convert to AVIF first with `image-optimizer/convert.sh` to keep pages light.

The repo, branch and folder name are constants at the top of
`portfolio/lib/content-files.ts`.
