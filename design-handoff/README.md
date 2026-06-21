# Handoff: Jotla — day-record app for SEND families

## Overview
**Jotla** (by SEN Help) is a calm, mobile-first app that lets a parent/carer keep a running, time-stamped record of how a child with SEND (Special Educational Needs and Disabilities) is doing across the day — at school, at home, at a club. Parents log short "moments" (good / up-and-down / hard), capture a structured "handover note" at the school gate, browse a month overview, search/filter past entries, and store official documents (EHCP letters, OT reports, support plans). The records build into evidence that can be used in meetings and assessments.

The product is warm and low-pressure by design: plain UK-English parent language, soft colours, friendly faces, big tap targets, "a line is plenty" framing. It is a single-child-at-a-time view with a profile switcher — parents can **add children** (a blank-record onboarding + an 8-step app tour), **edit** each child (name/school/year, a glyph+colour avatar from 10 glyphs / 12 colours, **or a real cropped photo**), and **delete** a child behind a guarded, backup-first flow. The app also has a **Free / Jotla Plus** monetisation model: Plus is a one-time £39 unlock that the parent switches into (and back out of) via confirm dialogs, with a gradient "plus" lockup shown in the header while active.

## About the Design Files
The files in `source/` are a **design reference, built as an HTML + React-via-Babel prototype**. They are *not* production code to ship as-is — they run entirely in the browser off CDN React and in-browser Babel transpilation, use `localStorage` for persistence, and render inside a fake iOS device bezel for preview.

**The task is to recreate these designs in the target codebase's real environment** — e.g. React Native / Expo, Swift/SwiftUI, Flutter, or a production React web app — using that environment's established components, navigation, state, and styling patterns. If no app environment exists yet, choose the most appropriate framework for a mobile-first product and implement the designs there. Lift the exact visual values (colours, type, spacing, radii, copy) from this reference; re-architect the plumbing (routing, storage, camera, etc.) properly for the platform.

## Fidelity
**High-fidelity (hi-fi).** Final colours, typography, spacing, copy, iconography, and interaction behaviour are all intentional and should be reproduced faithfully. Where this document gives a hex value, font size, or radius, treat it as the spec. The one thing that is *mocked* and must be built for real on-platform: **media capture/attachment** (see "Quick log" → media).

## Tech in the prototype (for context only — do not reproduce verbatim)
- React 18 (UMD) + Babel Standalone, multiple `<script type="text/babel">` files sharing globals via `Object.assign(window, …)`.
- All data + helpers hang off a global `window.JOTLA` object (see `jotla-data.jsx`).
- Persistence is `localStorage` (`jotla_entries_v3`, `jotla_docs_v1`, `jotla_prefs_v1`, `jotla_nav_v2`).
- A hand-rolled router (`view` + `history` + `tab` state in `App`) — replace with the platform's real navigation stack/tabs.
- `ios-frame.jsx` is **only** a desktop preview bezel. On a real phone the app renders full-screen (`appMode`). Ignore the bezel when implementing.

---

## Global structure

The app is a fixed phone frame with three persistent layers:

1. **Persistent header** (`AppHeader`, `.j-appheader`) — top, always visible except in Child mode.
2. **Screen area** — the active screen, fades in on change (`.j-fade`, 0.28s rise).
3. **Tab bar** (`TabBar`, `.j-tabbar`) — bottom, shown only on the 4 top-level tab screens (Today, Month, Find, Settings) plus the central Log button.

Pushed screens (Quick log, Handover, Day, Entry, Document, Add document, Child mode, Unlock) replace the screen area and hide the tab bar; they have their own `PushHeader` with a back or close button.

### Persistent header — `AppHeader`
- Layout: `flex`, `space-between`, `align-items:center`, `gap:12px`, `padding: 6px 18px`. Background `--header-bg` (translucent off-white) with `backdrop-filter: blur(14px)`, 1px bottom border `--line`.
- Left: **wordmark** "Jotla" (Cal Sans, blue `--blue`) with "by SEN Help" sub-label (small, `--faint`). **When Plus is active** (`nav.plus`), a gradient "**plus**" word (Cal Sans, `linear-gradient(135deg,#2B1A66,#6E54D6)` clipped to text) sits between the logo and the "by SEN Help" sub-label.
- Right: a row (`gap:10px`) of:
  - **Documents** icon button (`doc` icon, 23px, `--blue`) — opens the Evidence/Documents screen.
  - **Avatar** button (`.j-avatar`, 44×44, circular) — the active child's `ChildAvatar` (photo, or glyph tinted by the profile's colour). **Tap** opens the profile-switcher sheet; **press-and-hold (~500ms)** opens that child's Edit sheet (`ChildOptionsSheet`).
- The header height is intentionally tight: padding is **equal top and bottom (6px)** so the 44px avatar (tallest item) has even breathing room.

