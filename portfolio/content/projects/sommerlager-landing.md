---
order: 3
stack: [Next.js, TypeScript, i18n, SEO]

# Put the files in assets/ at the repo root, then uncomment these.
# hero: gh:projects/sommerlager-landing/hero.avif
# images:
#   - gh:projects/sommerlager-landing/registration.avif
#   - { src: gh:projects/sommerlager-landing/status.avif, alt: The status page }

kind: VOLUNTEER — SOMMERLAGER
title: Sommerlager Landing Page
subtitle: "The public face of the camp: what happens, who runs it, and how to sign up."
---

The page most families see first, at **sommerlager.goetz.sh**. It has one job —
explain what the camp is and get a parent through registration — so everything
else on it is subordinate to that.

It is the public half of the same application as the [management
app](/projects/sommerlager-app): the parent fills in a form here, and the camp
office sees it there.

## The registration flow

Signing a child up for a week away involves more information than anyone wants
to type on a phone at half past nine in the evening. So the form is broken into
steps with a visible progress tracker, and a single submission can cover more
than one child — most families have siblings going together.

After submitting, the parent gets an email to verify the address. That step
exists because a typo in an email address is invisible until the week before
camp, when it matters.

Two things then arrive by link rather than by login:

- The **health questionnaire**, reachable through a secure token, so no parent
  has to hold an account for a form they fill in once a year.
- A **status page**, showing where the registration stands — confirmed or
  waitlisted, paid or not, health form done or outstanding — with the full
  journey from application to the first day of camp laid out.

No parent account, no password to reset in July.

## German first

The camp is German and so is the audience, but the parish serves families who do
not all read German comfortably. The interface is bilingual, with the copy held
in message catalogues rather than in the components, so a translation is a text
edit and not a code change.

## Making it findable

A camp page is only useful in the weeks when parents are searching for one, so
the metadata is not an afterthought: per-page titles and descriptions, Open
Graph and Twitter cards, a manifest, and structured data describing the parish as
the organiser. The result is that a link shared in a parents' WhatsApp group
looks like something official rather than a bare URL.

## How it is built

Next.js 15 on the App Router with React 19, Tailwind 4 and shadcn/ui. Forms are
react-hook-form with Zod, and the same schema validates in the browser and at
the API boundary — one definition, so the two cannot drift apart.

The public pages are static where they can be and dynamic only where they must
be, which keeps the site fast on a phone on rural mobile data. That is a real
constraint here rather than a hypothetical one: a good part of the audience is in
villages around Buchen.

It ships as a standalone build in a container on Railway, in front of the Go API
that does the actual work.

## The part that mattered most

Not the design. It was making the form survive being abandoned halfway through
and returned to later, because that is what a parent interrupted by their own
children actually does.
