# Blog

One Markdown file per post. **Drop a `.md` file into this folder and it appears
on `/blog` with its own page at `/blog/<filename>`** — no code changes anywhere.

See [../README.md](../README.md) for the conventions shared with projects: body
text, and how images work (including `gh:` GitHub hosting).

## Example

```markdown
---
date: 2026-03-14                # ISO date; sorts newest first
state: DRAFT                    # small brand-coloured tag; omit to hide

hero: gh:blog/homelab/hero.avif

title: Rebuilding the homelab
excerpt: One or two lines, shown on the list page.
---

The post. Blank lines separate paragraphs.

![The finished rack](gh:blog/homelab/rack.avif)

Text after the picture.
```

## Fields

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Falls back to the filename. |
| `excerpt` | no | Shown on the list page and under the title. |
| `date` | no | `YYYY-MM-DD`. Sorts newest first; also the date shown. |
| `dateLabel` | no | Overrides what the date column shows, e.g. `Soon`. |
| `state` | no | Small tag, e.g. `DRAFT`. Left out, nothing is shown. |
| `hero` | no | The big picture at the top of the post. |
| `images` | no | Gallery under the body. |
| `order` | no | Overrides date sorting. Lower sorts first. |
| `slug` | no | Overrides the filename as the URL. |

## Ordering

Newest first by `date`. Posts **without** a date sort above the dated ones —
that keeps not-yet-published pieces at the top while you work on them. Set
`order` to force a position.

## Keeping a post out of the list

Rename it to start with `_` (`_half-finished.md`). Files starting with `_` or `.`
are skipped, so the draft stays in the repo without appearing on the site.