### Tab bar — `TabBar`
Five slots, evenly spaced (`justify-content: space-around`), **bottom-aligned** (`align-items: flex-end`):
`Today · Month · [ + Log ] · Find · Settings`
- Each normal tab (`.j-tab`): a vertical stack of a 24px line icon + 11px label, `gap:4px`, no padding. Inactive `--faint`; active `--blue` (`.j-tab-on`), icon stroke 2.2 and slightly heavier.
- Centre **Log** slot (`.j-tab-log`): a 56×56 solid blue circle FAB (`.j-logfab`, `border-radius:50%`, shadow `0 10px 22px -8px rgba(26,86,168,0.7)`) holding a white `+` (28px, stroke 2.4), with the label "Log" beneath it.
- **Alignment rule (important):** all five labels sit on the **same baseline** (bottom-aligned). The four side icons therefore drop down so their labels line up with the word "Log". The FAB is the tallest element and **protrudes above the bar's top edge** via `margin-top:-22px` — i.e. the bar's top border passes *behind* the bubble. The FAB itself is never resized or repositioned to achieve this.
- Bar padding: `8px 8px 40px`. The large bottom padding lifts the labels clear of the iOS home indicator. On a real device use the safe-area inset instead: `padding-bottom: calc(env(safe-area-inset-bottom) + 14px)`.

### Profile switcher — `ProfileSheet`
A bottom sheet (`.j-sheet`, slides up 0.26s) over a dark scrim. Title "Whose day is this?", subtitle, then a list of children. Each row: 46px circular `ChildAvatar` (photo or glyph), name (Cal Sans 18px) + "Year · School" sub-line; selected row gets a blue border + `--tint-blue` fill + check icon. A dashed **"Add a child"** row opens the onboarding screen (`view 'addchild'`).

---

## Screens / Views

> Active "today" in the seed is **Friday 12 June 2026**. All dates are ISO `YYYY-MM-DD`.

### 1. Today  (`TodayScreen`, tab)
**Purpose:** the home screen — at-a-glance state of the child's day + quick entry points.
**Layout (scroll):** padded column (`padding: 0 20px`, top 14, bottom 28).
- Eyebrow: full long date (e.g. "Friday, 12 June"), `--blue`, uppercase, letter-spacing.
- `h1` greeting ("Good morning." / "Good afternoon." / "Good evening." by local hour), Cal Sans 30px.
- Intro line, `--muted`.
- **Two action tiles** in a row (`gap:12`), each `ActionTile` (flex:1, soft tinted card, radius 16, padding `14 14 16`): a 38px white rounded icon chip, then a Cal Sans 16px title + 12.5px `--muted` sub.
  - "Your day" — heart icon, `--tint-green`, "Hand the phone to {child}" → Child mode.
  - "At the gate?" — note icon, `--tint-blue`, "Capture a handover" → Handover.
- **Month summary card** (`MiniMonthStrip`): "This month" + "Open Month view ›". Three bars (Good / Mixed / Hard) with counts coloured green/amber/red, bar height scaled to count; a one-line insight ("Lunchtime transitions are showing up as the hard moments…").
- **"Today" section** (`SectionLabel` — uppercase 13px `--faint`):
  - If there are entries today: a column (`gap:12`) of `EntryCard`s.
  - **Empty state:** a centred card with a **friendly smiley `Face` (mood `good`, 56px)** — *this is deliberately the happy face, not the neutral one, to feel friendlier* — then `h3` "Nothing logged yet today" and a calm sub-line.
- **"Add to today" button** (always, after the list): full-width primary button (`.j-btn-primary .j-btn-lg`) with a `+` icon → opens Quick log defaulting to today.

### 2. Quick log  (`QuickLogScreen`, pushed)
**Purpose:** capture one moment in under ~30 seconds.
**Header:** `PushHeader` title "Quick log", subtitle "Takes under 30 seconds", close (×) button → back.
**Body** (scroll, vertical stack `gap:22`, bottom padding 120 to clear the sticky Save bar). Fields top-to-bottom:
1. **Which day?** (`FieldLabel` + chip row). Three chips: **Today** (default), **Yesterday**, **Another day**. Selecting "Another day" reveals a native date input (`min 2026-01-01`, `max` = today). A caption reads "Saving to **{long date}**". This resolves to the entry's `date`. (Today = the active date; Yesterday = today − 1; Another day = the picked date — lets a parent back-fill a remembered incident.)
2. **Where?** — chips from `SETTINGS`: School · Nursery · Home · Club. Default School.
3. **When?** — chips from `TIMES`: **Morning · Afternoon · Evening**. Default Afternoon. *(Evening exists for home episodes / sleep troubles.)*
4. **What kind of moment?** — chips from `CATEGORIES`: Mornings · Eating · Play · Transitions · Lunch hall · Other. Default Transitions.
5. **What happened?** — `textarea` (`.j-input`, 3 rows), placeholder "A line is plenty. You can always add more later." Optional.
6. **Add a photo or video** — `MediaPicker` (see below).
7. **How did it feel?** — `MoodFacePicker`: three big faces (Good / Up and down / Hard), tapping rings the selected one in its mood colour. Default good.
**Sticky footer:** full-width primary **Save** (check icon) over a `--fade-grad` gradient. On save, builds an entry (`mood`, `setting`, `category`, `time`, the resolved `date`, a `clock` HH:MM of "now", a generated summary if the text is blank) and returns.

