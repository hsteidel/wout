---
name: Hermann Road Book
description: A training week read as a six-stage race, each day a pinned Tyvek bib with its start list.
colors:
  ultramarine: "#2436d6"
  ultramarine-deep: "#1a2aa8"
  ultramarine-wash: "#e4e7fb"
  on-ultramarine: "#ffffff"
  on-ultramarine-mute: "#d3d8ff"
  race-black: "#111214"
  tyvek: "#eceef1"
  sheet-white: "#ffffff"
  mute-graphite: "#5b5e66"
  hairline: "#d2d5db"
  pin-silver: "#b8bcc4"
  flag-red: "#a3201a"
  flag-wash: "#f8e6e4"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(150px, 21vw, 300px)"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 5vw, 68px)"
    fontWeight: 900
    lineHeight: 0.95
    fontVariation: "'wdth' 62"
  numeral:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "52px"
    fontWeight: 900
    lineHeight: 0.9
    fontVariation: "'wdth' 62"
    fontFeature: "'tnum'"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.45
  dose:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    fontVariation: "'wdth' 85"
    fontFeature: "'tnum'"
  body:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
  pin: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  xs: "8px"
  sm: "12px"
  md: "14px"
  lg: "16px"
  row: "52px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.race-black}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  button-hover:
    backgroundColor: "{colors.race-black}"
    textColor: "{colors.sheet-white}"
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.on-ultramarine}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ultramarine-deep}"
    textColor: "{colors.on-ultramarine}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.race-black}"
    typography: "{typography.label}"
    padding: "0 18px"
    height: "44px"
  button-quiet-hover:
    textColor: "{colors.ultramarine}"
  input:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.race-black}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  bib:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.race-black}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "28px 32px 0"
  bib-band-today:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.on-ultramarine}"
    typography: "{typography.label}"
    padding: "14px 32px"
  bib-band-other:
    backgroundColor: "{colors.race-black}"
    textColor: "{colors.on-ultramarine}"
    typography: "{typography.label}"
    padding: "14px 32px"
  week-bib:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.race-black}"
    typography: "{typography.numeral}"
    rounded: "{rounded.none}"
    padding: "10px 14px 12px"
    height: "124px"
  week-bib-today:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.on-ultramarine}"
  week-bib-selected:
    backgroundColor: "{colors.race-black}"
    textColor: "{colors.sheet-white}"
  start-list-row:
    backgroundColor: "transparent"
    textColor: "{colors.race-black}"
    typography: "{typography.title}"
    padding: "8px 0"
    height: "52px"
  change-tag:
    backgroundColor: "{colors.ultramarine-wash}"
    textColor: "{colors.ultramarine-deep}"
    rounded: "{rounded.none}"
    padding: "1px 6px"
---

# Design System: Hermann Road Book

## Overview

**Creative North Star: "The Stage Race Road Book"**

The week is a stage race. Each training day is a numbered stage: a white Tyvek bib pinned to an off-white ground, with its start list printed beside it like a road book. The strip of seven same-scale bibs shows the race's rhythm, alternating strength stages and trail rides with a dashed rest day, before a single caption is read.

The world is printed and flat. Race-black ink does the work; one ultramarine marks today and the primary action. A single condensed grotesk family (Archivo, driven by its width axis) carries everything at stepped sizes, from 300px bib numerals down to 11px tags, with tabular figures throughout so doses and stage numbers sit in clean columns. Paper is the only material: sheets have a hard 2px black edge and square corners, pin holes are drawn as silver rings, rows are separated by hairlines and never boxed.

Density is a road book's: generous at the top (one big bib, one big stage title), tight and columnar in the start list. Motion is a single gesture, re-pinning the bib when the stage changes.

**Key Characteristics:**
- Tyvek ground, white bib sheets, race-black ink, one ultramarine.
- One family, Archivo, at stepped sizes; width axis from 62% (numerals, titles) through 75% (labels) to 85% (doses).
- Square corners everywhere; the only circles are pin holes.
- Bibs are sheets with a 2px ink edge and pin holes; start-list rows are hairline-ruled, never enclosed.
- Flat; depth only for the two overlays that float over the page.

## Colors

A print palette: off-white stock, black ink, one spot color, silver hardware, and a red reserved for errors.

### Primary
- **Race Ultramarine** (ultramarine): the spot color. Fills today's bib band and today's bib in the week strip, the primary button (Edit week, Save version, Restore, Email me a sign-in link), the focus ring (3px outline, 2px offset), text selection, the drag drop line, and the hover color of quiet and icon buttons.
- **Deep Ultramarine** (ultramarine-deep): primary button hover; text on the change tag.
- **Ultramarine Wash** (ultramarine-wash): the change tag ground and the current item in version history.
- **On Ultramarine / Muted** (on-ultramarine, on-ultramarine-mute): text and secondary captions on ultramarine fills.

