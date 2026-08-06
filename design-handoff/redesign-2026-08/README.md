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
- **Nav**: five tabs, `Today / Month / Documents / Find / Menu` (Find placed between Documents and Menu, locked 2026-08-06 after trialling it against a corner icon). Original icon set (today house, calendar, doc, search). Active state is colour only (accent, stroke 2.2 vs 2). No pill or background behind the active icon.
- **Menu icon**: four rounded squares (option D on the board; picked over sliders G and dots E in real nav context). Menu holds the child switcher, Settings, export, About, and the "by SEN Help" endorsement.
- **Find**: lives in the nav (fifth tab). The earlier top-right corner icon is retired; screen headers carry no search.
- **Month grid**: day tints are circles; the current day carries a 1.5px accent ring; tints appear only on days that hold data.
- **The pulse icon is the standing Jotla symbol for dysregulation** (path `M3 12h4l2.5-7 4 14 2.5-7H21`, drawn in the set's grammar).
- **Pill stroke law holds**: every tinted chip carries a 1px same-hue border (Dysregulation chip, Plus chip).
- **The crown is the Plus gate, app-wide (Bupe, 6 Aug).** In the FREE app, a Plus-gated row shows the solid gold crown in place of its trailing control (chevron or toggle), with no "Plus" pill or label needed, and **tapping any crowned row always opens the Jotla Plus page**. In the paid app the crown disappears and the real control appears. This replaces the old PlusLockedCard pattern everywhere it survives the redesign (Month patterns, Find filters, media locks, the vault's add-the-document).
- **Type: screen titles are Cal Sans, Regular, never bold** (Bupe, 6 Aug; Cal Sans only ships one weight, which is the point). Body stays Outfit.
- **Today header order**: the greeting leads ("Good afternoon."), the date sits under it in the small caps overline, and the status line ("Here is how Sam's day is looking...") is gone.
- **Menu**: the screen title is the child, avatar plus name, not the word "Menu"; tapping it switches or edits the child. **Jotla Plus is the first row and looks unique: a SOLID gold crown icon** (the only solid icon and the only gold in the app). Then Your record (Export, Restore), App (**Theme**, showing just the current theme in grey, with three options: Light, Dark, System following the phone; **Text size**), About Jotla, and the "Jotla by SEN Help" endorsement as the footer.
- **Documents**: title is just "Documents" (the old subtitle and the green banner explained the screen, the declutter took both); segmented switch kept with **Documents leading** (Documents / Day records, swapped 2026-08-06); "Add a document" is a dashed row under the list.

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
| gold (Plus crown only) | `#EBBA4D` |

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
| gold (Plus crown only) | `#BE8E1E` |

## What the build will touch (when green-lit)

`jotla.css` tokens and component styles, the tab bar (structure change: four tabs + FAB), the app header's removal, Find's relocation, and every screen's title block. Boot-assert will need its nav and header assertions re-anchored the same way the 4 Aug declutter pass re-anchored the wordmark ones: positive anchors first, then the negatives, with a negative control run before trusting green. Native mirrors after web per the two-track rule.