#### `MediaPicker`  (mocked in prototype — BUILD FOR REAL on-platform)
Two dashed-border tiles in a row (`gap:12`, each flex:1, 84px min-height, radius 14):
- **Left = Capture** (camera icon) — sub-label "Photo or video". On a real device: open the camera to take a photo **or record a video**; the recording plays back and saves to the phone.
- **Right = Attach media** (paperclip icon) — sub-label "Image or video". On a real device: pick an existing image **or** video from the library.
Order matters: **Capture is on the left, Attach on the right.**
Tapping a tile reveals a two-button choice row (Capture → "Take photo" / "Record video"; Attach → "Choose image" / "Choose video") with a Cancel link. After a choice, it shows a **result tile**: a 150px preview area (striped placeholder in the mock) — for video a circular white play button + a duration chip ("0:14") bottom-left; for a photo a camera glyph — with a remove (×) button top-right, and a caption strip below ("Recorded just now · saved to your phone" / "Image chosen from your library", etc.).

### 3. Handover note / "Dysregulation Mode"  (`HandoverScreen`, pushed)
**Purpose:** one calm screen to capture a hard incident at the school gate with minimal typing.
**Header:** `PushHeader` "Handover note" / "One calm screen. Minimal typing." + back.
**Body:**
- Auto-attached context pills (time + school) as `.j-pillbadge`s.
- A blue tinted card "Ask the teacher" listing 5 numbered prompts (What were they doing? / Who was there? / What happened just before? / How long? / What helped them settle?).
- **What did you see?** — multi-select chips from `BEHAVIOURS` (Crying, Hitting out, Running off, Refusing, Stomping, Withdrawing, Screaming) + a dashed "Add your own".
- **Before / During / After** — three `PhaseField`s (small blue label + hint + 2-row textarea).
- **How long did it last?** — `Stepper` (− / value / +, in minutes; 52px round buttons).
- **What helped them settle?** — textarea.
- **Add a photo or video** — `MediaPicker`.
**Sticky footer:** "Finish later" ghost button (≈38% width) + primary "Save note". Saved as an entry with `type:'handover'` and a `handover` object (`behaviours, before, during, after, duration, helped`).

### 4. Month  (`MonthScreen`, tab)
**Purpose:** the month at a glance; tap a day to read it back.
- Title "June 2026" + "Tap any day to read it back."
- An insight banner (leaf icon, amber tint): "Afternoons have been harder this week…".
- A calendar grid (Mon-first header), each day cell coloured by `dayMood` (green/amber/red tint) with a small mood dot; future/empty days muted.
- A legend: Good day / Up and down / Hard day / No note.
- Tapping a day → Day detail.

### 5. Day detail  (`DayScreen`, pushed)
List of that day's `EntryCard`s under a `PushHeader` showing the date.

### 6. Entry detail  (`EntryScreen`, pushed)
Full read-back of a single entry (time, mood, setting/category tags, summary, any photo, and for handovers the structured before/during/after/duration/helped).

### 7. Find  (`FindScreen`, tab)
**Purpose:** search + filter across all entries.
- Title "Find" / "Search across everything you have noted."
- Search input.
- Filter sections (chip rows): **Themes** (`FIND_THEMES`), **Mood** (`FIND_MOODS` Good/Mixed/Hard, with coloured dots), **Where** (Any/School/Home/Club), **When** (date-range presets via `DateRangeControl`: Any time / This week / Last 2 weeks / Last 3 weeks / Custom — Custom reveals From/To date inputs).
- Results: `EntryCard`s with the date shown (`showDate`).

### 8. Documents / Evidence  (`EvidenceScreen`, pushed from header)
A vault of official documents (`SEED_DOCS`): toggle between "Records" and "Documents". Each doc card shows title, type, source, received date, summary, and any action ("Reply by 30 June"). Add via `AddDocScreen` (source → type → details). `DocScreen` shows one document.

### 9. Settings  (`SettingsScreen`, tab)
Profile summary (tap → Edit child) + app settings. Includes the **Jotla Plus** card (→ Tiers screen; shows "Active" when owned), backup/export rows, privacy, a **dark mode** toggle (full dark theme — see tokens), and an **About** group with **"Take the tour"** (→ `view 'tour'`) and **"Add another child"** (→ `view 'addchild'`).

