# Jotla, by SEN Help

A calm, parent-owned day-record app for families of children with SEND. You log how the day went (at school, at home, at a club), capture a structured "gate note" at the school pickup, see the shape of the month, search everything back, and store official documents. Over time it builds into a clear, dated record you can use in meetings and assessments.

**Everything stays on the device. No account, no cloud, no ads.**

> This repository holds the **design prototype** and its full handoff spec. It is a reference build, not the finished app. It runs in the browser and stores everything locally on your own phone or computer; nothing you type is sent anywhere.

## For testers (you have been asked to try it)

Thank you for taking a look. A few things to know:

- It opens like a normal web page. On a phone it behaves like an app.
- **Your notes stay on your device only.** Nothing is uploaded, nothing is shared, and you will not break anything. Tap around freely.
- It comes pre-filled with a sample child ("Sam") so the screens are not empty. You can also add your own child to see the blank, first-time experience.
- Some bits are mocked on purpose (taking a photo or video does not really use your camera yet). That is expected at this stage.

### How to open it

- **Live link:** https://okbupe.github.io/jotla/
- **Install it like an app:** open the link, then on iPhone (Safari) tap Share and "Add to Home Screen"; on Android (Chrome) tap the menu and "Install app". It then opens full-screen with its own icon.
- **From the files:** open `design-handoff/source/jotla/Jotla.html` in a browser.

### What we would love your first impressions on

1. Opening it cold, is it obvious what the app is for and what to do first?
2. The everyday log (the big blue **+ Log** button): is it quick and calm enough to use at a stressful moment?
3. The **"At the gate?"** gate note: would this help you capture a hard moment while talking to a teacher?
4. The **Month** view and **Find**: do the patterns feel useful?
5. **Child mode** ("Your day"): would your child engage with it?
6. Anything that felt confusing, slow, or worded oddly.

### How to send feedback

- In the app: **Settings → "Tell us what you think"** opens an email to `hello@sen.help` with a short template.
- Or email **hello@sen.help** directly with the subject "Jotla prototype feedback".

## What is in here

| Path | What it is |
|---|---|
| `index.html` | launcher that opens the prototype |
| `design-handoff/` | the full Claude Design handoff: screenshots, source, and the design spec (`design-handoff/README.md`) |
| `design-handoff/source/jotla/` | the prototype itself (HTML + React reference build) |
| `design-handoff/screenshots/` | reference renders of every key screen |

## Status

This is the design prototype. A production build will follow. See the design spec in `design-handoff/README.md` for the full screen-by-screen reference.
