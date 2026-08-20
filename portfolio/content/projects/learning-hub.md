---
order: 1
stack: [Next.js, FastAPI, PostgreSQL, Self-hosted]

hero:
  src: gh:projects/learninghub.avif
  alt: A student dashboard, with the streak counter, cursus selector and campus calendar

kind: WORK — 42 HEILBRONN
title: Learning Hub
subtitle: The intranet 42 Heilbronn runs on — the campus systems a coding school without teachers actually needs, in one place.
---

At 42 there is nobody standing at the front of a room. Students unlock projects
by finishing the ones before them, review each other's work, and organise
themselves. That model only holds if the software underneath it holds, because
the software is doing what a timetable and a teacher would do elsewhere.

The Learning Hub is that software. It is the intranet the campus signs into: the
dashboard a student sees, the events they book, the projects they are working
through, and the administration the staff side needs behind it.

## What is in it

It grew out of the day-to-day of running the campus, which is why the feature
list reads like a list of things that used to be done by hand:

- **Dashboard** — where a student stands: streak, shields, their Piscine cohort,
  and whether they are available, all above the day's calendar.
- **Events** — what is on and who is coming, with a _Subscribe to calendar_
  button, because an event nobody sees is an event nobody attends.
- **Projects, cursuses and skills** — the curriculum, and progress through it,
  switched per cursus from the header.
- **Tickets and proposals** — how a student asks for something or suggests it,
  rather than finding whoever happens to be at the desk.
- **Floor plans and phone booths** — where things and people are, which on a
  campus of a few hundred is a genuine question.
- **Announcements and short links** — the staff side of talking to everyone.
- **Notion and Student Slack** — the tools that live elsewhere, reachable from
  the same sidebar rather than from a bookmark folder.

There is a student search on `⌘K` from anywhere, which is the feature the staff
side uses most and the one that would be missed first.

Student and project data is imported from 42's own API on a schedule, so the Hub
stays in step with the wider network rather than becoming a second source of
truth that slowly disagrees with the first.

## Signing in

Getting authentication right mattered more here than anywhere else: everyone on
campus uses this, several times a day, on shared machines.

| Method            | Role                                      |
| ----------------- | ----------------------------------------- |
| Email magic link  | The primary route — no password to forget |
| WebAuthn passkeys | Passwordless, for the people who want it  |
| TOTP              | Optional second factor                    |
| Password + TOTP   | Custom admin accounts only                |

A JWT lives in a cookie, and Next.js middleware verifies it on every request and
refreshes it silently when it expires — so a session ending mid-task is not a
thing that happens. The Hub also exposes OAuth endpoints of its own, which is
what lets other campus tools authenticate people against it instead of each one
growing its own login.

## How it is built

A monorepo, with the split along the line where the work actually divides:

```
frontend/    Next.js 15, App Router, Server Components
  lib/services/     API client layer
  lib/actions/      Server Actions
  lib/validations/  Zod schemas

backend/     Python 3.13, FastAPI, async throughout
  app/routes/       auth, events, projects, oauth, calendar, streaks
  app/models/       SQLModel — SQLAlchemy and Pydantic in one
  app/services/     S3, email, compensation, skills
  app/crons/        import from the 42 API, calendar sync
```

The frontend proxies to the backend through Next rewrites, so the browser only
ever talks to one origin. React Query holds server state, TanStack Form and
Table handle the parts of an admin interface that are genuinely hard, and the UI
is shadcn/ui on Radix with Tailwind 4.

Around those two sit the services that make the features possible rather than
merely nice: PostgreSQL 16 with a pooled connection, Valkey for caching, and a
Radicale CalDAV server, so a student subscribes once and campus events appear in
the calendar app they already use.

## Self-hosted, on purpose

All of it runs on infrastructure I look after. That is the reason the calendar
integration and the OAuth provider exist at all — both are the kind of thing that
is straightforward when you own the boxes and a procurement exercise when you do
not.

Local development is a devbox shell and `devbox services up`: Postgres, Valkey,
nginx, a mail catcher and Radicale, all running the way they run in production.
Onboarding someone should not begin with a day of installing databases.
