# Projects

One Markdown file per project. **Drop a `.md` file into this folder and it
appears on `/projects` with its own detail page at `/projects/<filename>`** — no
code changes anywhere. `learning-hub.md` → `/projects/learning-hub`.

See [../README.md](../README.md) for the conventions shared with the blog: body
text, and how images work (including `gh:` GitHub hosting).

## Example

```markdown
---
order: 1 # lower sorts first; omit to sort last
stack: [Go, Kubernetes] # the small tags on the card

hero: gh:projects/my-thing/hero.avif # the one big picture
images: # optional gallery under the body
  - gh:projects/my-thing/detail.avif
  - { src: gh:projects/my-thing/rack.avif, alt: The finished rack }

kind: WORK — 42 HEILBRONN # small eyebrow above the title
title: My Thing
subtitle: One or two lines, shown on the card and under the title.
---

The detail text.

![A screenshot](gh:projects/my-thing/screen.avif)

More detail text.
```

## Fields

| Field      | Required | Notes                                                        |
| ---------- | -------- | ------------------------------------------------------------ |
| `title`    | yes      | Falls back to the filename.                                  |
| `subtitle` | no       | Shown on the card and under the title.                       |
| `kind`     | no       | Small eyebrow line, e.g. `WORK — 42 HEILBRONN`.              |
| `stack`    | no       | Tag list on the card and detail page.                        |
| `hero`     | no       | The big picture at the top of the detail page.               |
| `images`   | no       | Gallery under the body.                                      |
| `order`    | no       | Sort position. Files without it sort last, then by filename. |
| `slug`     | no       | Overrides the filename as the URL.                           |