### Neutral
- **Race Black** (race-black): all body ink, the 2px edges on bibs, buttons and inputs, the masthead and footer rules, the selected non-today stage, the banner and save bar grounds.
- **Tyvek** (tyvek): the page ground; also fills the pin-hole centers so they read as punched through the sheet.
- **Sheet White** (sheet-white): bib sheets, inputs, the sign-in panel and the version drawer.
- **Mute Graphite** (mute-graphite): muscle groups, rest, meta lines, footer text, the rest-day numeral.
- **Hairline** (hairline): the 1px rules between start-list rows and history items.
- **Pin Silver** (pin-silver): pin-hole rings, the dashed add-exercise line, captions on the selected ink bib and in the save bar, the scrollbar thumb.

### Tertiary
- **Flag Red / Flag Wash** (flag-red, flag-wash): errors only (failed load banner, sign-in error). Never decorative.

### Named Rules
**The Today Rule.** Among stage markers, ultramarine means today and nothing else. The bib band is ultramarine only when the stage shown is today; any other selected stage gets a race-black band. In the week strip today's bib is filled ultramarine, and the selected non-today bib is filled race-black. Stage selection is never shown in ultramarine.

**The One Spot Color Rule.** Ultramarine is the only chromatic color outside error states. It marks today, the primary action, focus, and change; it is never a background wash for a section or a decorative accent.

## Typography

**Display Font:** Archivo (with Arial Narrow, sans-serif)
**Body Font:** Archivo (same family)

**Character:** One condensed grotesk, the bib printer's face. Hierarchy comes from width-axis and weight steps, not from a second family: ultra-condensed black for numerals and titles, condensed bold caps for labels, normal width for reading text.

### Hierarchy
- **Display** (900, 62% width, clamp(150px, 21vw, 300px), line-height 0.8): the big bib numeral only. Steps down to 104px when editing on desktop and clamp(88px, 26vw, 140px) on phones.
- **Headline** (900, 62% width, clamp(40px, 5vw, 68px), line-height 0.95, uppercase, balanced wrap): the stage title.
- **Numeral** (900, 62% width): week-strip numbers (52px, 40px on phones), version numbers in history (34px), start-list margin numbers (24px). The wordmark and drawer heading use the same cut at 26px uppercase.
- **Title** (600, 17px): exercise names in the start list; history notes at 16px.
- **Dose** (800, 85% width, 18px, right-aligned, tabular): sets × reps.
- **Body** (400, 16px, line-height 1.45): banners, messages, footer (14–15px).
- **Label** (700, 75% width, 0.08em tracking, uppercase, 11–20px): bib band (20px, 800, 0.1em), meta line (15px), buttons (14px), version stamp and muscles (13px), week captions and field captions (11–12px).

### Named Rules
**The One Family Rule.** Archivo only, at stepped sizes. No second face, no in-between sizes invented per component.

**The Tabular Rule.** Figures are tabular everywhere (set on the body), so stage numbers, doses and dates align in columns.

## Layout

A page-width gutter of clamp(16px, 4vw, 56px) frames every band. Desktop: masthead strip, then the stage as a two-column grid (bib at minmax(300px, 0.85fr), start list at 1.4fr, gap clamp(28px, 4vw, 64px)), then the seven-bib strip as an equal 7-column grid with 14px gaps, then the footer. Every bib in the strip shares one scale and one baseline.

In edit mode on desktop (861px and up) the bib steps back to a 200px tag so the editable start list gets the width. Below 1180px the row tools drop to their own line.

At 860px and below: the week strip moves above the stage and becomes a horizontal scroll-snap row of 104px bibs; the big bib becomes a band-led header (numeral at 42% width beside the band); the start list goes full width with muscle and dose stacked in two lines per row.

Start-list rows are a fixed column grid: 52px margin numeral, name, 140px muscle, 112px dose, 96px rest. **The Shared Rest Rule.** When every exercise shares the rest already stated in the meta line, the per-row rest column is dropped rather than repeated.

## Elevation & Depth

Flat. Sheets sit on the ground with a 2px ink edge, not a shadow. Two overlays float and are the only soft shadows: the version drawer (`-12px 0 32px rgba(17,18,20,0.12)`) and the edit save bar (`0 -8px 28px rgba(17,18,20,0.18)`). The selected week bib carries a 2px ink underline 4px below its edge (drawn with a box-shadow), a print mark rather than a lift. Hovering a week bib raises it 3px.

**The Flat Sheet Rule.** Depth on the page is edge and fill, never shadow; shadows belong only to the drawer and save bar that overlay it.

## Shapes

