# Content

Text that changes often lives in Markdown files here, one file per entry:

| Folder      | Shows up at                      | Docs                                     |
| ----------- | -------------------------------- | ---------------------------------------- |
| `projects/` | `/projects` + `/projects/<file>` | [projects/README.md](projects/README.md) |
| `blog/`     | `/blog` + `/blog/<file>`         | [blog/README.md](blog/README.md)         |

Drop a `.md` file into either folder and it appears — no code changes. The
filename is the URL. Files named `README.md`, or starting with `_` or `.`, are
ignored, so notes and drafts-in-progress can sit next to real entries.

The same files can be written at `/admin` instead of by hand — it commits exactly
this format, converts pictures to AVIF on the way in, and leaves frontmatter it
does not manage alone. See the Admin section of the root `README.md`. Nothing
here changes either way: a file written by hand and a file written there are the
same file.

The rest of the site's copy — navigation, the résumé, page intros — stays in
`portfolio/lib/content.ts`.

Everything is in English; the site is single-language.

## Both folders share these conventions

**Frontmatter** — the YAML block at the top — holds the short fields: title,
subtitle/excerpt, dates, tags, pictures. Each folder's README lists which fields
it understands.

**Body text** goes below the frontmatter. Blank lines separate paragraphs; a
single newline inside a paragraph is just a line wrap, so lines can stay short in
the file.

**Pictures** — see [Images](#images) below.

## Images

Three ways to point at a picture, in increasing order of convenience:

```yaml
hero: /projects/my-thing/hero.avif # committed to portfolio/public/
hero: https://raw.githubusercontent.com/…/x.avif # any allowed remote URL
hero: gh:projects/my-thing/hero.avif # hosted on GitHub (recommended)
```

### `gh:` — hosted on GitHub

Put the file under `assets/` at the **repo root** (not in `portfolio/public/`) and
reference it with `gh:` plus the path below `assets/`:

```
assets/projects/my-thing/hero.avif   ->   gh:projects/my-thing/hero.avif
```

That expands to a `raw.githubusercontent.com` URL for this repo. Two reasons to
prefer it:

- **Pictures stay out of the deployed app.** `public/` is copied into the build;
  `assets/` is not, so large images do not grow the deploy.
- **You can add one from the browser.** On GitHub: _Add file → Upload files_ into
  `assets/…`, commit, done — no clone, no editor.

The file has to be **pushed to `master`** before the URL resolves; until then the
picture 404s. The repo must also stay public — `raw.githubusercontent.com` will
not serve a private repo to visitors.

The repo, branch and folder are constants at the top of
`portfolio/lib/content-files.ts`.

### Pictures inside the text

A paragraph containing only a Markdown image becomes a full-width picture at
that point in the body — this is how you put a screenshot between two
paragraphs:

```markdown
Some text before.

![The finished rack](gh:blog/homelab/rack.avif)

Some text after.
```

The text in `[…]` is the alt text. `gh:` works here too.

### Extra pictures at the end

An `images:` list renders as a gallery under the body:

```yaml
images:
  - gh:projects/my-thing/detail.avif
  - { src: gh:projects/my-thing/rack.avif, alt: The finished rack }
```

Bare entries take the entry's title as alt text; use the `{ src, alt }` form to
write your own.

### Missing pictures never break a page

A field left out — or commented out — renders as a dashed placeholder box
labelled with its alt text. Pages are safe to publish while you are still
gathering images.

### Formats

Anything Next's `<Image>` accepts. `.avif` and `.webp` keep pages light;
`image-optimizer/convert.sh` in the repo root converts to AVIF.
