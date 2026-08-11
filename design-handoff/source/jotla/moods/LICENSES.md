# Emoji pack artwork licences

Two packs bundle unmodified emoji artwork from openly licensed sets (resized only). The third is ours. Current roster (v4, 2026-08-11: Bold is the free default, Sticker and Corgi are the Plus looks):

| Pack folder | Set | Source | Licence |
|---|---|---|---|
| `bold/` | Twemoji | github.com/jdecked/twemoji | Graphics CC BY 4.0 (copyright Twitter, Inc and other contributors) |
| `sticker/` | Microsoft Fluent Emoji (3D) | github.com/microsoft/fluentui-emoji | MIT |
| `corgi/` | Original artwork, drawn for Jotla | generated in-house 2026-08-11 (Higgsfield, nano_banana_2), cut and sized by Vision | SEN Help Network Ltd, no third-party licence, no attribution required |

Files per pack: `happy`, `ok`, `sad`, `worried`, `angry`, mapped to the app's five moods (U+1F60A, U+1F610, U+1F641, U+1F61F, U+1F620).

User-facing attribution lives on the About Jotla page. Downloaded and verified 2026-08-09 (all HTTP 200, none empty).

The Corgi pack is the answer to what the 9 Aug research found: the variety the founder wanted (character packs, not five versions of the same round face) does not exist under an open licence, so original packs are generated instead. One character anchor, one 21:9 sheet holding all five moods, cut into five squares locally and sized by area. Method and prompt: Vision `SEN Help Resources/App/Jotla-Emoji-Pack-Prompts.md`.

History: the 9 Aug v2 roster also bundled Fluent Color/Flat, Google Noto (Apache 2.0), OpenMoji (CC BY-SA 4.0) and two cat packs; all were removed the same day on the founder's call ("all the same kinda") before any release, and their files left the repo with them. Genuinely varied character packs are being selected separately.
