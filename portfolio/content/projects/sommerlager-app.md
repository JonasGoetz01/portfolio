---
order: 2
stack: [Go, Fiber, PostgreSQL, Railway]

hero:
  src: gh:projects/management.avif
  alt: The Tagesplan view, laying out the daily schedule for a two-week camp

kind: VOLUNTEER — SOMMERLAGER
title: Sommerlager Management Application
subtitle: Registrations, participant data and camp logistics in one place, so the team no longer runs the camp out of spreadsheets.
---

A camp with a few hundred children generates a surprising amount of paperwork:
registrations, payments, medical notes, group assignments, who sleeps in which
tent. All of it used to live in spreadsheets passed around by email, which works
until two people edit the same file on the same evening.

This is the side of the platform the camp office uses. It shares a codebase with
the [public registration site](/projects/sommerlager-landing) — one deployment,
two audiences.

## What it does

The office needs to get from "a form arrived" to "the camp runs" without
anything falling through a gap:

- **Camps** are created, cloned from last year, edited and archived, so setting
  up the next season is not a rebuild.
- **Registrations** move through confirm, waitlist and cancel, with manual entry
  for the families who phone up instead, and duplicate detection for the ones
  who submit twice.
- **Payments** are tracked per child rather than per family, because siblings
  rarely pay together.
- **Rooms** are assigned by an algorithm and then corrected by hand — the useful
  part is the swap, not the automation.
- **Bulk email** goes to a filtered group rather than to everyone, which is the
  difference between a reminder and a nuisance.
- **Exports** produce CSV and Excel for the things that still happen on paper,
  plus a printable emergency-contact sheet that goes in a folder at the camp.

Every admin action lands in an audit log. With a rotating volunteer team, "who
changed this and when" is a question that gets asked for real.

## Running the fortnight itself

Registrations are only the first week's problem. Once the camp starts, the same
tool carries the operation:

- **Tagesplan** — the daily schedule for all fifteen days, planned per day and
  edited by clicking into it.
- **Dienstplan and Aufgaben** — who is on duty when, and what still needs doing.
- **Gruppen** and **Turniere** — the children split into groups, and the
  tournaments those groups play.
- **Zimmer** — the sleeping plan, alongside the assignment tool.
- **Dokumente** — the paperwork a camp generates, edited in place through an
  ONLYOFFICE document server rather than downloaded, changed and re-uploaded.
- **Bank** — the money side, kept next to the registrations it belongs to.

The screenshot above is the schedule for Sommerlager 2027, which is the honest
measure of what this is for: the team plans a camp more than a year out, and the
tool has to hold that plan without anyone maintaining a spreadsheet in parallel.

## Health data is handled separately

The health questionnaire is the most sensitive thing in the system, so it is
treated as such: reachable only through a token link sent to the parent, visible
to the people who need it, and deletable on request without touching the rest of
the registration. Under GDPR that deletion has to actually work, not just hide a
row.

## How it is built

A Go backend on Fiber, with the layers kept apart so the interesting logic is
testable without a web server in the way:

```
backend/internal/
├── handler/      HTTP surface, request validation
├── service/      camp, registration, room, mail logic
├── db/           typed queries generated from SQL
├── storage/      object storage for uploads and exports
├── middleware/   auth, request scoping
└── telemetry/    tracing and metrics
```

Queries are generated from hand-written SQL rather than assembled by an ORM,
which keeps the database schema the source of truth and the query plans
predictable. Migrations live in `backend/sql`.

The frontend is Next.js 15 on the App Router with React 19, Tailwind 4 and
shadcn/ui, talking to the backend over `/api/v1`. Forms use react-hook-form with
Zod schemas, so the same validation rules apply in the browser and on the way in.

## Running it

Six services on Railway, all but the managed databases built from Dockerfiles in
the repo:

| Service       | What it is                                          |
| ------------- | --------------------------------------------------- |
| Frontend      | Next.js, standalone build                           |
| Backend       | Go / Fiber                                          |
| PostgreSQL    | Application database                                |
| ONLYOFFICE DS | Document server, with its own Postgres and RabbitMQ |
| S3 bucket     | External — uploads, exports and backups             |

A separate Go backup service takes the database somewhere that is not Railway,
on the theory that a backup living beside the thing it protects is not a backup.

Local development runs the whole set through devbox and process-compose, so a
new volunteer gets a working environment without installing Postgres by hand.

## What I would do differently

The room auto-assignment was the most fun to write and the least valuable
feature shipped. The team overrides it often enough that a good swap interface
would have been worth more than a good algorithm. I built the clever thing
before checking which thing was needed.
