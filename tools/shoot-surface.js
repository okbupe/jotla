/* Look at the running app, rather than reading its source.
 *
 * WHY THIS EXISTS. Bupe's instruction of 18 August 2026, after holding the
 * native build next to this one on his phone: "go page for page on the GitHub
 * version so you see how it looks like and the code behind how it functions so
 * you can create it in the native app". Distilling the native port from this
 * repo's SOURCE got every number right and the feel wrong: it shipped a folded
 * week that sometimes drew no dates at all, and a fold he described as 20fps.
 * Reading source is not the same as using the app, and only one of them finds
 * an empty row.
 *
 * So this serves the prototype, seeds a Plus record, drives to a named surface
 * and writes: a screenshot at each step, the surface's own text, and the
 * computed styles of everything on it. The port then reads real pixels and real
 * resolved values instead of guessing from a stylesheet.
 *
 * Usage:
 *   node tools/shoot-surface.js                 list the surfaces
 *   node tools/shoot-surface.js find            shoot one
 *   node tools/shoot-surface.js find --dark     shoot it in dark mode
 *
 * Output lands in %TEMP%/jotla-shots/<surface>/ (or $TMPDIR on unix).
 * This is a dev tool. It never touches the app source and writes nothing into
 * the repo.
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8894;
const URL_APP = `http://127.0.0.1:${PORT}/design-handoff/source/jotla/index.html`;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf',
};

// Each surface says how to reach itself from a cold boot. `steps` run in order;
// a shot is taken after each one, so the sequence is the record.
const SURFACES = {
  today: { steps: [] },
  month: { steps: [{ tab: 'Month' }, { scrollInto: '.j-daysec' }] },
  find: {
    steps: [{ tab: 'Find' }, { click: '.j-findbar', label: 'drawer open' }],
    styles: '[class*="j-find"], [class*="j-chip"], [class*="j-btn"]',
  },
  documents: { steps: [{ tab: 'Documents' }] },
  settings: { steps: [{ tab: 'Menu' }, { clickText: 'App settings' }] },
  note: { steps: [{ tab: 'Month' }, { click: '.j-card:not(.j-cal)', nth: 2 }] },
  editnote: {
    steps: [{ tab: 'Month' }, { click: '.j-card:not(.j-cal)', nth: 2 }, { clickText: 'Edit' }],
    styles: '.j-sheet *[class]',
  },
  paywall: { steps: [{ tab: 'Menu' }, { clickText: 'Plus' }] },
};

const surface = process.argv[2];
const dark = process.argv.includes('--dark');

if (!surface || !SURFACES[surface]) {
  console.log('Surfaces: ' + Object.keys(SURFACES).join(', '));
  console.log('Usage: node tools/shoot-surface.js <surface> [--dark]');
  process.exit(surface ? 1 : 0);
}

const OUT = path.join(os.tmpdir(), 'jotla-shots', surface + (dark ? '-dark' : ''));
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end('no');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

// Plus on, the one-time dial tip already learnt, so neither gets in the way of
// the surface being looked at.
function seed(isDark) {
  localStorage.setItem(
    'jotla_prefs_v2',
    JSON.stringify({ dark: isDark, plus: true, childCfg: {}, customProfiles: [], deletedIds: [] })
  );
  localStorage.setItem('jotla_fabtip_v1', 'learned');
}

(async () => {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  require('./precompile.js').run();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  PAGEERROR ' + e));
  await page.addInitScript(seed, dark);
  await page.goto(URL_APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  const spec = SURFACES[surface];
  let n = 0;
  const shot = async (name) => {
    const file = path.join(OUT, `${String(++n).padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: file });
    console.log('  ' + path.basename(file));
  };
  await shot('boot');

  for (const step of spec.steps) {
    if (step.tab) await page.getByText(step.tab, { exact: true }).first().click();
    if (step.click) {
      const loc = page.locator(step.click);
      await (typeof step.nth === 'number' ? loc.nth(step.nth) : loc.first()).click();
    }
    if (step.clickText) await page.getByText(step.clickText, { exact: true }).last().click();
    if (step.scrollInto) {
      await page.locator(step.scrollInto).first().scrollIntoViewIfNeeded().catch(() => {});
    }
    await page.waitForTimeout(900);
    await shot((step.label || step.tab || step.clickText || step.click || 'step').replace(/[^\w]+/g, '-'));
  }

  // The words on the surface, so copy can be ported character for character
  // rather than retyped from a screenshot.
  fs.writeFileSync(
    path.join(OUT, 'text.txt'),
    await page.evaluate(() => document.querySelector('#root').innerText)
  );

  // Every j- class present, and the resolved styles of the ones that matter, so
  // the port reads real values instead of chasing CSS variables by hand.
  const sel = spec.styles || '[class^="j-"], [class*=" j-"]';
  fs.writeFileSync(
    path.join(OUT, 'styles.txt'),
    await page.evaluate((s) => {
      const seen = new Set();
      const out = [];
      document.querySelectorAll(s).forEach((e) => {
        const cls = String(e.className);
        if (!cls || seen.has(cls)) return;
        seen.add(cls);
        const c = getComputedStyle(e);
        const box = e.getBoundingClientRect();
        out.push(
          `${cls}\n  font ${c.fontSize}/${c.lineHeight} w${c.fontWeight} ${c.fontFamily.split(',')[0]}` +
            `\n  colour ${c.color} on ${c.backgroundColor}` +
            `\n  border ${c.borderWidth} ${c.borderStyle} ${c.borderColor}, radius ${c.borderRadius}` +
            `\n  pad ${c.padding}, margin ${c.margin}, gap ${c.gap}` +
            `\n  box ${Math.round(box.width)}x${Math.round(box.height)}`
        );
      });
      return out.join('\n\n');
    }, sel)
  );

  await browser.close();
  server.close();
  console.log('DONE -> ' + OUT);
})().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
