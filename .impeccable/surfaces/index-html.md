---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Routine page (index.html)

Scope: the single public page at the site root. Mode: Read (a friend learns the week; signed-in members also edit and save versions).
Audience: Hermann and a friend, phone and desktop equally. Job: see today's workout first, then the whole week; members reorder, move, and re-dose exercises and save a new version with a note.
Content: Supabase `routine_versions` (latest by default, any earlier version browsable). No invented weights or results.
Constraints: static HTML/CSS/JS on GitHub Pages, supabase-js from CDN, publishable key only.

## Direction contract

THESIS: The week is a six-stage race, each training day a numbered stage with a Tyvek bib and a start list. Refuses the dark card-grid fitness dashboard with a neon accent.

OWN-WORLD: Tyvek off-white ground, race-black ink, one ultramarine band reserved for today and the primary action, pin-silver for safety-pin holes and rules. One condensed grotesk family (Archivo, width axis) at stepped sizes only; tabular figures. Bibs are white sheets with a 2px black edge and four pin holes; nothing else is boxed. Rows are separated by hairlines, never enclosed.

STORY: The visitor sees today's stage and its start list immediately, scans the seven-bib strip to grasp the alternating strength / trail rhythm, taps any bib to read that stage. A member signs in, edits the start list in place, and saves; the masthead shows which version is live and who saved it.

FIRST VIEWPORT: Masthead strip (routine name, version stamp, sign-in). Left: today's bib at full scale, numeral ~300px desktop, ultramarine band naming the weekday. Right: stage title and the start list with 01–08 in a margin column, muscle, reps. Below: seven same-scale bibs, today filled ultramarine, Sunday dashed. Phone: bib shrinks to a band-led header, start list full width, week strip scrolls horizontally above it.

FORM: Stage Race Road Book (race bib + road book), candidate 5 of 7 on the grounded list, assigned by the roll. Raises: botanical folio (fixed-scale bibs on one baseline), origami (margin-column numbering), daylight section (one active band), cracktro (no enclosure for rows), emigre (one family, size steps). seed:ea89ac2ce50dce23
Signature interaction: picking a stage re-pins the big bib (numeral flips, band slides); in edit mode rows drag between stages by dropping onto a bib in the strip.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
