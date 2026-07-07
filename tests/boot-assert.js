/* Jotla boot-and-assert: real rendered screens, per the master prompt's iron rule.
   Run from the repo root:  npm i playwright && node tests/boot-assert.js
   (Chromium via Playwright; serves the repo on :8890 itself.) */
const { chromium } = require('playwright');
const { spawn } = require('child_process');

const ROOT = require('path').resolve(__dirname, '..');
// The shipped entry runs the precompiled bundle; rebuild it before every run so
// the suite always tests the sources as they stand (build 1.8.0).
require('../tools/precompile.js').run();
const URL_APP = 'http://127.0.0.1:8890/design-handoff/source/jotla/index.html';
let passed = 0, failed = 0;
function ok(name, cond) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name); }
}

(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8890', '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch(process.env.JOTLA_CHROMIUM ? { executablePath: process.env.JOTLA_CHROMIUM } : {});

  // ---- 1. clean boot, app mode (phone viewport) ----
  console.log('Suite 1: clean boot');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(URL_APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  ok('app boots with content', (await page.locator('#root').innerText()).length > 40);
  ok('tab bar shows Today/Month/Find/Settings', await page.getByText('Month', { exact: true }).first().isVisible()
    && await page.getByText('Settings', { exact: true }).first().isVisible());
  ok('no uncaught page errors on boot', errors.length === 0);

  // ---- 2. tabs render ----
  console.log('Suite 2: tab screens');
  for (const tab of ['Month', 'Find', 'Settings']) {
    await page.getByText(tab, { exact: true }).last().click();
    await page.waitForTimeout(450);
    ok(tab + ' renders', (await page.locator('#root').innerText()).length > 40);
  }

  // ---- 3. backup health surface (we are on Settings) ----
  console.log('Suite 3: backup health');
  const settingsText = await page.locator('#root').innerText();
  ok('backup card present', /backup and export/i.test(settingsText));
  ok('health line: no copy yet', settingsText.includes('No saved copy from this app yet'));
  ok('gentle nudge shows when due', settingsText.includes('good insurance'));
  await page.getByText('Export my data', { exact: false }).first().click();
  await page.waitForTimeout(600);
  const afterExport = await page.locator('#root').innerText();
  ok('health line flips to today after export', afterExport.includes('Last saved copy: today'));
  const persisted = await page.evaluate(() => localStorage.getItem('jotla_backup_v1') || '');
  ok('lastExportAt persisted', persisted.includes('lastExportAt'));
  ok('dark mode toggle is a labelled switch', (await page.locator('[role="switch"][aria-label="Dark mode"]').count()) === 1);

  // ---- 4. screen boundary: crash keeps header + tabs alive (from Settings, tab bar visible) ----
  console.log('Suite 4: screen boundary');
  await page.evaluate(() => { window.__JOTLA_TEST_THROW = 1; });
  await page.getByText('Today', { exact: true }).last().click();
  await page.waitForTimeout(500);
  const crashed = await page.locator('#root').innerText();
  ok('calm fallback shown', crashed.includes('This screen hit a problem'));
  ok('reassurance copy present', crashed.includes('Your record is safe on this device'));
  ok('tab bar survives the crash', await page.getByText('Settings', { exact: true }).last().isVisible());
  await page.evaluate(() => { window.__JOTLA_TEST_THROW = 0; });
  await page.getByText('Month', { exact: true }).last().click();
  await page.waitForTimeout(450);
  ok('app recovers on next navigation', !(await page.locator('#root').innerText()).includes('hit a problem'));

  // ---- 5. accessibility: quick log chips ----
  console.log('Suite 5: chip accessibility');
  await page.getByText('Log', { exact: true }).last().click();
  await page.waitForTimeout(500);
  const chips = await page.locator('button[aria-pressed]').count();
  ok('quick log chips expose aria-pressed (' + chips + ')', chips >= 5);
  const firstChip = page.locator('button[aria-pressed="false"]').first();
  const chipText = (await firstChip.innerText()).trim();
  await firstChip.click();
  await page.waitForTimeout(250);
  const nowPressed = await page.locator('button[aria-pressed="true"]', { hasText: chipText }).count();
  ok('aria-pressed tracks selection (' + chipText + ')', nowPressed >= 1);

  // ---- 5b. whole-day capture chips (build 1.7.1) + a real save ----
  console.log('Suite 5b: whole-day chips');
  const logText = await page.locator('#root').innerText();
  for (const c of ['School feedback', 'New words', 'Wins']) ok('chip present: ' + c, logText.includes(c));
  ok('placeholder nudges exact words', await page.locator('textarea[placeholder*="exact words"]').count() >= 1);
  await page.locator('button.j-chip:has-text("Today")').first().click(); // suite 5 toggled "Yesterday"; save to today
  await page.getByText('Wins', { exact: true }).first().click();
  await page.locator('textarea').first().fill('Boot-assert win: tried a new food at dinner');
  await page.getByText('Save', { exact: true }).last().click();
  await page.waitForTimeout(700);
  await page.getByText('Today', { exact: true }).last().click();
  await page.waitForTimeout(500);
  ok('saved Wins entry appears on Today', (await page.locator('#root').innerText()).includes('Boot-assert win: tried a new food'));
  await page.getByText('Settings', { exact: true }).last().click();
  await page.waitForTimeout(450);
  ok('footer shows the bumped build', (await page.locator('#root').innerText()).includes('Test build 1.8.0'));
  await ctx.close();

  // ---- 6. app boundary: poisoned storage never blanks the app ----
  console.log('Suite 6: app boundary');
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2 = await ctx2.newPage();
  await page2.addInitScript(() => { try { localStorage.setItem('jotla_entries_v4', '{"poisoned":true}'); } catch (e) {} });
  await page2.goto(URL_APP, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1200);
  const t2 = await page2.locator('#root').innerText();
  ok('poisoned storage: not a blank page', t2.trim().length > 20);
  ok('last-resort fallback with safe-record copy', t2.includes('Jotla hit a problem opening') && t2.includes('still safe'));
  await ctx2.close();

  // ---- 7. build 1.8.0: precompiled bundle, dynamic type, keyboard pagers, illustrated tour ----
  console.log('Suite 7: precompiled bundle + dynamic type + keyboard + illustrations');
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page3 = await ctx3.newPage();
  const errors3 = [];
  page3.on('pageerror', e => errors3.push(String(e)));
  await page3.goto(URL_APP, { waitUntil: 'networkidle' });
  await page3.waitForTimeout(1200);
  ok('precompiled: in-browser Babel is gone', await page3.evaluate(() => typeof window.Babel === 'undefined'));
  ok('precompiled bundle boots clean', errors3.length === 0 && (await page3.locator('#root').innerText()).length > 40);

  // keyboard alternative on the month swipe pager
  await page3.getByText('Month', { exact: true }).last().click();
  await page3.waitForTimeout(500);
  const monthBefore = (await page3.locator('#root').innerText()).slice(0, 400);
  ok('pager is focusable with a described role', await page3.locator('.j-pager[role="group"][tabindex="0"]').count() >= 1);
  await page3.locator('.j-pager').first().focus();
  await page3.keyboard.press('ArrowLeft');
  await page3.waitForTimeout(900);
  const monthAfter = (await page3.locator('#root').innerText()).slice(0, 400);
  ok('ArrowLeft pages the calendar back a month', monthBefore !== monthAfter);

  // dynamic type: three sizes in Settings, applied and persisted
  await page3.getByText('Settings', { exact: true }).last().click();
  await page3.waitForTimeout(450);
  ok('text size offers three labelled choices', (await page3.locator('[role="radio"][aria-label$=" text"]').count()) === 3);
  const h3a = await page3.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.j-h1, .j-h3, .j-body')).fontSize));
  await page3.locator('[role="radio"][aria-label="Extra large text"]').click();
  await page3.waitForTimeout(300);
  const h3b = await page3.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.j-h1, .j-h3, .j-body')).fontSize));
  ok('choosing Extra large actually grows the text (' + h3a + ' -> ' + h3b + ')', h3b > h3a * 1.15);
  await page3.reload({ waitUntil: 'networkidle' });
  await page3.waitForTimeout(1000);
  const persistedScale = await page3.evaluate(() => getComputedStyle(document.querySelector('.jotla-root')).getPropertyValue('--tscale').trim());
  ok('text size persists across a relaunch (--tscale=' + persistedScale + ')', persistedScale === '1.25');
  await page3.locator('[role="radio"][aria-label="Standard text"]').click();
  await page3.waitForTimeout(250);

  // illustrated tour: brand scene SVGs and dots that are real buttons
  await page3.getByText('Take the tour', { exact: false }).first().click();
  await page3.waitForTimeout(600);
  const tourText = await page3.locator('#root').innerText();
  ok('tour opens on Welcome', tourText.includes('Welcome to Jotla'));
  ok('tour shows a scene illustration (not the old icon disc)', (await page3.locator('svg[viewBox="0 0 220 150"]').count()) >= 1);
  await page3.locator('button[aria-label^="Step 2 of"]').click();
  await page3.waitForTimeout(400);
  ok('tour dots are buttons that navigate', (await page3.locator('#root').innerText()).includes('Today is home'));
  ok('step 2 carries its own illustrated scene', (await page3.locator('svg[viewBox="0 0 220 150"]').count()) >= 1);
  await ctx3.close();

  await browser.close();
  server.kill();
  console.log('\n' + passed + '/' + (passed + failed) + ' checks green' + (failed ? ' — ' + failed + ' FAILED' : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Suite crashed:', e); process.exit(2); });
