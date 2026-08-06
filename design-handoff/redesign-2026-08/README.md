# Jotla redesign, August 2026: the neutral shell

Direction set by the founder on 2026-08-06 after reviewing Todoist's dark Android app (his reference screenshots live in Vision, `Gemini Gems/Demo`). The board that carries every decision below is [`lookdev-002.html`](lookdev-002.html): open it in a browser, dark pair on top, light pair below, Menu icon options and the D/G/E nav comparison above the frames.

**Status: dark theme LOCKED. Light theme first pass, still being worked. Build not started.** The live prototype and the native app still wear the old look until the build lands; the two-track rule applies when it does.

## The one-line direction

The shell goes neutral and the data gets the colour back. One accent (Jotla blue) does all the shell work; the mood colours are the only other colour on screen, so meaning is the brightest thing.

## Rules (all decided 2026-08-06, Bupe)

- **Rows, not cards.** Flat full-width rows on a slightly lighter surface, 14px radius, no card-in-card, no shadows doing border work. Light theme uses a hairline border instead of elevation.
- **One big left-aligned title** per screen ("Good afternoon.", "August 2026"). No app header bar; the wordmark's homes are the splash and About (per the 4 Aug declutter).
- **Section headers** are small, semibold, accent-coloured ("Check in", "Sam's day so far").
- **FAB**: a circle, accent fill, bottom right. It replaces BOTH the centre nav "+" and the full-width "Add to today" button. One add affordance.
- **Nav**: four tabs, `Today / Month / Documents / Menu`, original icon set (today house, calendar, doc). Active state is colour only (accent, stroke 2.2 vs 2). No pill or background behind the active icon.
- **Menu icon**: four rounded squares (option D on the board; picked over sliders G and dots E in real nav context). Menu holds the child switcher, Settings, export, About, and the "by SEN Help" endorsement.
- **Find**: a bare search icon top right of every screen. No box, no border, 22px. On Month it sits rightmost of the chevron cluster.
- **Month grid**: day tints are circles; the current day carries a 1.5px accent ring; tints appear only on days that hold data.
- **The pulse icon is the standing Jotla symbol for dysregulation** (path `M3 12h4l2.5-7 4 14 2.5-7H21`, drawn in the set's grammar).
- **Pill stroke law holds**: every tinted chip carries a 1px same-hue border (Dysregulation chip, Plus chip).
- **Type stays Outfit.** The typeface is Jotla's character; the shell does the calming, not a font change.

## Tokens

### Dark (locked)

| Token | Value |
|---|---|
| bg | `#201F1D` |
| surface | `#282725` |
| row | `#2E2D2A` |
| hairline | `rgba(255,255,255,.07)` |
| text | `#EDEBE7` |
| muted | `#A6A29B` |
| faint | `#7B7770` |
| accent (icons, text, section headers) | `#7CA9EF` |
| accent fill (FAB, primary buttons) | `#2F6FD6` |
| accent tint / border | `rgba(124,169,239,.14)` / `rgba(124,169,239,.45)` |
| good / mixed / hard | `#52B788` / `#E8A33D` / `#E5645C` |
| dysregulation | `#B36AE2` (tint `.16`, border `.45`) |
| no-note | `#55524C` |

### Light (first pass, in progress)

| Token | Value |
|---|---|
| bg | `#F7F5F2` (warm paper, replaces the old cool blue-white) |
| surface / row | `#FFFFFF` with border `rgba(35,33,29,.08)` |
| hairline | `rgba(35,33,29,.09)` |
| text | `#23211D` |
| muted | `#6F6A62` |
| faint | `#97928A` |
| accent + fill | `#1A56A8` (brand blue, full strength) |
| good / mixed / hard | `#1F9D66` / `#D9861C` / `#D64541` (numerals darker: `#1A7A50` / `#9A5E13` / `#A93832`) |
| dysregulation | `#9D34DA` (tint `.10`, border `.40`) |
| no-note | `#C9C4BC` |

## What the build will touch (when green-lit)

`jotla.css` tokens and component styles, the tab bar (structure change: four tabs + FAB), the app header's removal, Find's relocation, and every screen's title block. Boot-assert will need its nav and header assertions re-anchored the same way the 4 Aug declutter pass re-anchored the wordmark ones: positive anchors first, then the negatives, with a negative control run before trusting green. Native mirrors after web per the two-track rule.