Square corners everywhere (0 radius), including buttons and inputs. The only round forms are pin holes: 14px silver rings with a Tyvek center on the big bib (four on desktop, two on phones), 7px rings on week bibs (two, top corners). Rest days use a dashed edge on a transparent sheet. The add-exercise control uses a dashed silver line. Ride stages in the week strip carry a drawn trail line, a fixed zigzag symbol that marks the stage as a ride; it is a symbol, not elevation data, and must never vary per ride.

**The Pin Rule.** Every bib carries pin holes, at every size and state.

**The Open Row Rule.** Start-list and history rows are separated by 1px hairlines and are never enclosed in boxes or cards. Bibs are the only sheets; controls (buttons, inputs) carry the 2px ink edge as instruments, not containers.

## Components

### Buttons
- **Shape:** square, 2px edge, 44px minimum height, 0 18px padding, condensed caps label at 14px, 8px gap to an 18px stroked icon.
- **Default:** transparent with race-black edge; hover inverts to black fill with white text.
- **Primary:** ultramarine fill and edge, white text; hover deepens to ultramarine-deep.
- **Quiet:** no edge; hover turns the label ultramarine.
- **Line:** dashed pin-silver edge, mute text; hover goes white with ultramarine edge and text. Used for Add exercise.
- **Icon button:** 40px square, mute stroke icon, ultramarine on hover; disabled at 0.3 opacity.
- **Transitions:** background and color, 160ms on the expo-out curve.

### Inputs / Fields
- **Style:** white ground, 2px race-black edge (1px inside edit rows), square, 44px tall (40px in rows). Labels sit above in condensed caps at 12px, mute.
- **Focus:** the global 3px ultramarine outline at 2px offset; caret is ultramarine.
- **Error:** message text in flag red; no red field edge.

### Navigation
- **Masthead:** wordmark (900, 62% width, uppercase, with the second word at 500), the version stamp as a quiet caps button with a history icon (bold version number in ink, the rest mute, ultramarine on hover or open), sign-in and Edit week at right. A 2px ink rule closes it.

### The Bib (signature)
White sheet, 2px ink edge, pin holes, the stage number at display size centered, and a full-bleed band along the bottom naming the weekday and stage in condensed caps. Band is ultramarine for today, race-black otherwise. Rest days show "Rest" in mute at a smaller step on a dashed transparent sheet. When the stage changes the bib re-pins: the numeral wipes up from below (520ms) and the band wipes in from the left (600ms), both on cubic-bezier(0.16, 1, 0.3, 1).

### Week Strip Bib (signature)
124px tall (104px on phones), white sheet, 2px ink edge, two small pin holes, three-line stack: weekday caps (with "· Today" on today), numeral, summary caption. Ride stages add the trail line; rest is dashed with an em dash for its numeral. Today fills ultramarine; the selected non-today stage fills race-black with the ink underline beneath. In edit mode a bib accepts dropped rows and shows a 3px dashed ultramarine outline as the drop target.

### Start List Row
Margin numeral (01–08; currently shipped in ultramarine on every stage, which stretches the Today Rule and is under review rather than a rule to copy), exercise name, muscle in condensed caps, dose right-aligned, optional rest; 52px minimum, hairline above and a hairline closing the list. Version comparisons add a small square change tag (ultramarine-wash, 11px caps) after the name and turn a changed dose ultramarine. Dragging dims the row to 0.4 and shows a 3px ultramarine insertion line.

### Version Drawer and Save Bar
The drawer is a non-modal white sheet docked right (400px; bottom sheet at 78vh on phones), 2px ink left edge, history items as hairline-ruled rows with a big version numeral; current item on ultramarine-wash. The save bar is a race-black band pinned to the bottom in edit mode, with a white note input, a quiet Discard and a primary Save version.

## Do's and Don'ts

### Do:
- **Do** reserve ultramarine for today among stage markers; show any other selected stage in race-black.
- **Do** give every bib pin holes, at every size.
- **Do** mark ride stages in the week strip with the same drawn trail line, a symbol, not data.
- **Do** separate rows with 1px hairlines (hairline) and leave them open.
- **Do** drop the per-row rest when every exercise shares the rest already stated in the meta line.
- **Do** build hierarchy from Archivo's width axis and weight at the stepped sizes above, with tabular figures.
- **Do** keep every corner square except pin holes.

### Don't:
- **Don't** enclose start-list or history rows in boxes or cards.
- **Don't** use ultramarine to show stage selection, or as a decorative fill or section wash.
- **Don't** draw the trail line from real elevation data or vary it per ride.
- **Don't** add a second typeface or round any corner.
- **Don't** put shadows on sheets; only the drawer and save bar float.
- **Don't** use flag red for anything but errors.
