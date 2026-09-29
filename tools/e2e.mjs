#!/usr/bin/env node
/*
 * End-to-end playthrough (dev only; requires Playwright + Chromium).
 * Plays all 12 stories, checks decisions, reveals, persistence across
 * reload, the ending sequence, offline mode and reset.
 * Usage: node tools/e2e.mjs [--shots]   (screenshots → tools/shots/)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';

let chromium;
for (const mod of ['playwright', '@playwright/test', 'playwright-core']) {
  try { ({ chromium } = await import(mod)); break; } catch { /* try next */ }
}
if (!chromium) {
  // Fall back to a globally installed Playwright.
  try {
    const { execSync } = await import('node:child_process');
    const { createRequire } = await import('node:module');
    const g = execSync('npm root -g').toString().trim();
    ({ chromium } = createRequire(path.join(g, 'noop.js'))('playwright'));
  } catch { /* not available */ }
}
if (!chromium) { console.error('Playwright not installed. Run: npm i -D playwright'); process.exit(2); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = process.argv.includes('--shots');
const shotDir = path.join(HERE, 'shots');
if (SHOTS) fs.mkdirSync(shotDir, { recursive: true });

const server = createServer();
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const results = [];
const ok = (cond, msg) => { results.push([!!cond, msg]); if (!cond) console.log('  ✗ ' + msg); };

const launchOpts = {};
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(launchOpts);

async function run(viewport, label, full) {
  console.log(`\n=== ${label} ${viewport.width}×${viewport.height} ===`);
  const context = await browser.newContext({ viewport, hasTouch: viewport.width < 600, isMobile: viewport.width < 600 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const external = [];
  page.on('request', (r) => { if (!r.url().startsWith(BASE)) external.push(r.url()); });

  await page.goto(BASE);
  await page.waitForSelector('.wordmark');
  const swReady = await page.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.ready.then(() => true) : false);
  ok(swReady, 'service worker registered and ready');
  if (SHOTS) await page.screenshot({ path: path.join(shotDir, `${label}-home.png`) });

  const state = () => page.evaluate(() => window.ORGANIZE_DEBUG.state());
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(shotDir, `${label}-${name}.png`) }); };

  await page.click('.home-actions .btn.primary');
  const decisionsSeen = {};
  const overflow = [];
  let reloaded = false;
  let beatCount = 0;

  for (let guard = 0; guard < 2000; guard++) {
    const cur = await page.evaluate(() => {
      const s = window.ORGANIZE_DEBUG.state();
      return { view: document.documentElement.dataset.view, cur: s.current };
    });
    if (cur.view === 'ending') break;
    const storyId = cur.cur && cur.cur.storyId;

    // layout checks on the current beat
    const lay = await page.evaluate(() => {
      const slot = [...document.querySelectorAll('#stage .slot')].pop();
      if (!slot) return null;
      const bigs = [...slot.querySelectorAll('.big, .item, .opt, .para')].filter((n) => n.offsetParent);
      const hOver = bigs.some((n) => n.scrollWidth > n.clientWidth + 2 || n.getBoundingClientRect().right > window.innerWidth + 1);
      return { v: slot.scrollHeight > slot.clientHeight + 2, h: hOver, text: slot.innerText.slice(0, 60).replace(/\s+/g, ' ') };
    });
    if (lay && (lay.v || lay.h)) overflow.push(`${storyId} b${cur.cur.beat}: ${lay.v ? 'vscroll ' : ''}${lay.h ? 'HOVERFLOW ' : ''}"${lay.text}"`);

    const opts = await page.$$('#stage .slot:not(.leaving) .opt');
    const complete = await page.$('#stage .slot:not(.leaving) .beat-complete');
    if (opts.length) {
      const dId = `${storyId}#${cur.cur.beat}`;
      decisionsSeen[storyId] = (decisionsSeen[storyId] || 0) + 1;
      // PAUSE (Story 5) and YES (Story 6) are option 0 — used to check the echo copy.
      await shot(`decision-${storyId}-${cur.cur.beat}`);
      await opts[0].click();
      await page.waitForTimeout(450);
      const text = await page.evaluate(() => document.querySelector('#stage .slot:not(.leaving)').innerText);
      if (storyId === 'before-rosa-parks' && /DIDN'T ALL AGREE/.test(text)) {
        await page.click('#next');
        const t2 = await page.evaluate(() => document.querySelector('#stage .slot:not(.leaving)').innerText);
        ok(t2.includes('You chose PAUSE. Some of them did too.'), 'Story 5 echo: "You chose PAUSE. Some of them did too."');
      }
      if (storyId === 'who-knows-this-place' && /THEY DISAGREED/.test(text)) {
        await page.click('#next');
        const t2 = await page.evaluate(() => document.querySelector('#stage .slot:not(.leaving)').innerText);
        ok(t2.includes('You chose YES. So did some of them.'), 'Story 6 echo: "You chose YES. So did some of them."');
      }
      const st = await state();
      ok(st.choices[storyId] && Object.keys(st.choices[storyId]).length >= 1, `choice saved for ${dId}`);
      continue;
    }
    if (complete) {
      const t = await page.evaluate(() => document.querySelector('.beat-complete').innerText);
      ok(/\+100 XP/.test(t), `${storyId}: completion shows +100 XP`);
      ok(!/CORRECT|WRONG|SCORE/i.test(t), `${storyId}: completion has no scoring copy`);
      await shot(`complete-${storyId}`);
      const lc = await page.$('.beat-complete .btn:has-text("LOOK CLOSER")');
      ok(!lc, `${storyId}: no LOOK CLOSER button without sourced cards`);
      await page.click('.beat-complete .btn.primary');
      await page.waitForTimeout(120);
      continue;
    }
    if (full && !reloaded && storyId === 'dont-let-the-company-know' && cur.cur.beat === 5) {
      const before = await state();
      await page.reload();
      await page.waitForSelector('#stage .slot');
      const after = await state();
      ok(JSON.stringify(before.current) === JSON.stringify(after.current) && after.completed.length === 2,
        `refresh preserves position (${JSON.stringify(after.current)}) and progress (${after.completed.length} done)`);
      reloaded = true;
    }
    if (storyId === 'us-helping-us') {
      const hidden = await page.evaluate(() => document.getElementById('top-xp').hidden);
      ok(hidden, 'Story 12: XP hidden in header') ;
    }
    if (full && beatCount % 7 === 0) await shot(`beat-${storyId}-${cur.cur.beat}-${cur.cur.step}`);
    beatCount++;
    await page.click('#next');
    await page.waitForTimeout(275); // engine ignores taps < 260ms apart
  }

  const expected = { washerwomen: 1, 'one-shilling': 1, 'dont-let-the-company-know': 1, 'buy-where-you-can-work': 2, 'before-rosa-parks': 2, 'who-knows-this-place': 2, 'we-live-here': 1, breakfast: 0, 'we-found-each-other': 3, '40-acres': 1, 'did-you-lose': 1, 'us-helping-us': 1 };
  for (const [id, n] of Object.entries(expected)) ok((decisionsSeen[id] || 0) === n, `${id}: ${decisionsSeen[id] || 0} decisions shown (expected ${n})`);
  ok(!decisionsSeen.breakfast, 'Story 8 shows zero decisions');

  // Ending
  ok(await page.evaluate(() => document.documentElement.dataset.view === 'ending'), 'ending reached after Story 12');
  const st12 = await state();
  ok(st12.completed.length === 12 && st12.xp === 1200, `XP added internally: ${st12.xp}`);
  ok(!(await page.evaluate(() => /XP/.test(document.getElementById('view-ending').innerText))), 'no XP shown in ending');
  const order = [];
  for (let i = 0; i < 12; i++) {
    order.push(await page.evaluate(() => document.querySelector('.end-card.current .end-text').textContent));
    if (i === 5) await shot('ending-solo');
    await page.click('.end-next');
    await page.waitForTimeout(320);
  }
  ok(order.join('|') === '20 → 3,000|1 SHILLING.|12 YEARS|WHAT DO THEY NEED FROM YOU?|381 DAYS|WHO KNOWS THIS PLACE?|WE LIVE HERE.|BREAKFAST.|WE FOUND EACH OTHER.|30 OF 1,500|DID YOU LOSE?|US HELPING US', 'memory cards appear one at a time in story order');
  await page.waitForTimeout(1000);
  await shot('ending-grid');
  const visual = () => page.evaluate(() => [...document.querySelectorAll('.end-card')]
    .map((c) => ({ r: c.getBoundingClientRect(), t: c.querySelector('.end-text').textContent, y: c.querySelector('.end-year').textContent }))
    .sort((a, b) => (Math.round(a.r.top) - Math.round(b.r.top)) || (a.r.left - b.r.left)).map((x) => x.y));
  const gridYears = await visual();
  await page.click('.end-next');
  await page.waitForTimeout(250);
  const mid = await page.evaluate(() => getComputedStyle(document.querySelector('.end-card')).transform);
  await page.waitForTimeout(2000);
  await shot('ending-chrono');
  const chronoYears = await visual();
  ok(gridYears.join() !== chronoYears.join(), 'grid visibly rearranges');
  ok(chronoYears.join('|') === '1787|1881|1925|1933|1955|1960s|1964|1969|1969|1974|1982|1985 → TODAY', `grid reorders chronologically: ${chronoYears.join(', ')}`);
  console.log('    (mid-animation transform sample: ' + mid + ')');
  await page.click('.end-next');
  await page.waitForTimeout(1600);
  const final1 = await page.evaluate(() => document.getElementById('view-ending').innerText.trim());
  ok(final1 === 'WHAT NOW?', `final screen shows only WHAT NOW? at first (got "${final1}")`);
  await page.waitForTimeout(2800);
  const final2 = await page.evaluate(() => document.getElementById('view-ending').innerText.trim());
  ok(final2 === 'WHAT NOW?\nREVISIT STORIES' || final2 === 'WHAT NOW?\n\nREVISIT STORIES', `REVISIT STORIES appears after a delay (got "${final2.replace(/\n/g, ' / ')}")`);
  await shot('ending-whatnow');
  ok(!/congrat|score|certificate|you learned/i.test(final2), 'no congratulations / score copy at the end');
  await page.click('.revisit');
  await page.waitForSelector('.story-list');
  const cards = await page.$$eval('.story-card.done .sc-memory', (n) => n.length);
  ok(cards === 12, 'revisit screen shows 12 completed memory cards');
  await shot('stories-complete');

  // revisit a completed story: no XP change
  await page.click('.story-card >> nth=0');
  await page.waitForSelector('#stage .slot');
  ok((await state()).current.revisit === true, 'revisit mode set when replaying a completed story');
  await page.click('#menu-btn');
  await shot('menu');
  await page.click('#dlg-menu .btn:has-text("RESTART STORY")');
  ok((await state()).current.beat === 0, 'Restart Story returns to beat 0');
  await page.click('#menu-btn');
  await page.click('#dlg-menu .btn:has-text("HOME")');
  await page.waitForSelector('.wordmark');

  // offline
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('.wordmark', { timeout: 8000 });
  const offState = await state();
  ok(offState.completed.length === 12, 'offline reload works and keeps progress');
  await page.click('.home-actions .btn:has-text("STORIES")');
  await page.waitForSelector('.story-list');
  await page.click('.story-card >> nth=7');
  await page.waitForSelector('#stage .slot');
  await page.waitForTimeout(300);
  await page.click('#next'); await page.waitForTimeout(400);
  const offText = await page.evaluate(() => document.querySelector('#stage').innerText);
  ok(/OAKLAND/.test(offText), 'offline: a story plays (' + offText.replace(/\s+/g, ' ').slice(0, 40) + ')');
  await context.setOffline(false);

  // about + settings
  await page.goto(BASE + '#/about');
  await page.waitForSelector('.about-body');
  await shot('about');
  await page.click('.seg-btn:has-text("LIGHT")');
  ok(await page.evaluate(() => document.documentElement.dataset.theme === 'light'), 'theme switches to light');
  await page.click('.seg-btn:has-text("REDUCED")');
  ok(await page.evaluate(() => document.documentElement.classList.contains('rm')), 'reduced motion toggles on');
  await page.reload();
  ok(await page.evaluate(() => document.documentElement.dataset.theme === 'light' && document.documentElement.classList.contains('rm')), 'prefs persist across reload');
  await shot('about-light');
  await page.click('.seg-btn:has-text("DARK")');
  await page.click('.seg-btn:has-text("DEVICE SETTING")');

  // reset
  await page.goto(BASE + '#/stories');
  await page.waitForSelector('.story-list');
  await page.click('.btn.danger');
  await shot('reset-confirm');
  await page.click('#dlg-confirm .btn.danger');
  const rs = await state();
  ok(rs.completed.length === 0 && rs.xp === 0 && !rs.current && Object.keys(rs.choices).length === 0, 'Reset Progress clears progress');
  const locked = await page.$$eval('.story-card.locked', (n) => n.length);
  ok(locked === 11, 'after reset, stories 2–12 are locked');

  ok(errors.length === 0, `no console/page errors ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  ok(external.length === 0, `no external network requests ${external.slice(0, 3).join(' ')}`);
  if (overflow.length) {
    console.log(`  layout notes (${overflow.length} beats need scroll or overflow):`);
    overflow.slice(0, 40).forEach((o) => console.log('    · ' + o));
  }
  ok(!overflow.some((o) => o.includes('HOVERFLOW')), 'no horizontal text overflow');
  await context.close();
  return overflow;
}

await run({ width: 390, height: 844 }, 'phone', true);
await run({ width: 360, height: 640 }, 'small', false);
await run({ width: 1280, height: 800 }, 'desktop', false);

await browser.close();
server.close();
const failed = results.filter((r) => !r[0]);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