### 10. Child mode  (`ChildScreen`, pushed)
A separate, warmer full-screen mode (background `#FFF6EC`, no app header) where the child themselves picks a scene (Classroom / Lunch hall / Playground) and an emotion face (Happy / Ok / Sad / Worried / Angry). Big friendly `Face` illustrations.

### 11. Jotla Plus / Tiers  (`UnlockScreen`, pushed — `view 'unlock'`)
**Purpose:** the monetisation screen. A horizontal swipe pager comparing three tiers, reached from Settings ("Patterns, filters and PDF pack" card) and from the "At the gate?" intro (`GateIntroScreen`).
- Header `PushHeader` "Jotla Plus" / "Swipe to compare the three tiers." + close.
- **Three pill tabs** (`Free` · `Plus` · `Coming soon`) above a scroll-snap pager of three pages:
  - **Free** (`FreePage`) — flat blue identity. "Free, forever" badge, a `CheckList` of free features (daily logging, child walkthrough, basic timeline, keyword search, raw export, appeal-deadline reminders), and a "Your record is yours" reassurance.
  - **Plus** (`PlusPage`) — premium purple identity (`PLUS_GRAD = linear-gradient(135deg,#3C2A72,#6E54D6)`, accent `#CDBBF7`/`#6E54D6`). Hero with price **£39 one-time**, "Everything in Free is included", then `PlusFeature` cards (Patterns & Month View, Deep Filtering, Dysregulation Mode, PDF Evidence Pack). (A `SALE` object + `useSaleCountdown` can switch on a limited-time £29 promo — off by default.)
  - **Coming soon** (`LivingPage`) — premium navy + gold "membership" tier, disabled CTA "Coming with the membership".
- **Bottom CTA** is contextual to the visible page + ownership (`nav.plus`):
  - Free page, not owned → "See Jotla Plus →" (advances pager).
  - Free page, **owned** → outlined **"← Switch back to Free"**.
  - Plus page, not owned → **"Get Jotla Plus, £39"** (purple gradient).
  - Plus page, owned → disabled "You have Jotla Plus".
  - Coming soon → disabled.
- **Confirm dialogs (both are guarded bottom sheets):**
  - **Switch up to Plus** — tapping "Get Jotla Plus" opens a sheet "You are about to switch to Jotla Plus" listing what turns on, with **Confirm** / **Cancel**. Confirm calls `nav.buyPlus()` and shows a "You have Jotla Plus" success sheet.
  - **Switch down to Free** — tapping "Switch back to Free" opens "Switch back to Free? Are you sure?" with **Yes, switch to Free** / **Keep Jotla Plus**. Confirm calls `nav.dropPlus()` and shows a gentle "You are on Free" sheet.
- **`plus` is a global app mode** (not per-child): it persists across children and flips Plus-only behaviour app-wide (e.g. "At the gate?" goes straight to `handover` when `plus`, else to `gateintro`).

### 12. Add a child — onboarding  (`AddChildScreen`, pushed — `view 'addchild'`, file `jotla-onboard.jsx`)
**Purpose:** create a brand-new, **blank** record and switch to it. Reached from the **"Add a child"** row in the profile-switcher sheet, and from Settings → "Add another child".
- `PushHeader` "Add a child" / "A fresh, blank record", close → home.
- **Live preview** at top: 88px `ChildAvatar` of the in-progress child + name + "Year · School"; below it the **photo controls** (Upload a photo / Remove).
- Fields: **Their name** (required — CTA is disabled and reads "Add a name to continue" until filled), **School or setting** (optional), **Year group** (optional).
- **Pick an avatar** — 10 glyph tiles (see avatars below). **Pick a colour** — 12 swatches.
- Sticky CTA "Create {name}'s record" → `nav.addChild({...})` then pushes the **tour**. The new child has zero entries/docs, so every screen shows its empty state; Today shows a dedicated first-run card ("A fresh, blank record" + "Take the quick tour").

