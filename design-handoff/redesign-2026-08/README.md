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
- **No trailing arrows on rows, app-wide (Bupe, 6 Aug).** A row is tappable as a whole; nothing decorates its right edge. The only trailing marks are live values (Theme's current value, backup status) and the gold crown on Plus rows in the free app. Month's previous and next buttons are pagers, not row furniture, and keep their arrows.
- **Bottom sheets (pattern set by the export flow, 6 Aug).** The shell's modal: a scrim over the screen, a surface-coloured sheet rising from the bottom with a 22px top radius, a grab handle, a Cal Sans title at 20px, one grey sub-line, radio option rows split by hairlines, and a full-width accent-fill action button. **Export my data opens the period sheet**: The whole record (default) / Last 7 days / Last 30 days / Choose dates, which expands From and To date fields; Export is the one confirmation tap. Every period is free, no crowns in this sheet: the free-export promise covers any slice of the record. (Date ranges on the PDF Evidence Pack stay a separate Plus candidate.)
- **The child page is a pushed page, not a drawer (Bupe, 6 Aug).** Opened from the Menu's avatar-and-name title. Header is back chevron + small avatar + the child's name at 23px. Then Details as icon-less value rows (Name, School, Year, Colour and avatar: the live editor's field set), a Children section (each child with its avatar, the active one carrying an accent check; "Add another child" as a dashed row), and a "Careful" section in the hard colour for Start the record again and Remove from this phone, both keeping the live app's backup-first confirm sheets. Footer line: "Both offer a backup first and need a clear confirm."
- **The Theme picker is a radio sheet** (Bupe, 6 Aug): Light / Dark / System, System carrying the sub-line "Follows your phone". A tap applies instantly and updates the Theme row's value; picker sheets carry no confirm button, action sheets (Export) carry exactly one.
- **Check in is two tiles side by side** (Bupe, 6 Aug): Your day on a deep blue panel, Dysregulation on a deep plum, dedicated `--tileblue` / `--tilepurple` tokens sitting deeper than the chip tints, icon and title in the tile's colour. No stroke: the tiles carry a drop shadow instead and are the app's one shadowed, borderless surface (Bupe's call, a deliberate exception to the hairline-over-elevation rule; the pill stroke law still governs chips and pills). The check-in actions are the one place the shell lends colour to controls, because they are the doors to the data itself.
- **The Month patterns lock is a blurred preview below the calendar** (Bupe, 6 Aug): the analytics shape blurred behind a soft veil carrying the solid gold crown, "Month patterns" and the feature line. The shape is two graphs: the mood bars, then a shorter purple row underneath for the dysregulation dimension, then the counts line ("9 good · 4 mixed · 5 hard · 6 dysregulation"). The old Plus row above the calendar is gone. Tapping the preview opens the Jotla Plus page (crown gate).
- **Document types are colour-coded pills** in the vault row sub-line (Bupe, 6 Aug): Plan in accent blue, Letter in amber, Email in green, pill stroke law applied. First mapping, open to reshuffle; Letter currently shares amber with the action chip.
- **The Plus page's "Everything in Free is included, always." sits between the CTA and the renewal text** (Bupe, 6 Aug), centred with its check mark.
- **Type: screen titles are Cal Sans, Regular, never bold** (Bupe, 6 Aug; Cal Sans only ships one weight, which is the point). Body stays Outfit.
- **Two faces only, enforced (Bupe, 6 Aug):** everything in the app renders in Outfit except display titles in Cal Sans. Buttons do not inherit font-family by default, so the phone scope carries `button { font-family: inherit }`; without it the nav labels and segmented control were silently falling back to the system font. Verified by a computed-font sweep across every frame: zero offenders.
- **Text size is a radio sheet like Theme** (Bupe, 6 Aug): Small / Standard / Large / Extra large, each label previewing its own size; a tap applies instantly and updates the row's value.
- **The Plus page shows the launch state (Bupe, 6 Aug).** The header row keeps only the crown disc (left) and the close X (right). The wordmark lockup sits centred above the carousel: "Jotla" in Cal Sans at 31px with "+Plus" italic, purple, smaller (20px) and raised 7px so the pair sit together; under it "The tools to spot patterns / and make your case." on two lines, centred. The Family Sync disclaimer is gone: Family Sync sells as carousel slide 3 of 5 (Patterns and Month View, PDF Evidence Pack, Family Sync, Photos and Videos on Notes, Dysregulation Mode; the dots page the slides on the board). Launch condition, decisions log 2026-08-06: Family Sync ships working at launch or the slide comes out. Layout: the carousel (300 x 158 slot, centred text) floats vertically centred between the header and the pricing; the term cards pin directly above the CTA; then the free-included line, renewal text and links.
- **Today header order**: the greeting leads ("Good afternoon."), the date sits under it in the small caps overline, and the status line ("Here is how Sam's day is looking...") is gone.
- **Menu and Settings split (Bupe, 6 Aug): Menu holds what parents reach for; Settings, behind a cog, holds everything else.** The Todoist browse screen is the pattern (avatar and name top left, cog top right).
  - **Menu**: the screen title is the child, avatar plus name (tapping it opens the child page), with the **cog top right opening Settings**. **Jotla Plus is the first row and looks unique: a SOLID gold crown icon** (the only solid icon and the only gold in the app). Then Your record: **Backup and Restore** and **Recycle Bin** last (the live app's 15 Jul 30-day Bin, renamed, sub "Kept for 30 days"). The "Jotla by SEN Help" endorsement is the footer. Nothing else lives here.
  - **Settings** (pushed page): Appearance (**Theme**, current value in grey, sheet with Light / Dark / System following the phone; **Text size**, sheet with Small / Standard / Large / Extra large: one step more than the live app's three), Privacy (**App lock · Off**), Reminders (**Daily reminder · Off**), Help and about (**Take the tour**, **Help**, **About Jotla**, **Tell us what you think**: the first and last already exist in the live app). Footer carries the live app's promise: no account, nothing leaves the phone.
  - **App lock and Daily reminder are new commitments adopted from the reference apps (both FREE, decided 6 Aug).** App lock follows the diary app's pattern re-aimed at Jotla's no-server promise: pattern or PIN plus fingerprint, verified on the device, recovery local-only: a child's record deserves a lock and privacy is never paywalled. Daily reminder is a gentle evening nudge to log the day: it drives the record habit, so it stays free like quick templates. Their own pages are still to be designed.
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
| tile blue / tile purple (check-in tiles) | `rgba(47,111,214,.26)` / `rgba(179,106,226,.22)` |

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
| tile blue / tile purple (check-in tiles) | `rgba(26,86,168,.15)` / `rgba(157,52,218,.14)` |

## What the build will touch (when green-lit)

`jotla.css` tokens and component styles, the tab bar (structure change: four tabs + FAB), the app header's removal, Find's relocation, and every screen's title block. Boot-assert will need its nav and header assertions re-anchored the same way the 4 Aug declutter pass re-anchored the wordmark ones: positive anchors first, then the negatives, with a negative control run before trusting green. Native mirrors after web per the two-track rule.
