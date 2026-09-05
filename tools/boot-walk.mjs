// A real boot of the exported browser build, on the /jotla/ base path the
// export expects. Asserts what a parent's first minute actually does.
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:8791/jotla/';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'walk-out') + '/';
const errors = [];
const results = [];
const check = (name, ok, detail = '') => {
  results.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : ''));
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

const labels = () => page.evaluate(() => [...document.querySelectorAll('[aria-label]')].map((el) => el.getAttribute('aria-label')));
const text = () => page.evaluate(() => document.body.innerText);

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(3500);

check('boot raises no pageerror and no console error', errors.length === 0, errors.join(' / '));
check('the first run add a child screen appears', (await text()).includes('Add a child'));

await page.getByLabel('Their name').fill('Test');
await page.getByRole('button', { name: "Create Test's record" }).click();
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Skip' }).click();
await page.waitForTimeout(2500);

const todayText = await text();
check('the Today screen renders after adding Test', todayText.includes("Test's day so far") && todayText.includes('SEPTEMBER'));
const tabs = await page.getByRole('tab').allInnerTexts();
check('the tab bar renders all five tabs', tabs.join(',') === 'Today,Month,Documents,Find,Menu', tabs.join(','));
await page.screenshot({ path: OUT + 'today-360.png' });

// A stacked page: Menu tab, then Settings.
await page.getByRole('tab', { name: 'Menu' }).click();
await page.waitForTimeout(1500);
const menuText = await text();
console.log('MENU LABELS: ' + (await labels()).join(' | ').slice(0, 600));
console.log('MENU TEXT: ' + menuText.replace(/\n/g, ' / ').slice(0, 600));
const histOnMenu = await page.evaluate(() => history.length);

await page.getByRole('button', { name: 'Settings', exact: true }).first().click();
await page.waitForTimeout(1800);
const settingsText = await text();
check('Settings opens as a stacked page', /Settings/.test(settingsText), settingsText.replace(/\n/g, ' / ').slice(0, 200));
await page.screenshot({ path: OUT + 'settings-360.png' });
const histOnSettings = await page.evaluate(() => history.length);

await page.evaluate(() => history.back());
await page.waitForTimeout(1800);
const afterBack = await text();
const tabCount = await page.getByRole('tab').count();
const stillInApp = page.url().startsWith(URL) && tabCount === 5;
check('history.back() from Settings stays in the app', stillInApp, 'url=' + page.url() + ' tabs=' + tabCount);
check('history.back() leaves Settings for the page before it', afterBack !== settingsText, 'back text: ' + afterBack.replace(/\n/g, ' / ').slice(0, 160));
console.log('AFTER BACK TEXT: ' + afterBack.replace(/\n/g, ' / ').slice(0, 400));
console.log('history length: menu=' + histOnMenu + ' settings=' + histOnSettings + ' afterBack=' + (await page.evaluate(() => history.length)));

check('no pageerror across the whole walk', errors.length === 0, errors.join(' / '));
console.log('---- RESULTS ----');
console.log(results.join('\n'));
console.log('errors: ' + (errors.length ? errors.join('\n') : '(none)'));
await browser.close();
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