### 13. App tour  (`TourScreen`, pushed — `view 'tour'`, file `jotla-onboard.jsx`)
**Purpose:** a calm 8-step walkthrough of the whole app. Shown automatically right after adding a child, and re-launchable from Settings → "Take the tour" and from the Today first-run card (so the app can be handed to someone else to review).
- Full-screen (no app header/tab bar). "Tour · n of 8" eyebrow + **Skip**. Centre: a 134px tinted disc with an `Icon` (or a happy `Face` on the child-mode step), Cal Sans title, body copy (personalised with the child's name). Progress dots + **Back** / **Next**; the last step's primary is "Start the record" → home.
- Steps: Welcome (blank record) · Today is home · A line is plenty (Quick log) · At the gate (gate note) · Their day in their words (child mode) · See the shape of it (Month/Find) · Private by default · You are ready.

---

## Child profiles: avatar, photo, add & delete

The app is single-child-at-a-time with a profile switcher; it now fully supports **multiple children, each editable, with a real photo or a chosen avatar.**

### Avatar system (`ChildAvatar`, `jotla-illustrations.jsx`)
Each child has either a **photo** or a **glyph + colour** avatar:
- **Glyph avatars** — a line-art `Icon` (or the built-in `person` figure) tinted with the child's `figure` colour on an 18%-opacity disc of that colour. **10 glyphs:** `person, heart, star, leaf, sparkle, shield, bell, hand, today (house), note (book)`.
- **12 colours** (`AVATAR_COLOURS` in `jotla-data.jsx`, `figure` hex): amber `#F39C12`, gold `#D9A300`, orange `#EE7B2D`, lime `#A0C81E`, green `#27AE60`, teal `#0FA3A3`, sky `#3A7BD4`, indigo `#1A56A8`, slate `#607C97`, violet `#7C5CE0`, plum `#A12FC0`, pink `#D6479B`. (No pure red — that is reserved for the alert/hard colour.)
- **Photo** — if a child has a `photo` (a data URL) it renders the image cover-cropped in the circle, overriding the glyph; removing the photo falls straight back to the chosen glyph + colour. Photos appear everywhere the child does (header, switcher, details).

### Photo upload + crop  (`PhotoCropper`, `jotla-illustrations.jsx`)
Picking a photo (in Add-a-child or Edit-child) does **not** just auto-crop — it opens a **"Position the photo"** adjuster sheet:
- A 280px **circular** preview (the exact avatar crop) over the chosen image, cover-fitted and centred to start.
- **Drag to pan** (pointer events, clamped so the image always covers the circle) and a **zoom slider** (1×–3×, zooms about centre).
- **Use photo** rasterises the visible crop to a **320×320 JPEG (q0.88) data URL**; **Cancel** discards.
- On platform: replace the canvas/`localStorage`-data-URL approach with the OS image picker + a native crop/zoom control, storing the cropped image in your asset store. `fileToDataURL` and `PhotoCropper` are prototype helpers.

### Edit child  (`ChildOptionsSheet`, `jotla-app.jsx`)
Opened by tapping the Settings profile card, or **press-and-hold the header avatar**. A scrollable bottom sheet to edit one child: **Photo** (upload/change/remove → cropper), **Avatar** (10 glyphs), **Colour** (12), **Name**, **School**, **Year**, **Done** — plus a **Danger zone**.

### Add child  (`nav.addChild`)
Creates a custom profile `{ id:'c'+timestamp, name, school, year, figure, glyph, photo }`, appends it to `customProfiles`, makes it active. The profile list is `[...J.PROFILES (seed), ...customProfiles]` minus `deletedIds`.

### Delete child — guarded  (`DeleteChildSheet`, `jotla-app.jsx`)
In the Edit-child **Danger zone**, "Delete this child" opens a **two-stage, guarded** flow (hidden entirely when only one record remains — the last child can't be deleted):
- **Stage 1 — warning:** shield icon, "Delete {name}'s record?", a red-bordered **consequences list** (exact counts: "{N} logged moments", "{N} saved documents", "{name}'s profile"), and the line that it is permanent and unrecoverable because nothing leaves the phone. A blue **"Back up first"** panel with a **Back up {name}'s record** button that downloads a JSON of `{ child, entries, documents }` (re-savable; shows a saved confirmation). CTAs: **Continue to delete** (red) / **Keep this record**.
- **Stage 2 — last check:** notes whether a backup was made; requires **both** ticking "I understand this permanently deletes…" **and** typing **DELETE** before the red **"Delete {name}'s record permanently"** enables. Confirm calls `nav.deleteChild(id)` — removes that child's entries, docs and config, drops it from `customProfiles` (or adds to `deletedIds` for a seed child), switches to the first remaining child, and returns to Today.

---

## Shared components

- **`EntryCard`** (`jotla-ui.jsx`) — the core list row. Card (`.j-card`, radius 16, 1px `--line` border, soft shadow), padding 16. **Layout: a two-column flex (`align-items: flex-start`, `gap:12`).**
  - **Left column** (fixed, `min-width:46px`, `flex-shrink:0`): the **time** (`clock` or `time`, Outfit 600 16px `--ink`) and, when `showDate`, a short date below it (`.j-meta`).
  - **Right column** (`flex:1`): a top row of the **mood dot** (`MoodDot`, 13px) + tag chips (`.j-tag-grey` setting, `.j-tag-blue` category, optional "Gate note" tag for handovers), then the **summary** paragraph (16.5px, line-height 1.4) **below the chips**, and any photo attachment.
  - **Critical layout note:** the summary text is **aligned to the mood-dot column, not under the time.** The time stands alone on the left; everything else (chips + summary) shares the indented right column, so the summary's left edge lines up with the mood dot. Do not let the summary run full-width under the time.
- **`PushHeader`** — sticky top bar for pushed screens: optional 44px back chip (chevron-left) and/or close chip, title (Cal Sans 19px) + optional subtitle.
- **`MoodDot`** — solid circle; colours `good #27AE60`, `ok #F39C12`, `hard #E74C3C`, `none #CBD5E1`.
- **`Face`** (`jotla-illustrations.jsx`) — round line-art face. Mood→expression: `good→happy` (smile `M32 60 Q50 80 68 60`), `ok→neutral` (flat `M35 66 H65`), `hard→sad`, plus `worried`/`angry` for child mode. Stroke 6 on a 0–128 viewbox.
- **`ChipGroup` / `.j-chip`** — pill toggle, 44px min-height, radius 14, 1.5px border; selected = `.j-chip-on` (blue tint/border/text) or `.j-chip-on-green`.
- **`SectionLabel`** — uppercase 13px `--faint` section heading, optional right-aligned action.
- **`ActionTile`, `MiniMonthStrip`, `MoodFacePicker`, `Stepper`, `PhaseField`, `DateRangeControl`** — described under their screens.
- **`Icon`** (`jotla-icons.jsx`) — single-weight 24×24 line icons, round caps. Names used: today, calendar, search, doc, settings, plus, camera, video, play, attach, clock, chevron{Left,Right,Down}, check, close, lock, shield, filter, sparkle, arrow{Left,Right}, hand, edit, download, heart, leaf, note, bell, star.

---

## Interactions & Behavior
- **Navigation:** tab bar switches top-level tabs (resets history). `nav.go(name, params)` pushes a screen (records history); the back chip pops; close returns to the previous view. Replace with the platform's real navigation.
- **Screen transition:** new screens fade up 6px over 0.28s (`jFadeIn`); disabled under `prefers-reduced-motion`.
- **Bottom sheets:** slide up over a scrim, 0.26s `cubic-bezier(.2,.8,.2,1)`.
- **Press feedback:** tappables scale to ~0.94–0.99 on `:active` (`.j-press`, `.j-chip:active`, etc.).
- **Profile switch:** picking a child resets to Today and re-scopes all entries/docs to that `childId`.
- **Dark mode:** toggled in Settings; flips the entire token set (`.j-dark`).
- **Quick log date logic:** Today / Yesterday / Another-day(date input) → resolved ISO date for the entry; "Saving to {long date}" caption confirms it.
- **Media:** Capture = camera/record; Attach = library pick; both accept image **or** video; recorded video plays back and persists. (Mocked here — implement with the platform camera/photo APIs.)

## State Management
Per the active child (`profileId`), the app holds:
- `entries[]` — all moments (see data model). Scoped by `childId`, sorted newest-first.
- `docs[]` — document vault items.
- `prefs` — `{ dark, profileId, plus, childCfg, customProfiles, deletedIds }`, where `plus` is the global Plus flag, `childCfg` is a map of per-child overrides (`{ [id]: { name, school, year, glyph, figure, photo } }`), `customProfiles` are parent-added children, and `deletedIds` are seed children that have been deleted. The visible profile list is `[...J.PROFILES, ...customProfiles]` minus `deletedIds`, each merged with its `childCfg` override.
- Navigation — `{ view, history[], tab }`.
Adding an entry/doc prepends it (stamped with the active `childId`). All persisted to `localStorage` (`jotla_entries_v3`, `jotla_docs_v1`, `jotla_prefs_v1`, `jotla_nav_v2`) in the prototype — swap for the platform's store/DB and real auth/sync. Photos are stored inline as data URLs in `childCfg`/`customProfiles`; on platform store them in your asset/file store instead.

### Data model — entry
```
{
  id, childId,
  date: 'YYYY-MM-DD',
  time: 'Morning'|'Afternoon'|'Evening',
  clock: 'HH:MM',
  setting: 'School'|'Nursery'|'Home'|'Club',
  category: 'Mornings'|'Eating'|'Play'|'Transitions'|'Lunch hall'|'Other',
  mood: 'good'|'ok'|'hard',
  kind: 'contemporaneous'|'recalled',
  type: 'quick'|'handover',
  summary: string,
  photo?: string,                 // caption of an attached media item
  handover?: { behaviours[], before, during, after, duration, helped }
}
```
### Data model — document
```
{ id, childId, title, type, from, received:'YYYY-MM-DD', about, action, mood }
```
Reference lists (`SETTINGS`, `TIMES`, `CATEGORIES`, `BEHAVIOURS`, `MOODS`, `FIND_THEMES`, …), the seed entries/docs, and date helpers (`parseISO`, `fmtLong`, `fmtShort`, `dayMood`) all live in `source/jotla/jotla-data.jsx`.

---

## Design Tokens

### Colour — light (default)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F7F9FC` | app background (warm off-white) |
| `--card` | `#ffffff` | cards, sheets, inputs |
| `--blue` | `#1A56A8` | primary / brand |
| `--blue-bright` | `#3A7BD4` | |
| `--blue-deep` | `#0f3d7a` | primary pressed |
| `--green` | `#27AE60` | good mood / positive |
| `--green-ink` | `#1e8a4c` | green text |
| `--amber` | `#F39C12` | mixed mood |
| `--red` | `#E74C3C` | hard mood |
| `--red-ink` | `#c0392b` | |
| `--ink` | `#14223b` | headings |
| `--body` | `#334155` | body text |
| `--muted` | `#51607a` | secondary text |
| `--faint` | `#7a8aa3` | meta / inactive |
| `--line` | `#e6ecf5` | borders / dividers |
| `--tint-blue` | `#EAF1FB` | blue soft fill |
| `--tint-green` | `#E7F6EE` | green soft fill |
| `--tint-amber` | `#FCF1DC` | amber soft fill |
| `--tint-red` | `#FCEAE8` | red soft fill |
| `--chip-border` | `#dbe4f1` | chip/input border |
| `--photo-bg` | `#E8EEF7` | media placeholder |
| `--tag-grey-bg/ink` | `#EEF2F8` / `#51607a` | setting tag |
| `--tag-blue-bg/ink` | `#E8F0FB` / `#1A56A8` | category tag |
| `--tabbar-bg` | `rgba(255,255,255,0.92)` | tab bar (blurred) |
| `--header-bg` | `rgba(247,249,252,0.86)` | header (blurred) |
| Child mode bg | `#FFF6EC` | warm cream |

Dark theme: full parallel set under `.j-dark` (bg `#0E1726`, card `#182338`, blue `#5B9BF0`, green `#46C97E`, amber `#F6B450`, red `#F0705F`, ink `#EAF0FA`, etc.) — see `source/jotla/jotla.css`.

### Mood dot colours (fixed, both themes)
good `#27AE60` · ok `#F39C12` · hard `#E74C3C` · none `#CBD5E1`

### Typography
- **Display / headings:** `'Cal Sans'`, weight **500** (brand rule: bold is 500, never 700). Self-hosted TTF.
- **Body / UI:** `'Outfit'`, weights 200 (baseline) / 400 (inputs, meta) / 500 (emphasis, buttons, nav). Self-hosted variable TTF.
- Fallback stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

| Style | Family | Size / line-height / weight |
|---|---|---|
| `j-h1` | Cal Sans | 30px / 1.08 / 500, ls −0.01em |
| `j-h2` | Cal Sans | 22px / 1.12 / 500 |
| `j-h3` | Cal Sans | 18px / 1.15 / 500 |
| `j-body` | Outfit | 16px / 1.45 / 400 |
| `j-sm` | Outfit | 14px / 1.4 |
| `j-meta` | Outfit | 13px / 400, `--faint` |
| `j-eyebrow` | Outfit | 13px / 500, uppercase, ls 0.08em, `--blue` |
| Entry time | Outfit | 16px / 600 |
| Entry summary | Outfit | 16.5px / 1.4 |
| Tab label | Outfit | 11px / 500 |
| Button | Outfit | 17px / 500 (lg 18px) |
| Chip | Outfit | 15px / 500 |
| Tag | Outfit | 13.5px / 500 |

### Radii
inputs/chips 14px · cards/tiles 16px · buttons 18px · sheet 24px (top corners) · sheet grab/pills/tags 999px · FAB & avatar 50%.

### Shadows
- Card: `0 8px 22px -16px rgba(20,40,80,0.35)`
- Primary button: `0 10px 22px -10px rgba(26,86,168,0.6)`
- Log FAB: `0 10px 22px -8px rgba(26,86,168,0.7)`
- Sheet: `0 -14px 40px -18px rgba(0,0,0,0.4)`

### Spacing / sizing
Screen horizontal padding 20px · section gap 22px (forms) · min tap target 44px (chips, icon buttons, avatar) · FAB 56px · header padding `6px 18px` · tab bar padding `8px 8px 40px` (use safe-area inset on device).

### Motion
- Screen fade-in 0.28s ease (6px rise) · sheet up 0.26s cubic-bezier(.2,.8,.2,1) · press scale 0.12s ease. All decorative motion off under `prefers-reduced-motion`.

---

## Assets
- **Fonts** (self-hosted, in `source/fonts/`): `CalSans-Regular.ttf`, `Outfit-VariableFont_wght.ttf`. These are the locked brand fonts — use the equivalents from your codebase's brand/font system if it has them.
- **App icons:** `source/jotla/jotla-icon-180.png` (apple-touch-icon + favicon), `jotla-icon-192.png` and `jotla-icon-512.png` (PWA/home-screen icons in `jotla.webmanifest`). All three are the flat two-tone open-journal emblem on a #1A56A8 tile.
- **UI icons & face illustrations** are inline SVG (`jotla-icons.jsx`, `jotla-illustrations.jsx`) — re-draw with your icon library or port the paths.
- No photographic assets; media tiles are placeholders for user-supplied photos/videos.

## Screenshots  (in `screenshots/`)
Reference renders of the key screens (captured in the preview iOS bezel — the bezel is preview chrome, not part of the app). A few screens that scroll show their upper portion; pair them with the layout notes above.
| File | Screen |
|---|---|
| `01-today.png` | Today (home) — action tiles, month strip, today's logs, "Add to today" |
| `02-quick-log.png` | Quick log — Which day? / Where? / When? (incl. Evening) / kind / textarea + Save |
| `03-handover.png` | Handover note — context pills, "Ask the teacher", behaviour chips |
| `04-month.png` | Month — calendar coloured by day mood + legend |
| `05-find.png` | Find — search + Themes / Mood / Where / When filters |
| `06-settings.png` | Settings — profile, privacy card, dark-mode toggle, export |
| `07-documents.png` | Documents / Evidence vault |
| `08-child-mode.png` | Child mode — warm scene + emotion picker |
| `09-entry-detail.png` | Entry detail — single moment read-back |
| `10-today-empty.png` | Today empty state (new blank child) — "A fresh, blank record" card + friendly smiley `Face` |
| `11-tiers-free.png` | Jotla Plus / Tiers — **Free** page (flat blue, "Free, forever") |
| `12-tiers-plus.png` | Tiers — **Plus** page tab selected, "Get Jotla Plus, £39" CTA (purple) |
| `13-confirm-switch-plus.png` | "You are about to switch to Jotla Plus" confirm sheet (Confirm / Cancel) |
| `14-header-plus.png` | Header with the gradient "**plus**" lockup active (Today screen, Plus mode) |
| `15-add-child.png` | Add a child — blank-record onboarding (name filled, "Create Leo's record") |
| `16-photo-cropper.png` | "Position the photo" crop adjuster — circular preview + zoom slider (sample image) |
| `17-app-tour.png` | App tour — step 1 of 8 ("Welcome to Jotla") |
| `18-edit-child.png` | Edit child sheet — photo, 10 avatars, 12 colours, name/school |
| `19-delete-warning.png` | Delete child — stage 1 warning (consequences + "Back up first") |
| `20-delete-confirm.png` | Delete child — stage 2 "Last check" (tick + type DELETE, armed) |

## Files  (in `source/`)
| File | Contains |
|---|---|
| `jotla/Jotla.html` | entry point + script load order |
| `jotla/jotla-app.jsx` | shell: router, `AppHeader` (+ gradient "plus"), `TabBar`, `ProfileSheet`, **`ChildOptionsSheet` (edit child, photo+crop), `DeleteChildSheet` (guarded delete)**, `nav.addChild`/`deleteChild`/`buyPlus`/`dropPlus`, persistence, device/scaling stage |
| `jotla/jotla-onboard.jsx` | **`AddChildScreen` (blank-record onboarding), `TourScreen` (8-step app tour)** |
| `jotla/jotla-parent-a.jsx` | **Today** (+ blank first-run state), **Quick log**, **Handover**, `MediaPicker`, `MoodFacePicker`, `ChipGroup`, `ActionTile`, `Stepper`, `PhaseField` |
| `jotla/jotla-parent-b.jsx` | **Find**, **Documents/Evidence**, **Add document**, **Document detail**, **Jotla Plus / Tiers (`UnlockScreen`) + switch-up/switch-down confirm sheets**, **Settings** |
| `jotla/jotla-month.jsx` | **Month**, **Day detail**, **Entry detail** |
| `jotla/jotla-child.jsx` | **Child mode** |
| `jotla/jotla-ui.jsx` | `EntryCard`, `PushHeader`, `SectionLabel`, `MiniMonthStrip`, `PhotoAttachment`, `DateRangeControl`, date-range helpers |
| `jotla/jotla-icons.jsx` | line-icon set (`Icon`) |
| `jotla/jotla-illustrations.jsx` | `Face`, `MoodDot`, mood colours, `Wordmark` (+ "plus"), **`ChildAvatar` (glyph/photo), `PhotoCropper`, `fileToDataURL`** |
| `jotla/jotla-data.jsx` | all data, reference lists, seed content, date helpers (`window.JOTLA`) |
| `jotla/jotla.css` | all app styling + tokens (light + dark) |
| `jotla/ios-frame.jsx` | **preview-only** iOS bezel — not part of the app |
| `styles.css`, `colors_and_type.css` | SEN Help design-system root (brand tokens + `@font-face`) that the app layers on |
| `fonts/` | the two brand TTFs |

To run the reference: open `source/jotla/Jotla.html` in a browser.
