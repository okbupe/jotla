#!/usr/bin/env node
/* WILL THIS PUBLISH ACTUALLY SERVE WHAT THE APP ASKS FOR?
 *
 * Written 3 September 2026, after the fonts. The web export was correct, the
 * repository was correct to look at, the app worked perfectly on every machine
 * that built it, and the live site rendered every word in the phone's system
 * font. The four Outfit weights were exported to
 * `assets/node_modules/@expo-google-fonts/outfit/...`, the .gitignore carried an
 * ordinary unanchored `node_modules/`, and git dropped all four without a word.
 * Nothing in the repo looked wrong, because nothing in the repo WAS wrong: the
 * files were on disk. They were simply never committed, so they were never
 * deployed, so every request for them 404'd.
 *
 * The lesson is narrow and worth a script: a publish is not what is in the
 * folder, it is what git will carry. Anything served from disk while testing is
 * a lie the moment it is ignored or untracked.
 *
 * So this reads the built bundle, pulls out every asset URL it references, and
 * asks git whether that file is going to exist on the live site. It exits
 * non-zero if any will not. Run it before every publish:
 *
 *     node tools/check-deploy.mjs
 *
 * It is deliberately dumb: no config, no allowlist, no network. A URL the
 * bundle names must be a file `git ls-files` reports. That is the whole rule.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Every path git will actually carry, as a set of repo-relative strings. */
function trackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, maxBuffer: 1 << 28 });
  return new Set(out.toString('utf8').split('\0').filter(Boolean));
}

/** Every .js file the export ships, wherever it put them. */
function bundleFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) bundleFiles(p, acc);
    else if (e.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}

/* Metro emits asset URLs as whole string literals, already carrying the site's
 * base path: "/jotla/assets/assets/fonts/CalSans-Regular.<hash>.ttf". Matching
 * the literal rather than reconstructing a path keeps this honest about what
 * the browser will really request. */
const ASSET_URL = /"(\/[^"]*?\/assets\/[^"]+?\.[a-z0-9]{2,5})"/gi;

const tracked = trackedFiles();
const jsDir = join(ROOT, '_expo');
let bundles;
try {
  bundles = bundleFiles(jsDir);
} catch {
  console.error(`check-deploy: no _expo/ directory at ${ROOT}. Export first.`);
  process.exit(2);
}

const referenced = new Map(); // repo-relative path -> the URL that named it
for (const file of bundles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(ASSET_URL)) {
    const url = m[1];
    // Strip the leading base path segment ("/jotla/") to get a repo path.
    const repoPath = url.replace(/^\/[^/]+\//, '');
    if (!referenced.has(repoPath)) referenced.set(repoPath, url);
  }
}

const missing = [];
for (const [repoPath, url] of referenced) {
  if (tracked.has(repoPath)) continue;
  let onDisk = false;
  try {
    onDisk = statSync(join(ROOT, repoPath)).isFile();
  } catch {
    onDisk = false;
  }
  missing.push({ repoPath, url, onDisk });
}

console.log(`check-deploy: ${referenced.size} asset URLs referenced by the bundle`);
if (!missing.length) {
  console.log('check-deploy: every one of them is tracked. Safe to publish.');
  process.exit(0);
}

console.error(`\ncheck-deploy: ${missing.length} WILL 404 ON THE LIVE SITE\n`);
for (const m of missing) {
  const why = m.onDisk
    ? 'on disk but NOT tracked by git (ignored, or never added)'
    : 'not on disk at all';
  console.error(`  ${m.url}\n      ${why}`);
}
console.error(
  '\nThe file being present locally proves nothing: a dev server reads the disk,' +
    '\nthe live site reads the commit. Fix the ignore rule or `git add` the files,' +
    '\nthen run this again.'
);
process.exit(1);
