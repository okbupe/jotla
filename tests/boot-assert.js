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

  // ---- 5. accessibility: the context row and its pickers (build 1.12.0) ----
  // Day / Where / When are three cards; each opens only its own options and
  // blurs the rest, so the chips exist once a question is open.
  console.log('Suite 5: context row + chip accessibility');
  await page.getByText('Log', { exact: true }).last().click();
  await page.waitForTimeout(500);
  const rowText = await page.locator('#root').innerText();
  // the labels read plainly, with no question marks (founder, 16 Jul 2026)
  const rowLabels = await page.locator('button.j-ctx .j-ctx-q').allInnerTexts();
  ok('context row labels read Day / Where / When (' + rowLabels.join(' / ') + ')',
    JSON.stringify(rowLabels.map(s => s.trim())) === JSON.stringify(['Day', 'Where', 'When']));
  ok('the row starts on Today / School / Morning',
    rowText.includes('Today') && rowText.includes('School') && rowText.includes('Morning'));
  ok('the options stay closed until a question is tapped', (await page.locator('button[aria-pressed]').count()) === 0);
  // each question and its answer share ONE tappable card (founder, 16 Jul 2026),
  // question above answer, both centred. A span's box spans the card whatever the
  // alignment, so measure the real text extent.
  const rowGeom = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button.j-ctx[aria-label]'))
      .filter(b => /^(Day|Where|When), /.test(b.getAttribute('aria-label')));
    if (cards.length !== 3) return null;
    const textBox = el => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
    return cards.map(b => {
      const q = b.querySelector('.j-ctx-q'), a = b.querySelector('.j-ctx-a');
      if (!q || !a) return { label: '?', together: false, offset: 999 };
      const qb = textBox(q), ab = textBox(a), cb = b.getBoundingClientRect();
      const centre = (cb.left + cb.right) / 2;
      return {
        label: q.textContent, isCard: b.classList.contains('j-card'),
        together: b.contains(q) && b.contains(a), qAboveA: qb.bottom <= ab.top,
        offset: Math.max(Math.abs((qb.left + qb.right) / 2 - centre), Math.abs((ab.left + ab.right) / 2 - centre)),
      };
    });
  });
  ok('each question and its answer share one tappable card',
    !!rowGeom && rowGeom.every(c => c.together && c.isCard && c.qAboveA));
  ok('question and answer centre in their card (max offset '
    + (rowGeom ? Math.max(...rowGeom.map(c => c.offset)).toFixed(2) : '?') + 'px)',
    !!rowGeom && rowGeom.every(c => c.offset < 2));
  // tinted on the Dysregulation tile's recipe, not left white (founder, 16 Jul 2026)
  const rowInk = await page.evaluate(() => {
    const card = document.querySelector('button.j-ctx');
    const root = getComputedStyle(document.querySelector('.jotla-root'));
    const asRgb = name => { const p = document.createElement('div'); p.style.color = root.getPropertyValue(name).trim();
      document.body.appendChild(p); const v = getComputedStyle(p).color; p.remove(); return v; };
    return { bg: getComputedStyle(card).backgroundColor, tint: asRgb('--tint-blue'), white: asRgb('--card'),
      q: getComputedStyle(card.querySelector('.j-ctx-q')).color, a: getComputedStyle(card.querySelector('.j-ctx-a')).color,
      blue: asRgb('--blue'), muted: asRgb('--muted') };
  });
  ok('the cards rest on the Dysregulation tile tint, not white (' + rowInk.bg + ')',
    rowInk.bg === rowInk.tint && rowInk.bg !== rowInk.white);
  ok('the answer wears the matching ink and the label stays muted',
    rowInk.a === rowInk.blue && rowInk.q === rowInk.muted);
  // tired, often dyslexic parents: a tint must not cost legibility, so both texts
  // still have to clear WCAG AA against the ground they sit on
  const rowContrast = await page.evaluate(() => {
    const lum = c => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(Number).map(v => { v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (x, y) => { const a = lum(x), b = lum(y);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
    const card = document.querySelector('button.j-ctx'), bg = getComputedStyle(card).backgroundColor;
    return { q: ratio(getComputedStyle(card.querySelector('.j-ctx-q')).color, bg),
      a: ratio(getComputedStyle(card.querySelector('.j-ctx-a')).color, bg) };
  });
  ok('both texts clear WCAG AA on the tint (label ' + rowContrast.q.toFixed(2)
    + ':1, answer ' + rowContrast.a.toFixed(2) + ':1)', rowContrast.q >= 4.5 && rowContrast.a >= 4.5);
  await page.locator('button.j-ctx[aria-label^="Where"]').first().click();
  await page.waitForTimeout(350);
  const chips = await page.locator('button[aria-pressed]').count();
  ok('the open picker exposes aria-pressed chips (' + chips + ')', chips >= 4);
  ok('the rest of the screen blurs to focus the question', await page.evaluate(() =>
    Array.from(document.querySelectorAll('div')).some(d => (d.style.filter || '').includes('blur'))));
  const firstChip = page.locator('button[aria-pressed="false"]').first();
  const chipText = (await firstChip.innerText()).trim();
  await firstChip.click(); // picking an answer closes the picker again
  await page.waitForTimeout(350);
  ok('picking an answer closes the picker', (await page.locator('button[aria-pressed]').count()) === 0);
  ok('the picked answer rides the Where card (' + chipText + ')',
    (await page.locator('button.j-ctx[aria-label^="Where"]').first().innerText()).includes(chipText));
  await page.locator('button.j-ctx[aria-label^="Where"]').first().click();
  await page.waitForTimeout(300);
  const nowPressed = await page.locator('button[aria-pressed="true"]', { hasText: chipText }).count();
  ok('aria-pressed tracks selection (' + chipText + ')', nowPressed >= 1);
  await page.locator('button.j-ctx[aria-label^="Where"]').first().click(); // close it again
  await page.waitForTimeout(300);

  // ---- 5b. dynamic day log (build 1.12.0): pill -> moment editor -> bank -> save ----
  console.log('Suite 5b: dynamic day log');
  const logText = await page.locator('#root').innerText();
  for (const c of ['School feedback', 'New words', 'Wins']) ok('chip present: ' + c, logText.includes(c));
  // Save rests as a solid grey button, never a see-through blue one, and only
  // goes primary once there is something worth saving (founder, 16 Jul 2026)
  const saveBtn = page.locator('button.j-btn-lg:has-text("Save")').last();
  const restState = await saveBtn.evaluate(el => {
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, bg: cs.backgroundColor, primary: el.classList.contains('j-btn-primary') };
  });
  ok('an empty Save rests solid, not see-through (' + restState.bg + ' @ ' + restState.opacity + ')',
    restState.opacity === '1' && restState.bg !== 'rgba(0, 0, 0, 0)' && !restState.primary);
  await page.locator('button.j-ctx[aria-label^="Day"]').first().click(); // the day lives behind its own card now
  await page.waitForTimeout(300);
  await page.locator('button.j-chip:has-text("Today")').first().click();
  await page.waitForTimeout(300);
  await page.getByText('Wins', { exact: true }).first().click(); // tap the pill to open its moment editor
  await page.waitForTimeout(300);
  ok('placeholder nudges exact words', await page.locator('textarea[placeholder*="exact words"]').count() >= 1);
  await page.locator('textarea').first().fill('Boot-assert win: tried a new food at dinner');
  await page.getByText('Okay', { exact: true }).first().click(); // bank the moment
  await page.waitForTimeout(300);
  ok('a banked moment lands in the day list', (await page.locator('#root').innerText()).includes('Boot-assert win: tried a new food'));
  ok('Save turns blue once a moment is banked', await saveBtn.evaluate(el => el.classList.contains('j-btn-primary')));
  // a banked moment reopens for changing, and the change sticks
  await page.locator('button[aria-label="Edit the Wins moment"]').first().click();
  await page.waitForTimeout(300);
  ok('tapping a banked moment reopens it filled in',
    (await page.locator('textarea').first().inputValue()).includes('tried a new food'));
  await page.locator('textarea').first().fill('Boot-assert win: tried a new food at dinner, asked for more');
  await page.getByText('Okay', { exact: true }).first().click();
  await page.waitForTimeout(300);
  const afterEdit = await page.locator('#root').innerText();
  ok('the edit replaces the moment rather than adding a second', afterEdit.includes('asked for more')
    && (afterEdit.match(/Boot-assert win/g) || []).length === 1);
  // a second moment in a different part of the day: the two must read back as ONE log
  await page.locator('button.j-ctx[aria-label^="When"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('button.j-chip:has-text("Afternoon")').first().click();
  await page.waitForTimeout(300);
  await page.getByText('Lunch hall', { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.locator('textarea').first().fill('Boot-assert: ate most of his lunch');
  await page.getByText('Okay', { exact: true }).first().click();
  await page.waitForTimeout(300);
  ok('two moments stage together', (await page.locator('#root').innerText()).includes('2 moments ready'));
  // a hard moment rides the same log: Incidents opens the before/during/after box
  await page.getByText('Incidents', { exact: true }).first().click();
  await page.waitForTimeout(300);
  const phaseBoxes = await page.locator('textarea').count();
  ok('Incidents opens the before/during/after box', phaseBoxes === 3);
  await page.locator('textarea').nth(1).fill('Boot-assert: hard moment in the corridor');
  // A hard moment logged here has to ask who was there (founder, 16 Jul 2026); it
  // used to save an empty who, so the question existed only on the guided screen.
  ok('the quick log asks who was there', (await page.locator('#root').innerText()).includes('Who was there?'));
  const whoChip = page.locator('button[aria-pressed="false"]', { hasText: 'TA' }).first();
  ok('who offers tappable chips', await whoChip.count() === 1);
  await whoChip.click();
  await page.waitForTimeout(200);
  ok('a who chip selects', (await page.locator('button[aria-pressed="true"]', { hasText: 'TA' }).count()) === 1);
  await page.getByText('Okay', { exact: true }).first().click();
  await page.waitForTimeout(300);
  ok('three moments stage together', (await page.locator('#root').innerText()).includes('3 moments ready'));
  await page.getByText('Save', { exact: true }).last().click(); // one Save writes every banked moment
  await page.waitForTimeout(700);
  await page.getByText('Today', { exact: true }).last().click();
  await page.waitForTimeout(500);
  const oneLogText = await page.locator('#root').innerText();
  ok('saved Wins entry appears on Today', oneLogText.includes('asked for more'));
  ok('the Save reads back as one log, not scattered cards', oneLogText.includes('3 moments')
    && (await page.locator('.j-card:has-text("3 moments")').count()) === 1);
  // the hard moment wears ONE pill, named Dysregulation, never "Gate note"
  // (founder, 16 Jul 2026)
  ok('a saved hard moment wears the Dysregulation pill', oneLogText.includes('Dysregulation'));
  ok('no gate-note wording survives on a saved moment', !/Gate note/i.test(oneLogText));
  // ...and the who actually reaches the record, not just the screen: an empty
  // handover.who is exactly how this regresses without anyone noticing
  const savedWho = await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem('jotla_entries_v4') || '[]');
    const inc = list.find(e => e.type === 'handover' && /corridor/.test(e.summary || ''));
    return inc && inc.handover ? inc.handover.who : null;
  });
  ok('who was there is saved onto the entry (' + JSON.stringify(savedWho) + ')',
    Array.isArray(savedWho) && savedWho.includes('TA'));
  ok('the log organises its moments by part of day', /morning/i.test(oneLogText) && /afternoon/i.test(oneLogText));
  ok('both moments sit inside the one log', oneLogText.includes('asked for more') && oneLogText.includes('ate most of his lunch'));
  await page.getByText('Settings', { exact: true }).last().click();
  await page.waitForTimeout(450);
  ok('footer shows the bumped build', (await page.locator('#root').innerText()).includes('Test build 1.11.1'));
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

  // Illustrated tour: a real scene, and dots that are real buttons. Two decks are
  // live by design while the generated images are on approval (1.9.0), so this
  // asserts the RULE (a scene is present, not the fallback icon disc) rather than
  // one implementation. Either the SVG scene or the image deck satisfies it.
  const SCENE = 'svg[viewBox="0 0 220 150"], img.j-illo-img';
  await page3.getByText('Take the tour', { exact: false }).first().click();
  await page3.waitForTimeout(600);
  const tourText = await page3.locator('#root').innerText();
  ok('tour opens on Welcome', tourText.includes('Welcome to Jotla'));
  ok('tour shows a scene illustration (not the old icon disc)', (await page3.locator(SCENE).count()) >= 1);
  await page3.locator('button[aria-label^="Step 2 of"]').click();
  await page3.waitForTimeout(400);
  ok('tour dots are buttons that navigate', (await page3.locator('#root').innerText()).includes('Start on Today'));
  ok('step 2 carries its own illustrated scene', (await page3.locator(SCENE).count()) >= 1);

  // A broken <img> still satisfies a count check, so prove pixels actually decoded.
  const illoImgs = await page3.locator('img.j-illo-img').count();
  if (illoImgs > 0) {
    ok('the tour illustration decoded (not a broken image)',
      await page3.locator('img.j-illo-img').first()
        .evaluate((el) => el.complete && el.naturalWidth > 0));
    // The whole deck, not just the slide on screen: a typo'd filename would fall
    // silently back to the SVG scene everywhere else and look deliberate.
    const deck = await page3.evaluate(async () => {
      const out = [];
      for (const [k, src] of Object.entries(window.STORY_IMAGES || {})) {
        try { out.push([k, (await fetch(src, { cache: 'no-store' })).status]); }
        catch { out.push([k, 0]); }
      }
      return out;
    });
    const bad = deck.filter(([, s]) => s !== 200).map(([k]) => k);
    ok(`all ${deck.length} illustration files resolve` + (bad.length ? ` (missing: ${bad.join(', ')})` : ''),
      deck.length === 14 && bad.length === 0);

    // The image must render at its OWN shape. `aspect-ratio: 1/1` in CSS used to
    // force the box square and stretch whatever did not fit, so a stale 3:2 file
    // came out distorted instead of merely wrong (16 Jul: "they also appear
    // squished"). Compare the drawn box to the decoded file, not to a constant.
    const shape = await page3.locator('img.j-illo-img').first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { drawn: r.width / r.height, real: el.naturalWidth / el.naturalHeight };
    });
    ok(`the illustration is not distorted (drawn ${shape.drawn.toFixed(3)} vs file ${shape.real.toFixed(3)})`,
      Math.abs(shape.drawn - shape.real) < 0.02);
    ok(`the illustration deck is square (${shape.real.toFixed(3)})`, Math.abs(shape.real - 1) < 0.02);

    // Every filename carries a content hash. Without it the service worker, which
    // caches webp cache-first and matches with ignoreSearch: true, serves a stale
    // picture forever under a reused name and no query string can bust it.
    const unhashed = Object.entries(await page3.evaluate(() => window.STORY_IMAGES))
      .filter(([, src]) => !/\.[0-9a-f]{8}\.webp$/.test(src)).map(([k]) => k);
    ok('every illustration filename carries a content hash' + (unhashed.length ? ` (bare: ${unhashed.join(', ')})` : ''),
      unhashed.length === 0);
  }

  // Founder, 16 Jul: the heading and description "shifted up and down instead of
  // being the same place" from slide to slide. Cause: the slide centred itself
  // around its own copy length, so a longer body or a two-line title moved
  // everything. Now the block is a constant height (fixed square + reserved title
  // and body), so both land on the same pixel on all eight. Measured on the first
  // LINE BOX via a Range, not the element box: an element-box check passes even
  // when a one-line heading sits half a line low inside a two-line reserve.
  const lineTopOf = (loc) => loc.evaluate((el) => {
    const r = document.createRange(); r.selectNodeContents(el);
    return +r.getClientRects()[0].top.toFixed(1);
  });
  const headY = [], bodyY = [];
  for (let i = 1; i <= 8; i++) {
    await page3.locator(`button[aria-label^="Step ${i} of"]`).click();
    await page3.waitForTimeout(320);
    headY.push(await lineTopOf(page3.locator('.j-illo-title').first()));
    bodyY.push(await lineTopOf(page3.locator('.j-illo-body').first()));
  }
  const spread = (a) => +(Math.max(...a) - Math.min(...a)).toFixed(1);
  ok(`every tour heading starts on the same line (spread ${spread(headY)}px)`, spread(headY) <= 1);
  ok(`every tour description starts on the same line (spread ${spread(bodyY)}px)`, spread(bodyY) <= 1);
  // Walk back to step 2, where this block found the tour: the tier-neutral check
  // below reads the Today slide's copy off the screen.
  await page3.locator('button[aria-label^="Step 2 of"]').click();
  await page3.waitForTimeout(300);

  // Two places count the gate questions in prose: the Dysregulation card ("Six
  // gentle questions") and this tour slide (which lists them in a sentence).
  // Neither can be derived from the array, and adding "Who was there?" on 16 Jul
  // left the card saying "Five" directly above six rendered questions. A source
  // invariant, so the count cannot drift again unnoticed.
  const fs = require('fs'), path = require('path');
  const srcOf = (f) => fs.readFileSync(path.join(ROOT, 'design-handoff/source/jotla', f), 'utf8');
  const srcA = srcOf('jotla-parent-a.jsx'), srcOnb = srcOf('jotla-onboard.jsx');
  const gateBody = (srcA.match(/const GATE_QUESTIONS = \(name\) => \[([\s\S]*?)\n\];/) || [, ''])[1];
  const gateN = gateBody.split('\n').filter((l) => /^\s*['"`]/.test(l)).length;
  const WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][gateN] || '?';
  ok(`GATE_QUESTIONS parses to a real list (${gateN})`, gateN >= 4 && gateN <= 8);
  ok(`the Dysregulation card counts ${gateN} questions, matching GATE_QUESTIONS`,
    new RegExp(WORD + ' gentle questions', 'i').test(srcA));
  ok(`tour slide 4 counts ${gateN} questions, matching GATE_QUESTIONS`,
    new RegExp(WORD + ' simple questions', 'i').test(srcOnb));
  // Tour copy is tier-neutral (1.10.0, sixth-pass item 34): the Your day tile
  // reads "Hand the phone to" on Free and "Do it together with" on Plus, so the
  // tour has to name the feature without adopting either framing. Asserted as the
  // rule rather than one exact phrase, so plain-language edits cannot trip it.
  const tourToday = await page3.locator('#root').innerText();
  ok('tour Today slide names Your day but stays tier-neutral',
    tourToday.includes('Your day') && !/Hand the phone|Do it together/i.test(tourToday));
  await page3.locator('button[aria-label^="Step 5 of"]').click();
  await page3.waitForTimeout(400);
  ok('tour child slide offers together or hand over', (await page3.locator('#root').innerText()).includes('Do it together, or hand the phone over.'));
  await ctx3.close();

  // ---- 8. build 1.9.0 (12 Jul native parity), free tier ----
  console.log('Suite 8: 12 Jul parity, free tier');
  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page4 = await ctx4.newPage();
  const errors4 = [];
  page4.on('pageerror', e => errors4.push(String(e)));
  await page4.goto(URL_APP, { waitUntil: 'networkidle' });
  await page4.waitForTimeout(1200);

  // four-bar This month strip: one Dysregulation bar joins the mood trio
  const todayText = await page4.locator('#root').innerText();
  ok('Today strip carries the Dysregulation bar', todayText.includes('Dysregulation'));
  // the gate name is gone from the parent's view (founder, 16 Jul 2026); "at the
  // gate" survives only in a log's own words, where it means the actual gate
  ok('no Gate bar or gate-note wording remains on Today', !/Gate\b|gate note/.test(todayText));
  // item 34 (1.10.0): Free keeps the hand-the-phone framing on the tile
  ok("free Your day tile keeps 'Hand the phone'", todayText.includes('Hand the phone to Sam'));

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
  await page4.locator('button.j-ctx[aria-label^="Day"]').first().click();
  await page4.waitForTimeout(300);
  await page4.locator('button.j-chip:has-text("Another day")').first().click(); // opens the calendar straight away
  await page4.waitForTimeout(400);
  ok('calendar sheet opens with a full six-week grid', (await page4.locator('.j-sheet .j-pager > div:not([aria-hidden="true"]) > button[aria-pressed]').count()) === 42);
  ok('no typed date input remains in Quick log', (await page4.locator('input[type="date"]').count()) === 0);
  await page4.locator('.j-sheet .j-btn-ghost:has-text("Cancel")').click();
  await page4.waitForTimeout(300);
  await page4.locator('button[aria-label="Close"]').first().click();
  await page4.waitForTimeout(400);
  // step back out of the pushed Day view so the tab bar is reachable again
  await page4.locator('button[aria-label="Back"]').first().click();
  await page4.waitForTimeout(400);

  // adding media is Plus-gated on the free tier (viewing never gates). Media now
  // rides the specific moment, so it lives inside the moment editor.
  await page4.getByText('Log', { exact: true }).last().click();
  await page4.waitForTimeout(500);
  await page4.getByText('Wins', { exact: true }).first().click(); // open a moment editor
  await page4.waitForTimeout(300);
  const qlFree = await page4.locator('#root').innerText();
  ok('free moment editor shows the honest locked media card', qlFree.includes('Add photos and videos') && qlFree.includes('Part of Plus'));
  ok('free moment editor has no live media tiles', !qlFree.includes('Attach media'));
  await page4.locator('button[aria-label="Close"]').first().click();
  await page4.waitForTimeout(400);

  // Settings after the sixth-pass consolidation (1.10.0): the info rows fold
  // into the one About page, the planned rows live on its coming board, and
  // adding a child belongs to the header avatar's profile sheet.
  await page4.getByText('Settings', { exact: true }).last().click();
  await page4.waitForTimeout(450);
  const settingsNow = await page4.locator('#root').innerText();
  ok('Settings drops the Add another child row', !settingsNow.includes('Add another child'));
  ok('Settings drops the duplicated info rows', !settingsNow.includes('What Jotla is for')
    && !settingsNow.includes('Privacy, in plain words') && !settingsNow.includes('Where your record is kept')
    && !settingsNow.includes('How your data is kept'));
  ok('Settings drops the planned-feature rows', !settingsNow.includes('Encrypted export') && !settingsNow.includes('Lock the app'));
  ok('Settings keeps the live Restore action', settingsNow.includes('Restore from an export'));
  ok('Settings keeps the privacy banner and feedback card', settingsNow.includes('Nothing leaves the phone') && settingsNow.includes('Tell us what you think'));
  ok('the three old info pages are out of the bundle', await page4.evaluate(() =>
    typeof window.InfoMissionScreen === 'undefined' && typeof window.InfoPrivacyScreen === 'undefined' && typeof window.InfoDataScreen === 'undefined'));
  await page4.getByText('About Jotla', { exact: true }).first().click();
  await page4.waitForTimeout(500);
  const aboutText = await page4.locator('#root').innerText();
  ok('About carries the live build number', aboutText.includes('Early test build 1.11.1'));
  ok('About drops the fonts credit line', !aboutText.includes('Typefaces'));
  ok('About owns the mission story', aboutText.includes('Nobody gives them the tool'));
  ok('About says the privacy promise exactly once', (aboutText.match(/We never send your record anywhere/g) || []).length === 1);
  ok('About owns the record home story, browser truth', aboutText.includes('Where the record lives') && aboutText.includes("this browser's own storage"));
  ok('About owns the doors-out story', aboutText.includes('What leaves this device') && aboutText.includes('Email this to the teacher'));
  ok('About keeps the web-true export claims', aboutText.includes('Videos are never inside it') && aboutText.includes('over 2 MB'));
  ok('About carries the coming board', aboutText.includes('What is coming') && aboutText.includes('Family Sync'));
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
  // item 34 (1.10.0): Plus frames the check-in as a two-of-you thing
  ok("Plus Your day tile reads 'Do it together'", (await page5.locator('#root').innerText()).includes('Do it together with Sam'));

  // Plus quick log: the media tiles are live inside the moment editor
  await page5.getByText('Log', { exact: true }).last().click();
  await page5.waitForTimeout(500);
  await page5.getByText('Wins', { exact: true }).first().click(); // open a moment editor
  await page5.waitForTimeout(300);
  const qlPlus = await page5.locator('#root').innerText();
  ok('Plus moment editor offers Capture and Attach media', qlPlus.includes('Capture') && qlPlus.includes('Attach media'));
  await page5.locator('button[aria-label="Close"]').first().click();
  await page5.waitForTimeout(400);

  // Plus month graph draws all five bars
  await page5.getByText('Month', { exact: true }).last().click();
  await page5.waitForTimeout(500);
  const monthPlus = await page5.locator('#root').innerText();
  ok('Plus month graph shows the four-bar story', /How .+ looked/.test(monthPlus)
    && monthPlus.includes('Dysregulation') && !/\bGate\b/.test(monthPlus));

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

  // ---- 11. build 1.9.2: justified graph columns (native parity) ----
  console.log('Suite 11: justified graph columns (1.9.2)');
  // One Plus context covers both graphs: the Today "This month" strip (every
  // tier) and the Plus-only month graph. Geometry is measured on the real
  // rendered rows, per the iron rule: shrink-wrapped columns (no flex
  // weighting), space-between spread, first column flush left, last flush
  // right, even gaps, and the bars keeping one slim shared width.
  const ctx8 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page8 = await ctx8.newPage();
  const errors8 = [];
  page8.on('pageerror', e => errors8.push(String(e)));
  await page8.addInitScript(() => {
    try {
      localStorage.setItem('jotla_prefs_v2', JSON.stringify({
        dark: false, tscale: 1, profileId: 'sam', plus: true, childCfg: {}, customProfiles: [], deletedIds: [],
      }));
    } catch (e) {}
  });
  await page8.goto(URL_APP, { waitUntil: 'networkidle' });
  await page8.waitForTimeout(1200);
  const graphGeom = () => {
    // The column row is found by its own shape: exactly four children whose
    // labels read Good / Mixed / Hard / Dysregulation (one bar since 16 Jul 2026).
    const rows = Array.from(document.querySelectorAll('div')).filter(d =>
      d.children.length === 4 &&
      Array.from(d.children).map(c => c.lastElementChild && c.lastElementChild.textContent).join(',') === 'Good,Mixed,Hard,Dysregulation');
    const row = rows[0];
    if (!row) return null;
    const rect = row.getBoundingClientRect();
    const kids = Array.from(row.children);
    const boxes = kids.map(k => k.getBoundingClientRect());
    const cols = boxes.map(b => b.width);
    const barRects = kids.map(k => k.children[1].getBoundingClientRect());
    // What a reader actually sees is the spacing of the BARS. The old check
    // measured the gaps between the column boxes, which space-between makes even
    // by definition even when the bars are not: with content-width columns the
    // long Dysregulation label made its column 78px against ~30px, putting the bar
    // centres at 54/134/212/312 (gaps 79, 78, 100). Even column gaps, visibly
    // uneven bars, green test (founder spotted it, 16 Jul). Measure the bars.
    const mids = barRects.map(b => b.x + b.width / 2);
    const midGaps = [];
    for (let i = 1; i < mids.length; i++) midGaps.push(mids[i] - mids[i - 1]);
    const bars = barRects.map(b => b.width);
    return {
      flushLeft: Math.abs(boxes[0].left - rect.left),
      flushRight: Math.abs(rect.right - boxes[boxes.length - 1].right),
      colSpread: Math.max(...cols) - Math.min(...cols),
      midGapSpread: Math.max(...midGaps) - Math.min(...midGaps),
      barSpread: Math.max(...bars) - Math.min(...bars),
      barWidth: bars[0],
    };
  };
  const gToday = await page8.evaluate(graphGeom);
  ok('Today strip columns are equal width (spread ' + (gToday ? gToday.colSpread.toFixed(2) : '?') + 'px)',
    !!gToday && gToday.colSpread < 1);
  ok('Today strip: first column flush left, last flush right', !!gToday && gToday.flushLeft < 1 && gToday.flushRight < 1);
  ok('Today strip bars are evenly spaced (centre-gap spread ' + (gToday ? gToday.midGapSpread.toFixed(2) : '?') + 'px)',
    !!gToday && gToday.midGapSpread < 1.5);
  ok('Today strip bars share one width', !!gToday && gToday.barSpread < 0.5);
  // Founder, 16 Jul: "the bars on the graphs are too thin, now that gate was removed".
  ok('Today strip bars are not thin (' + (gToday ? gToday.barWidth : '?') + 'px)', !!gToday && gToday.barWidth >= 32);
  await page8.getByText('Month', { exact: true }).last().click();
  await page8.waitForTimeout(500);
  const gMonth = await page8.evaluate(graphGeom);
  ok('Plus month graph columns are equal width', !!gMonth && gMonth.colSpread < 1);
  ok('Plus month graph: flush edges and evenly spaced bars',
    !!gMonth && gMonth.flushLeft < 1 && gMonth.flushRight < 1 && gMonth.midGapSpread < 1.5);

  // Founder, 16 Jul: each bar's label wears its bar's colour. The catch is that the
  // vivid bar colours are 2.1-3.7:1 on white and cannot carry text, so the labels
  // take the -ink variants. Assert both halves: the label is that bar's hue (not
  // the old grey --muted) AND it clears WCAG AA, since "same colour as the bar"
  // taken literally would fail three of the four.
  const labelInk = await page8.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div')).filter(d =>
      d.children.length === 4 &&
      Array.from(d.children).map(c => c.lastElementChild && c.lastElementChild.textContent).join(',') === 'Good,Mixed,Hard,Dysregulation');
    if (!rows[0]) return null;
    const rel = (c) => {
      const [r, g, b] = c.match(/\d+/g).map(Number).map(v => {
        v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    let ground = 'rgb(255, 255, 255)';
    for (let el = rows[0]; el; el = el.parentElement) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { ground = bg; break; }
    }
    // Hue, not raw RGB distance: an ink is the same hue at a different lightness,
    // so --amber-ink sits 105 away from --amber in the red channel while being the
    // same colour to the eye. Degrees on the wheel are what "same colour" means.
    const hue = (c) => {
      let [r, g, b] = c.match(/\d+/g).map(Number).map(v => v / 255);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (d === 0) return -1; // grey has no hue
      let h;
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
      return h;
    };
    return Array.from(rows[0].children).map((col) => {
      const lab = col.lastElementChild, bar = col.children[1];
      const lc = getComputedStyle(lab).color, bc = getComputedStyle(bar).backgroundColor;
      const l1 = rel(lc), l2 = rel(ground);
      const hl = hue(lc), hb = hue(bc);
      const dh = (hl < 0 || hb < 0) ? 999 : Math.min(Math.abs(hl - hb), 360 - Math.abs(hl - hb));
      return {
        text: lab.textContent,
        hueGap: +dh.toFixed(1),
        contrast: +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2),
      };
    });
  });
  ok('every bar label wears its own bar hue, not grey (' + (labelInk ? labelInk.map(l => l.text[0] + ':' + l.hueGap + 'deg').join(' ') : '?') + ')',
    !!labelInk && labelInk.length === 4 && labelInk.every(l => l.hueGap <= 15));
  ok('every bar label clears WCAG AA (' + (labelInk ? labelInk.map(l => l.text[0] + ':' + l.contrast).join(' ') : '?') + ')',
    !!labelInk && labelInk.every(l => l.contrast >= 4.5));
  ok('no uncaught page errors across suite 11', errors8.length === 0);
  await ctx8.close();

  // ---- 12. build 1.10.0: the adults around a child (the circle) ----
  console.log('Suite 12: the adults circle (1.10.0)');
  // One Plus context walks the whole feature end to end: name adults at
  // onboarding (dedupe, pending-name-counts), round-trip them in the child
  // editor, then prove the child's own question cards lead with them.
  const ctx9 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page9 = await ctx9.newPage();
  const errors9 = [];
  page9.on('pageerror', e => errors9.push(String(e)));
  await page9.addInitScript(() => {
    try {
      localStorage.setItem('jotla_prefs_v2', JSON.stringify({
        dark: false, tscale: 1, profileId: 'sam', plus: true, childCfg: {}, customProfiles: [], deletedIds: [],
      }));
    } catch (e) {}
  });
  await page9.goto(URL_APP, { waitUntil: 'networkidle' });
  await page9.waitForTimeout(1200);

  // onboarding gathers the circle
  await page9.locator('button[aria-label="Switch child, or hold to edit"]').click();
  await page9.waitForTimeout(400);
  // The tab bar overlays the bottom sliver of the profile sheet (z 40 over 30),
  // so tap the upper half of the row, exactly where a thumb lands.
  await page9.locator('button:has-text("Add a child")').click({ position: { x: 60, y: 14 } });
  await page9.waitForTimeout(500);
  const addChildText = await page9.locator('#root').innerText();
  ok('onboarding offers the optional adults section', addChildText.includes('The adults around them') && addChildText.includes('one-tap answers'));
  await page9.locator('input[placeholder="First name or nickname"]').fill('Nia');
  await page9.locator('input[aria-label="Add an adult"]').fill('Mrs Price');
  await page9.getByText('Add', { exact: true }).first().click();
  await page9.waitForTimeout(250);
  ok('an added adult becomes a removable chip', (await page9.locator('button[aria-label="Remove Mrs Price"]').count()) === 1);
  await page9.locator('input[aria-label="Add an adult"]').fill('mrs price');
  await page9.getByText('Add', { exact: true }).first().click();
  await page9.waitForTimeout(250);
  ok('a duplicate name is deduped case-insensitively', (await page9.locator('button[aria-label^="Remove"]').count()) === 1);
  await page9.locator('input[aria-label="Add an adult"]').fill('Mr Okafor'); // left in the box: Create must count it
  await page9.getByText("Create Nia's record").click();
  await page9.waitForTimeout(600);
  await page9.getByText('Skip', { exact: true }).first().click(); // leave the tour
  await page9.waitForTimeout(500);

  // the child editor round-trips the circle
  await page9.getByText('Settings', { exact: true }).last().click();
  await page9.waitForTimeout(450);
  await page9.getByText('Edit name, school, colour and avatar').click();
  await page9.waitForTimeout(450);
  // Bring the sheet's lower fields clear of the tab bar overlay before acting.
  await page9.locator('.j-sheet').evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page9.waitForTimeout(250);
  ok('edit sheet grows the adults section', (await page9.locator('#root').innerText()).includes('The adults around Nia'));
  ok('a name still in the box counted on Create', (await page9.locator('button[aria-label="Remove Mr Okafor"]').count()) === 1);
  ok('the onboarding chip round-tripped', (await page9.locator('button[aria-label="Remove Mrs Price"]').count()) === 1);
  await page9.locator('button[aria-label="Remove Mrs Price"]').click();
  await page9.waitForTimeout(250);
  await page9.locator('input[aria-label="Add an adult"]').fill('Miss Bell');
  await page9.getByText('Add', { exact: true }).first().click();
  await page9.waitForTimeout(250);
  // 'teachers' stays in the box (Done must count it) AND collides with a
  // generic chip word, so child mode must never show it twice.
  await page9.locator('input[aria-label="Add an adult"]').fill('teachers');
  await page9.getByText('Done', { exact: true }).click();
  await page9.waitForTimeout(450);
  await page9.getByText('Edit name, school, colour and avatar').click();
  await page9.waitForTimeout(450);
  await page9.locator('.j-sheet').evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page9.waitForTimeout(250);
  ok('removing a chip sticks', (await page9.locator('button[aria-label="Remove Mrs Price"]').count()) === 0);
  ok('an add in the edit sheet sticks', (await page9.locator('button[aria-label="Remove Miss Bell"]').count()) === 1);
  ok('a name still in the box counts on Done', (await page9.locator('button[aria-label="Remove teachers"]').count()) === 1);
  await page9.getByText('Done', { exact: true }).click();
  await page9.waitForTimeout(400);

  // child mode: the named adults lead the who-chips, deduped against the generics
  await page9.getByText('Today', { exact: true }).last().click();
  await page9.waitForTimeout(450);
  ok("Plus Your day tile reads 'Do it together' for the new child", (await page9.locator('#root').innerText()).includes('Do it together with Nia'));
  await page9.getByText('Your day', { exact: true }).first().click();
  await page9.waitForTimeout(500);
  await page9.getByText('Start', { exact: true }).first().click();
  await page9.waitForTimeout(400);
  await page9.getByText('Next', { exact: true }).first().click();
  await page9.waitForTimeout(400);
  await page9.getByText('Happy', { exact: true }).first().click();
  await page9.waitForTimeout(500);
  await page9.getByText('More', { exact: true }).first().click();
  await page9.waitForTimeout(500);
  const classroomChips = await page9.evaluate(() =>
    Array.from(document.querySelectorAll('button[aria-pressed]')).map(b => b.textContent.trim()));
  ok('classroom who-chips lead with the named adults (' + classroomChips.slice(0, 3).join(', ') + ')',
    classroomChips.indexOf('Mr Okafor') === 0 && classroomChips.indexOf('Miss Bell') === 1
    && classroomChips.indexOf('Mr Okafor') < classroomChips.indexOf('Teachers'));
  ok('an adult named after a generic word never doubles',
    classroomChips.filter(c => c.toLowerCase() === 'teachers').length === 1);
  // walk the classroom cards closed, then on to the playground
  for (let k = 0; k < 4; k++) { await page9.getByText(/^(Next|Done)$/).first().click(); await page9.waitForTimeout(350); }
  await page9.getByText('Next', { exact: true }).first().click(); // lunch scene
  await page9.waitForTimeout(400);
  await page9.getByText('Next', { exact: true }).first().click(); // lunch faces
  await page9.waitForTimeout(400);
  await page9.getByText('Ok', { exact: true }).first().click();
  await page9.waitForTimeout(450);
  await page9.getByText('Next', { exact: true }).first().click(); // playground scene
  await page9.waitForTimeout(400);
  await page9.getByText('Next', { exact: true }).first().click(); // playground faces
  await page9.waitForTimeout(400);
  await page9.getByText('Happy', { exact: true }).first().click();
  await page9.waitForTimeout(500);
  await page9.getByText('More', { exact: true }).first().click();
  await page9.waitForTimeout(500);
  const playgroundChips = await page9.evaluate(() =>
    Array.from(document.querySelectorAll('button[aria-pressed]')).map(b => b.textContent.trim()));
  ok('playground grown-ups chips lead with the named adults',
    playgroundChips.indexOf('Mr Okafor') >= 0 && playgroundChips.indexOf('Mr Okafor') < playgroundChips.indexOf('Helpers'));
  ok('the friends questions never carry the adults',
    playgroundChips.filter(c => c === 'Mr Okafor').length === 1 && playgroundChips.includes('By myself'));
  ok('no uncaught page errors across suite 12', errors9.length === 0);
  await ctx9.close();

  // ---- 13. seventh pass (1.11.0): child photo + crop, tile lift, Drive row ----
  console.log('Suite 13: child photo, tile lift, Google Drive coming-soon (1.11.0)');
  const ctx10 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, acceptDownloads: true });
  const page10 = await ctx10.newPage();
  const errors10 = [];
  page10.on('pageerror', e => errors10.push(String(e)));
  page10.on('dialog', d => d.accept().catch(() => {}));
  await page10.goto(URL_APP, { waitUntil: 'networkidle' });
  await page10.waitForTimeout(1200);

  // item 39: the two Today action tiles now wear the card border + drop shadow
  const tileCss = await page10.locator('button.j-press:has-text("Dysregulation")').first().evaluate(el => {
    const s = getComputedStyle(el);
    return { shadow: s.boxShadow, borderW: parseFloat(s.borderTopWidth), borderStyle: s.borderTopStyle };
  });
  ok('Today tiles carry a non-empty drop shadow', !!tileCss && !!tileCss.shadow && tileCss.shadow !== 'none');
  ok('Today tiles carry a real card border (' + tileCss.borderW + 'px ' + tileCss.borderStyle + ')',
    !!tileCss && tileCss.borderW >= 1 && tileCss.borderStyle === 'solid');

  // item 36: pick a real photo for a NEW child through the actual UI (file input
  // -> crop step -> Use photo), then prove it renders as an <img> everywhere a
  // child is shown, rides an export, and clears back to the glyph.
  await page10.locator('button[aria-label="Switch child, or hold to edit"]').click();
  await page10.waitForTimeout(400);
  await page10.locator('button:has-text("Add a child")').click({ position: { x: 60, y: 14 } });
  await page10.waitForTimeout(500);
  ok('Add child starts on the glyph (no photo <img> yet)', (await page10.locator('.j-screen img[src^="data:image"]').count()) === 0);
  // drive the hidden photo file input with a real PNG built in the page
  await page10.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 24; c.height = 24;
    const cx = c.getContext('2d'); cx.fillStyle = '#4488ff'; cx.fillRect(0, 0, 24, 24);
    cx.fillStyle = '#ffd34e'; cx.fillRect(6, 6, 12, 12);
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    const f = new File([blob], 'pip.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"][accept="image/*"]');
    const dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page10.waitForTimeout(500);
  ok('picking a file opens the square crop step', await page10.getByText('Position the photo').first().isVisible());
  await page10.waitForTimeout(600); // let the cropper load the image before confirming
  await page10.getByText('Use photo').click();
  await page10.waitForTimeout(500);
  ok('the cropped photo shows in the live preview as an <img>', (await page10.locator('.j-screen img[src^="data:image"]').count()) >= 1);
  await page10.locator('input[placeholder="First name or nickname"]').fill('Pip');
  await page10.getByText("Create Pip's record").click();
  await page10.waitForTimeout(600);
  await page10.getByText('Skip', { exact: true }).first().click();
  await page10.waitForTimeout(500);
  ok('the photo shows in the header avatar', (await page10.locator('.j-appheader img[src^="data:image"]').count()) === 1);
  await page10.getByText('Settings', { exact: true }).last().click();
  await page10.waitForTimeout(450);
  ok('the photo shows on the Settings profile card', (await page10.locator('img[src^="data:image"]').count()) >= 1);

  // the export carries the photo (web reality: the data URL rides inside the
  // export file, unlike native, where media never leaves the phone)
  const [download] = await Promise.all([
    page10.waitForEvent('download'),
    page10.getByText('Export my data', { exact: false }).first().click(),
  ]);
  const exportJson = require('fs').readFileSync(await download.path(), 'utf8');
  let exported = null; try { exported = JSON.parse(exportJson); } catch (e) {}
  ok('the export carries the child photo as a data URL',
    !!exported && !!exported.child && typeof exported.child.photo === 'string' && exported.child.photo.startsWith('data:image'));

  // clearing the photo falls back to the coloured glyph
  await page10.getByText('Edit name, school, colour and avatar').click();
  await page10.waitForTimeout(450);
  ok('the edit sheet offers Remove while a photo is set', await page10.getByText('Remove', { exact: true }).first().isVisible());
  await page10.getByText('Remove', { exact: true }).first().click();
  await page10.waitForTimeout(300);
  ok('removing the photo clears every <img> (glyph fallback)', (await page10.locator('img[src^="data:image"]').count()) === 0);
  await page10.getByText('Done', { exact: true }).click();
  await page10.waitForTimeout(400);

  // item 38: the About coming board carries the honest Google Drive row
  await page10.getByText('About Jotla', { exact: true }).first().click();
  await page10.waitForTimeout(500);
  const aboutText13 = await page10.locator('#root').innerText();
  ok('About coming board carries Cloud backup to Google Drive', aboutText13.includes('Cloud backup to Google Drive'));
  ok('the Drive row is honestly not switched on yet', aboutText13.includes('is not switched on yet'));
  ok('no uncaught page errors across suite 13', errors10.length === 0);
  await ctx10.close();

  // ---- 13b. the exported photo restores on a fresh device (import round-trip) ----
  console.log('Suite 13b: photo survives export -> import');
  const ctx11 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page11 = await ctx11.newPage();
  const errors11 = [];
  page11.on('pageerror', e => errors11.push(String(e)));
  page11.on('dialog', d => d.accept().catch(() => {}));
  await page11.goto(URL_APP, { waitUntil: 'networkidle' });
  await page11.waitForTimeout(1200);
  await page11.getByText('Settings', { exact: true }).last().click();
  await page11.waitForTimeout(450);
  ok('a fresh device starts with no imported photo', (await page11.locator('.j-appheader img[src^="data:image"]').count()) === 0);
  // feed the captured export straight into the live Restore file input
  await page11.evaluate((jsonStr) => {
    const f = new File([jsonStr], 'jotla-pip-export.json', { type: 'application/json' });
    const input = document.querySelector('input[accept="application/json,.json"]');
    const dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, exportJson);
  await page11.waitForTimeout(800);
  ok('the imported child brings its photo back as an <img>', (await page11.locator('.j-appheader img[src^="data:image"]').count()) === 1);
  ok('no uncaught page errors across suite 13b', errors11.length === 0);
  await ctx11.close();

  // ---- 14. ninth pass web port (1.11.1): calendar sheets follow the finger ----
  console.log('Suite 14: calendar sheet swipe pager (1.11.1) + photo buttons row (item 44)');
  const ctx12 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page12 = await ctx12.newPage();
  const errors12 = [];
  page12.on('pageerror', e => errors12.push(String(e)));
  await page12.goto(URL_APP, { waitUntil: 'networkidle' });
  await page12.waitForTimeout(1200);
  // open Quick log -> Day? -> Another day -> the calendar sheet
  await page12.getByText('Log', { exact: true }).last().click();
  await page12.waitForTimeout(500);
  await page12.locator('button.j-ctx[aria-label^="Day"]').first().click();
  await page12.waitForTimeout(300);
  await page12.locator('button.j-chip:has-text("Another day")').first().click();
  await page12.waitForTimeout(400);
  const sheetPager = page12.locator('.j-sheet .j-pager');
  ok('the calendar sheet day grid is a swipe pager', await sheetPager.count() === 1);
  const sheetTitle = async () => (await page12.locator('.j-sheet h2').first().innerText()).trim();
  const t0 = await sheetTitle();
  const box1 = await sheetPager.boundingBox();
  // a finger-drag is a scroll: move the pager one page back and let it settle
  await sheetPager.evaluate(el => { el.scrollLeft -= el.clientWidth; });
  await page12.waitForTimeout(500);
  const t1 = await sheetTitle();
  ok('swiping the grid pages to the previous month (' + t0 + ' -> ' + t1 + ')', t1 !== t0);
  const box2 = await sheetPager.boundingBox();
  ok('the sheet grid keeps one fixed height across months', !!box1 && !!box2 && Math.abs(box1.height - box2.height) < 1);
  // the timeline ends at the bound months, so a hard swipe cannot pass today
  await sheetPager.evaluate(el => { el.scrollLeft += el.clientWidth * 5; });
  await page12.waitForTimeout(500);
  ok('swiping clamps at the max bound month like the chevrons', (await sheetTitle()) === t0);
  ok('the next chevron sits disabled at the bound', !(await page12.locator('.j-sheet button[aria-label="Next month"]').isEnabled()));
  // keyboard parity: the sheet pager takes arrow keys like every other pager
  await sheetPager.focus();
  await page12.keyboard.press('ArrowLeft');
  await page12.waitForTimeout(700);
  ok('ArrowLeft pages the sheet back a month', (await sheetTitle()) === t1);
  // tap-pick still works after a swipe: pick the 15th of the shown month
  const pickLabel = '15 ' + t1;
  await page12.locator('.j-sheet button[aria-label="' + pickLabel + '"]').click();
  await page12.waitForTimeout(400);
  ok('picking a day after a swipe closes the sheet', (await page12.locator('.j-sheet-scrim').count()) === 0);
  const fieldText = await page12.locator('button.j-ctx[aria-label^="Day"]').first().innerText();
  ok('the picked day rides the Day card (' + fieldText.replace(/\n/g, ' ').trim() + ')', fieldText.includes('15'));
  // a day in THIS year stays short; a day in another year must say which year,
  // or "10 Dec" leaves you guessing (founder, 16 Jul 2026)
  ok('a day in the current year carries no year', !/20\d\d/.test(fieldText));
  await page12.locator('button.j-ctx[aria-label^="Day"]').first().click();
  await page12.waitForTimeout(300);
  await page12.locator('button.j-chip:has-text("Another day")').first().click();
  await page12.waitForTimeout(400);
  // walk back until the sheet is genuinely in a previous year (the pager
  // animates, so chevron clicks need room to land)
  const lastYear = new Date().getFullYear() - 1;
  for (let k = 0; k < 18; k++) {
    if ((await page12.locator('.j-sheet h2').first().innerText()).includes(String(lastYear))) break;
    await page12.locator('.j-sheet button[aria-label="Previous month"]').click();
    await page12.waitForTimeout(450);
  }
  const backTitle = (await page12.locator('.j-sheet h2').first().innerText()).trim();
  ok('the sheet can walk back into a previous year (' + backTitle + ')', backTitle.includes(String(lastYear)));
  await page12.locator('.j-sheet button[aria-label="10 ' + backTitle + '"]').click();
  await page12.waitForTimeout(400);
  const prevYearPill = (await page12.locator('button.j-ctx[aria-label^="Day"]').first().innerText()).replace(/\n/g, ' ').trim();
  const prevYearBody = await page12.locator('#root').innerText();
  ok('a day from another year names its year on the card (' + backTitle + ' -> ' + prevYearPill + ')', /20\d\d/.test(prevYearPill));
  ok('and names it on the Saving to line', /Saving to [^\n]*20\d\d/.test(prevYearBody));
  // ...and the year has to survive the big text sizes on a narrow phone, or an
  // ellipsis quietly undoes the fix that put it there (founder, 16 Jul 2026)
  await page12.setViewportSize({ width: 375, height: 812 });
  await page12.waitForTimeout(300);
  const clamp = await page12.evaluate(() => {
    const root = document.querySelector('.jotla-root');
    const span = document.querySelector('button.j-ctx[aria-label^="Day"] .j-ctx-a');
    const out = [];
    for (const s of ['1', '1.12', '1.25']) {
      root.style.setProperty('--tscale', s);
      const lh = parseFloat(getComputedStyle(span).lineHeight);
      out.push({ s, text: span.textContent,
        clipped: Math.ceil(span.scrollWidth) > Math.floor(span.clientWidth) + 1,
        lines: Math.round(span.getBoundingClientRect().height / lh) });
    }
    root.style.removeProperty('--tscale');
    return out;
  });
  ok('the year survives every text size at 375px ('
    + clamp.map(c => c.s + '=' + (c.clipped ? 'CLIPPED' : c.lines + 'ln')).join(' ') + ')',
    clamp.every(c => !c.clipped && c.lines <= 2) && clamp.every(c => /20\d\d/.test(c.text)));
  await page12.setViewportSize({ width: 390, height: 844 });
  await page12.locator('button[aria-label="Close"]').first().click();
  await page12.waitForTimeout(400);

  // item 44 verify-only: with a photo in place, Change photo + Remove share one row
  await page12.locator('button[aria-label="Switch child, or hold to edit"]').click();
  await page12.waitForTimeout(400);
  await page12.locator('button:has-text("Add a child")').click({ position: { x: 60, y: 14 } });
  await page12.waitForTimeout(500);
  await page12.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 24; c.height = 24;
    const cx = c.getContext('2d'); cx.fillStyle = '#4488ff'; cx.fillRect(0, 0, 24, 24);
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    const f = new File([blob], 'row.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"][accept="image/*"]');
    const dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page12.waitForTimeout(1100); // crop step opens and loads the image
  await page12.getByText('Use photo').click();
  await page12.waitForTimeout(500);
  const bChange = await page12.locator('label:has-text("Change photo")').first().boundingBox();
  const bRemove = await page12.locator('button:has-text("Remove")').first().boundingBox();
  ok('item 44: Change photo and Remove sit on one row', !!bChange && !!bRemove && Math.abs(bChange.y - bRemove.y) < 2);
  ok('no uncaught page errors across suite 14', errors12.length === 0);
  await ctx12.close();

  // ---- suite 15: a good month must render ----
  // The gate-to-Dysregulation rename (2aae634) renamed `dys` to `dysreg` at the
  // definition and left two call sites reading the old name. Both sit in the
  // branch taken when NOTHING is tagged as a hard moment, so the trend line threw
  // a ReferenceError for exactly the two records we most want to work: a parent
  // having a good month, and a new parent whose child has not had a hard day yet.
  // The seeded demo record is thick with hard entries, so 182 green checks sailed
  // straight past it. Every seed here is deliberately free of a hard mood.
  const ctx13 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page13 = await ctx13.newPage();
  const errors13 = [];
  page13.on('pageerror', e => errors13.push(String(e)));
  const _now13 = new Date();
  const _pre13 = `${_now13.getFullYear()}-${String(_now13.getMonth() + 1).padStart(2, '0')}`;
  const seedGood = ({ pre, withDysreg }) => {
    try {
      localStorage.setItem('jotla_prefs_v2', JSON.stringify({
        dark: false, tscale: 1, profileId: 'sam', plus: true, childCfg: {}, customProfiles: [], deletedIds: [],
      }));
      const list = [
        { id: 'g1', childId: 'sam', date: `${pre}-02`, time: 'Morning', clock: '08:40', setting: 'School',
          category: 'Play', mood: 'good', kind: 'contemporaneous', type: 'quick',
          summary: 'Straight in at drop-off, no wobble.' },
      ];
      // A dysregulation moment can carry a good or mixed mood, so a month with a
      // plum bar and no hard day is a real record, not a contrived one. It is also
      // the branch that threw.
      if (withDysreg) list.push({ id: 'g2', childId: 'sam', date: `${pre}-03`, time: 'Afternoon', clock: '15:10',
        setting: 'School', category: 'Incidents', mood: 'ok', kind: 'contemporaneous', type: 'quick',
        summary: 'Left the room at the bell, came back by himself.' });
      localStorage.setItem('jotla_entries_v4', JSON.stringify(list));
    } catch (e) {}
  };
  await page13.addInitScript(seedGood, { pre: _pre13, withDysreg: true });
  await page13.goto(URL_APP, { waitUntil: 'networkidle' });
  await page13.waitForTimeout(1200);
  const todayGood = await page13.locator('#root').innerText();
  ok('good month: the Today trend line renders instead of throwing',
    todayGood.includes('none marked as a hard moment'));
  await page13.getByText('Month', { exact: true }).last().click();
  await page13.waitForTimeout(600);
  const monthGood = await page13.locator('#root').innerText();
  ok('good month: the Month trend line renders instead of throwing',
    monthGood.includes('none marked as a hard moment'));
  ok('good month: no uncaught page errors', errors13.length === 0);
  await ctx13.close();

  // The same record with nothing dysregulated at all: the other side of the branch.
  const ctx14 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page14 = await ctx14.newPage();
  const errors14 = [];
  page14.on('pageerror', e => errors14.push(String(e)));
  await page14.addInitScript(seedGood, { pre: _pre13, withDysreg: false });
  await page14.goto(URL_APP, { waitUntil: 'networkidle' });
  await page14.waitForTimeout(1200);
  const todayClear = await page14.locator('#root').innerText();
  ok('a month with nothing hard and nothing dysregulated says so kindly',
    todayClear.includes('Long may it last'));
  ok('clear month: no uncaught page errors', errors14.length === 0);
  await ctx14.close();

  await browser.close();
  server.kill();
  console.log('\n' + passed + '/' + (passed + failed) + ' checks green' + (failed ? ' - ' + failed + ' FAILED' : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Suite crashed:', e); process.exit(2); });
