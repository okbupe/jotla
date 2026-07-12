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
  ok('footer shows the bumped build', (await page.locator('#root').innerText()).includes('Test build 1.9.1'));
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

  // ---- 8. build 1.9.0 (12 Jul native parity), free tier ----
  console.log('Suite 8: 12 Jul parity, free tier');
  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page4 = await ctx4.newPage();
  const errors4 = [];
  page4.on('pageerror', e => errors4.push(String(e)));
  await page4.goto(URL_APP, { waitUntil: 'networkidle' });
  await page4.waitForTimeout(1200);

  // five-bar This month strip: Gate + Dysregulation join the mood trio
  const todayText = await page4.locator('#root').innerText();
  ok('Today strip carries the Gate bar', todayText.includes('Gate'));
  ok('Today strip carries the Dysregulation bar', todayText.includes('Dysregulation'));

  // month view: visible month chevrons, fixed-height flash-free paging,
  // any past day tappable, and the Day view offering "Add a note"
  await page4.getByText('Month', { exact: true }).last().click();
  await page4.waitForTimeout(500);
  const prevBtn = page4.locator('button[aria-label="Previous month"]');
  ok('month view grows prev/next controls', await prevBtn.count() === 1 && await prevBtn.isEnabled());
  const gridBox1 = await page4.locator('.j-pager').first().boundingBox();
  await prevBtn.click();
  await page4.waitForTimeout(700);
  const gridBox2 = await page4.locator('.j-pager').first().boundingBox();
  ok('calendar keeps one fixed height across months (' + Math.round(gridBox1.height) + 'px)',
    !!gridBox1 && !!gridBox2 && Math.abs(gridBox1.height - gridBox2.height) < 1);
  await prevBtn.click();
  await page4.waitForTimeout(700);
  const emptyDay = page4.locator('button[aria-label$="no note"]').first();
  ok('an empty past day is tappable', await emptyDay.count() > 0 && await emptyDay.isEnabled());
  await emptyDay.click();
  await page4.waitForTimeout(500);
  const dayText = await page4.locator('#root').innerText();
  ok('empty Day view shows the calm invitation', dayText.includes('No notes on this day.'));
  await page4.getByText('Add a note', { exact: true }).first().click();
  await page4.waitForTimeout(500);
  const qlPreset = await page4.locator('#root').innerText();
  ok('Add a note lands in Quick log preset to that day', qlPreset.includes('Quick log') && qlPreset.includes('Saving to'));

  // the custom day is picked from a calendar sheet, never typed
  await page4.locator('button.j-chip:has-text("Another day")').first().click();
  await page4.waitForTimeout(250);
  await page4.locator('button[aria-label*="opens a calendar"]').first().click();
  await page4.waitForTimeout(400);
  ok('calendar sheet opens with a full six-week grid', (await page4.locator('.j-sheet button[aria-pressed]').count()) === 42);
  ok('no typed date input remains in Quick log', (await page4.locator('input[type="date"]').count()) === 0);
  await page4.locator('.j-sheet .j-btn-ghost:has-text("Cancel")').click();
  await page4.waitForTimeout(300);
  await page4.locator('button[aria-label="Close"]').first().click();
  await page4.waitForTimeout(400);
  // step back out of the pushed Day view so the tab bar is reachable again
  await page4.locator('button[aria-label="Back"]').first().click();
  await page4.waitForTimeout(400);

  // adding media is Plus-gated on the free tier (viewing never gates)
  await page4.getByText('Log', { exact: true }).last().click();
  await page4.waitForTimeout(500);
  const qlFree = await page4.locator('#root').innerText();
  ok('free Quick log shows the honest locked media card', qlFree.includes('Add photos and videos') && qlFree.includes('Part of Plus'));
  ok('free Quick log has no live media tiles', !qlFree.includes('Attach media'));
  await page4.locator('button[aria-label="Close"]').first().click();
  await page4.waitForTimeout(400);

  // settings info sheets became full pushed pages, About drops the fonts line
  await page4.getByText('Settings', { exact: true }).last().click();
  await page4.waitForTimeout(450);
  await page4.getByText('What Jotla is for', { exact: true }).first().click();
  await page4.waitForTimeout(500);
  const missionText = await page4.locator('#root').innerText();
  ok('mission opens as a full page with the whole story', missionText.includes('The tool parents are told to need'));
  await page4.locator('button[aria-label="Back"]').first().click();
  await page4.waitForTimeout(400);
  await page4.getByText('About Jotla', { exact: true }).first().click();
  await page4.waitForTimeout(500);
  const aboutText = await page4.locator('#root').innerText();
  ok('About carries the live build number', aboutText.includes('Early test build 1.9.1'));
  ok('About drops the fonts credit line', !aboutText.includes('Typefaces'));
  ok('no uncaught page errors across suite 8', errors4.length === 0);
  await ctx4.close();

  // ---- 9. build 1.9.0 (12 Jul native parity), Plus tier ----
  console.log('Suite 9: 12 Jul parity, Plus tier');
  const ctx5 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page5 = await ctx5.newPage();
  const errors5 = [];
  page5.on('pageerror', e => errors5.push(String(e)));
  await page5.addInitScript(() => {
    try {
      localStorage.setItem('jotla_prefs_v2', JSON.stringify({
        dark: false, tscale: 1, profileId: 'sam', plus: true, childCfg: {}, customProfiles: [], deletedIds: [],
      }));
    } catch (e) {}
  });
  await page5.goto(URL_APP, { waitUntil: 'networkidle' });
  await page5.waitForTimeout(1200);

  ok('header wordmark wears the +PLUS pill', (await page5.locator('.j-appheader').innerText()).includes('+PLUS'));

  // Plus quick log: the media tiles are live
  await page5.getByText('Log', { exact: true }).last().click();
  await page5.waitForTimeout(500);
  const qlPlus = await page5.locator('#root').innerText();
  ok('Plus Quick log offers Capture and Attach media', qlPlus.includes('Capture') && qlPlus.includes('Attach media'));
  await page5.locator('button[aria-label="Close"]').first().click();
  await page5.waitForTimeout(400);

  // Plus month graph draws all five bars
  await page5.getByText('Month', { exact: true }).last().click();
  await page5.waitForTimeout(500);
  const monthPlus = await page5.locator('#root').innerText();
  ok('Plus month graph shows the five-bar story', /How .+ looked/.test(monthPlus) && monthPlus.includes('Dysregulation') && monthPlus.includes('Gate'));

  // the Plus feature list gains Photos and Videos on Notes
  await page5.getByText('Settings', { exact: true }).last().click();
  await page5.waitForTimeout(450);
  await page5.getByText('Patterns, filters and PDF pack', { exact: false }).first().click();
  await page5.waitForTimeout(600);
  ok('Unlock lists Photos and Videos on Notes', (await page5.locator('#root').innerText()).includes('Photos and Videos on Notes'));
  await page5.locator('button[aria-label="Close"]').first().click();
  await page5.waitForTimeout(400);

  // child mode goes dynamic on Plus: More under Next, question cards
  await page5.getByText('Today', { exact: true }).last().click();
  await page5.waitForTimeout(450);
  await page5.getByText('Your day', { exact: true }).first().click();
  await page5.waitForTimeout(500);
  await page5.getByText('Start', { exact: true }).first().click();
  await page5.waitForTimeout(400);
  await page5.getByText('Next', { exact: true }).first().click();
  await page5.waitForTimeout(400);
  await page5.getByText('Happy', { exact: true }).first().click();
  await page5.waitForTimeout(500);
  ok('a picked face grows the More button on Plus', await page5.getByText('More', { exact: true }).first().isVisible());
  await page5.getByText('More', { exact: true }).first().click();
  await page5.waitForTimeout(500);
  const qCards = await page5.locator('#root').innerText();
  ok('More opens the per-place question cards', qCards.includes('Who was there?'));
  ok('question chips are tappable words', qCards.includes('Teachers') && qCards.includes('Friends'));
  ok('no uncaught page errors across suite 9', errors5.length === 0);
  await ctx5.close();

  // ---- 10. build 1.9.1: the vault can keep the document itself (Plus) ----
  console.log('Suite 10: vault document upload (1.9.1)');
  // free tier: adding the document itself is honestly locked; nothing else changes
  const ctx6 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page6 = await ctx6.newPage();
  const errors6 = [];
  page6.on('pageerror', e => errors6.push(String(e)));
  await page6.goto(URL_APP, { waitUntil: 'networkidle' });
  await page6.waitForTimeout(1200);
  await page6.locator('button[aria-label="Documents"]').click();
  await page6.waitForTimeout(500);
  await page6.getByText('Documents', { exact: true }).first().click();
  await page6.waitForTimeout(400);
  await page6.getByText('Add document').first().click();
  await page6.waitForTimeout(500);
  const addFree = await page6.locator('#root').innerText();
  ok('free Add document shows the locked vault-upload card', addFree.includes('Add the document itself') && addFree.includes('Keep the letter with its details. Part of Plus.'));
  ok('free Add document has no live upload tiles', !addFree.includes('Pick a file'));
  await ctx6.close();

  // Plus tier: live tiles, a real file pick, the mechanical prefill, the
  // paperclip count and the honest open row
  const ctx7 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page7 = await ctx7.newPage();
  const errors7 = [];
  page7.on('pageerror', e => errors7.push(String(e)));
  await page7.addInitScript(() => {
    try {
      localStorage.setItem('jotla_prefs_v2', JSON.stringify({
        dark: false, tscale: 1, profileId: 'sam', plus: true, childCfg: {}, customProfiles: [], deletedIds: [],
      }));
    } catch (e) {}
  });
  await page7.goto(URL_APP, { waitUntil: 'networkidle' });
  await page7.waitForTimeout(1200);
  await page7.locator('button[aria-label="Documents"]').click();
  await page7.waitForTimeout(500);
  await page7.getByText('Documents', { exact: true }).first().click();
  await page7.waitForTimeout(400);
  await page7.getByText('Add document').first().click();
  await page7.waitForTimeout(500);
  const addPlus = await page7.locator('#root').innerText();
  ok('Plus Add document offers the live upload tiles', addPlus.includes('Capture') && addPlus.includes('Pick a file'));
  ok('Plus Add document never shows the locked card', !addPlus.includes('Part of Plus.'));

  // a real file pick with a real past modified date drives the mechanical prefill
  await page7.evaluate(() => {
    const input = Array.from(document.querySelectorAll('input[type="file"]')).find(i => (i.accept || '').includes('application/pdf'));
    const f = new File([new Uint8Array([37, 80, 68, 70, 10])], 'EHC-plan-draft.v2.pdf', { type: 'application/pdf', lastModified: Date.now() - 40 * 86400000 });
    const dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page7.waitForTimeout(600);
  const titleVal = await page7.locator('input[placeholder^="Give it a name"]').inputValue();
  ok('title prefills mechanically from the file name (' + titleVal + ')', titleVal === 'EHC plan draft v2');
  const addPicked = await page7.locator('#root').innerText();
  ok('title prefill carries its honesty hint', addPicked.includes('Filled from the file name. Check it matches the letter.'));
  ok("date prefills from the file's own past date, with its hint", addPicked.includes("Filled from the file's own date. Check it matches the letter."));
  ok('the pending file tile shows the original filename', addPicked.includes('EHC-plan-draft.v2.pdf'));

  // the parent's own typing always wins and retires the hint
  await page7.locator('input[placeholder^="Give it a name"]').fill('Draft EHC plan, our copy');
  await page7.waitForTimeout(250);
  ok('typing retires the title hint', !(await page7.locator('#root').innerText()).includes('Filled from the file name'));

  await page7.getByText('Save document').click();
  await page7.waitForTimeout(700);
  const listText = await page7.locator('#root').innerText();
  ok('the saved doc lands back on the Documents list', listText.includes('Draft EHC plan, our copy'));
  ok('the doc row carries the paperclip count', (await page7.locator('[aria-label="1 attached"]').count()) >= 1);
  await page7.getByText('Draft EHC plan, our copy').first().click();
  await page7.waitForTimeout(500);
  const docText = await page7.locator('#root').innerText();
  ok('the document page shows the kept file with a live open row', docText.includes('EHC-plan-draft.v2.pdf') && docText.includes('Tap to open'));
  ok('no uncaught page errors across suite 10', errors6.length === 0 && errors7.length === 0);
  await ctx7.close();

  await browser.close();
  server.kill();
  console.log('\n' + passed + '/' + (passed + failed) + ' checks green' + (failed ? ' - ' + failed + ' FAILED' : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Suite crashed:', e); process.exit(2); });
