# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no build step. Deployed to GitHub Pages from the `main` branch.

## Users

The owner (Hermann) and a friend they share the link with. The friend opens it on a phone or a desktop about equally, to see what the owner's weekly training looks like.

## Product Purpose

A single read-only page that shows Hermann's weekly workout routine clearly enough that a friend can understand the whole week at a glance and the detail of any day. Success: the friend gets the split, the exercises, and the sets/reps/rest without needing JEFIT.

## Positioning

A personal, shareable version of a routine that otherwise lives inside the JEFIT app behind a login.

## Operating Context

The routine was built in JEFIT and now lives in Supabase. The page is shared by sending a link. Viewing needs no account; editing needs a magic-link sign-in with an email on the members list.

## Capabilities and Constraints

- Display: weekly split, per-day exercise list with muscle group, sets, reps, and rest timer; highlights the current weekday.
- Versions: every save is a new full copy of the week (`routine_versions`, append-only). The page opens on the latest; every earlier version is browsable, and restoring one saves it again as a new version. Nothing is edited in place. Members can permanently delete a version from the Versions drawer (with an in-page confirm), except the last one left; numbers above it shift down.
- Editing (signed-in members only): reorder exercises, move them to another day, add/remove, change sets, reps, rest; save with an optional note. Saves go live immediately; there is no approval step.
- Backend: Supabase project `jxkhbzxlotidkwzsciai`, called directly from the page with the publishable key; row-level security enforces read-anyone / insert-members-only. Members are added by hand.
- No workout logging or check-offs.
- Must work equally well on phone and desktop widths.

## Evidence on Hand

- `source/Printable Workout Routine _ JEFIT ... .pdf`: JEFIT printable export of routine "Hermann": 6 days/week, Sport Specific, Intermediate. Mon/Wed/Fri dumbbell strength (8 exercises each, 3 sets, 60 sec rest), Tue/Thu/Sat Mountain Biking 60 min, Sunday rest.
- No photos, logos, progress data, or personal stats exist; do not invent weights, PRs, or results.

## Product Principles

- The routine is the content; everything serves reading it quickly.
- Show what's true from the export, nothing more.
- Today's workout should be the first thing a visitor finds.
