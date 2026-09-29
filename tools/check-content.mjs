#!/usr/bin/env node
/*
 * Content integrity check for ORGANIZE.
 *  - approved story order, decision counts, Story 8 has zero decisions
 *  - every decision is followed by its reveal
 *  - every player-facing story string appears verbatim in the Game Bible,
 *    unless it is explicitly marked `draft: true` (those are listed)
 *  - forbidden gamification / moral-summary vocabulary is absent
 *  - XP totals, chronological ending order, LOOK CLOSER cards carry sources
 * Usage: node tools/check-content.mjs   (exit code 1 on failure)
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/content.js'), 'utf8'), sandbox);
const C = sandbox.window.ORGANIZE_CONTENT;
const bibleRaw = fs.readFileSync(path.join(ROOT, 'docs/ORGANIZE_V1.1_Game_Bible.md'), 'utf8');

const norm = (s) => String(s)
  .replace(/\*\*/g, '')
  .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ').trim().toLowerCase();
const BIBLE = norm(bibleRaw);

const failures = [];
const drafts = [];
const fail = (m) => failures.push(m);

/* 1. order */
const APPROVED = [
  'THE WASHERWOMEN', 'ONE SHILLING', "DON'T LET THE COMPANY KNOW", 'BUY WHERE YOU CAN WORK',
  'BEFORE ROSA PARKS', 'WHO KNOWS THIS PLACE?', 'WE LIVE HERE.', 'BREAKFAST.',
  'WE FOUND EACH OTHER.', '40 ACRES', 'DID YOU LOSE?', 'US HELPING US'
];
const stories = [...C.stories].sort((a, b) => a.order - b.order);
if (stories.length !== 12) fail(`Expected 12 stories, found ${stories.length}`);
stories.forEach((s, i) => {
  if (s.order !== i + 1) fail(`Story order gap at ${s.id}`);
  if (s.title !== APPROVED[i]) fail(`Story ${i + 1} title "${s.title}" ≠ approved "${APPROVED[i]}"`);
});

/* 2. decisions */
const EXPECTED_DECISIONS = [1, 1, 1, 2, 2, 2, 1, 0, 3, 1, 1, 1];
stories.forEach((s, i) => {
  const ds = s.beats.filter((b) => b.type === 'decision');
  if (ds.length !== EXPECTED_DECISIONS[i]) fail(`Story ${i + 1} has ${ds.length} decisions, Bible says ${EXPECTED_DECISIONS[i]}`);
  ds.forEach((d) => {
    const at = s.beats.indexOf(d);
    const next = s.beats[at + 1];
    if (!next || next.type !== 'reveal' || next.decision !== d.id) fail(`Story ${i + 1} decision "${d.id}" is not followed by its reveal`);
    if (d.options.length > 3) fail(`Story ${i + 1} decision "${d.id}" has more than 3 options`);
  });
});
const s8 = stories.find((s) => s.id === 'breakfast');
if (!s8 || s8.beats.some((b) => b.type === 'decision')) fail('Story 8 (BREAKFAST.) must contain zero decisions');

/* 3. verbatim check */
function check(where, value, meta = {}) {
  if (value == null || value === '') return;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const m = { draft: value.draft || meta.draft, note: value.note || meta.note, requires: value.requires || meta.requires };
    if (value.text != null) check(where, value.text, m);
    if (value.row) value.row.forEach((t) => check(where, t, m));
    if (value.fallback) check(where + ' (fallback)', value.fallback, {});
    return;
  }
  const str = String(value);
  if (meta.draft) { drafts.push({ where, text: str, note: meta.note || '', requires: meta.requires || '' }); return; }
  const parts = str.split('{choice}').map(norm).filter(Boolean);
  if (!parts.every((p) => BIBLE.includes(p))) fail(`Not verbatim in Bible (mark draft or fix): ${where}: "${str}"`);
}
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

stories.forEach((s) => {
  const tag = `S${s.order}`;
  check(`${tag} title`, s.title);
  check(`${tag} memory`, s.memory);
  check(`${tag} memoryNote`, s.memoryNote);
  check(`${tag} chrono`, s.chrono.label);
  s.beats.forEach((b, i) => {
    const w = `${tag} beat ${i} (${b.type})`;
    const bm = b.draft ? { draft: true, note: b.note } : {};
    ['text', 'kicker', 'heading', 'question', 'echo'].forEach((k) => check(`${w}.${k}`, b[k], bm));
    arr(b.lines).forEach((l) => check(`${w}.lines`, l, bm));
    arr(b.items).forEach((it) => {
      if (typeof it === 'object' && (it.label != null)) check(`${w}.items.label`, it.label);
      check(`${w}.items`, it, bm);
    });
    arr(b.options).forEach((o) => check(`${w}.options`, o));
    arr(b.list).forEach((l) => check(`${w}.list`, l));
    arr(b.names).forEach((l) => check(`${w}.names`, l));
    arr(b.steps).forEach((st) => {
      if (typeof st === 'object') { check(`${w}.year`, st.year); check(`${w}.step`, st.text); arr(st.lines).forEach((l) => check(`${w}.step.lines`, l)); }
      else check(`${w}.steps`, st);
    });
    if (b.quote) check(`${w}.quote`, b.quote);
    ['left', 'right'].forEach((k) => { if (b[k]) { check(`${w}.${k}`, b[k].label); check(`${w}.${k}`, b[k].text); } });
  });
  arr(s.lookCloser).forEach((c, i) => {
    if (!c.source) fail(`${tag} LOOK CLOSER card ${i} has no source`);
  });
});

/* 4. forbidden vocabulary (story content + UI + about) */
const FORBIDDEN = /\b(correct|incorrect|wrong|right answer|congratulations|congrats|badge|streak|leaderboard|achievement|score|level up|well done|great job|you learned|certificate|trophy|winner|perfect|bonus)\b/i;
const MORAL = /(collective action creates power|is the key to|always matters|the lesson|the moral|this teaches|remember her)/i;
const walk = (x, where) => {
  if (x == null) return;
  if (typeof x === 'string') {
    if (FORBIDDEN.test(x)) fail(`Forbidden gamification copy at ${where}: "${x}"`);
    if (MORAL.test(x)) fail(`Moral-summary copy at ${where}: "${x}"`);
    return;
  }
  if (Array.isArray(x)) return x.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (typeof x === 'object') Object.keys(x).filter((k) => k !== 'note').forEach((k) => walk(x[k], `${where}.${k}`));
};
walk(C.stories, 'stories');
walk(C.ui, 'ui');
walk(C.about, 'about');
walk(C.ending, 'ending');

/* 5. XP + ending order */
const total = stories.reduce((t, s) => t + (s.xp || 0), 0);
if (total !== 1200) fail(`Total XP ${total} ≠ 1,200`);
const CHRONO = ['1787', '1881', '1925', '1933', '1955', '1960s', '1964', '1969', '1969', '1974', '1982', '1985 → TODAY'];
const byRank = [...stories].sort((a, b) => a.chrono.rank - b.chrono.rank).map((s) => s.chrono.label);
if (JSON.stringify(byRank) !== JSON.stringify(CHRONO)) fail(`Chronological labels ${byRank.join(', ')} ≠ Bible ${CHRONO.join(', ')}`);
const ORDER_MEM = ['20 → 3,000', '1 SHILLING.', '12 YEARS', 'WHAT DO THEY NEED FROM YOU?', '381 DAYS', 'WHO KNOWS THIS PLACE?', 'WE LIVE HERE.', 'BREAKFAST.', 'WE FOUND EACH OTHER.', '30 OF 1,500', 'DID YOU LOSE?', 'US HELPING US'];
stories.forEach((s, i) => { if (s.memory !== ORDER_MEM[i]) fail(`Story ${i + 1} memory "${s.memory}" ≠ "${ORDER_MEM[i]}"`); });
const s12 = stories[11];
if (!s12.silentComplete || !s12.hideXp) fail('Story 12 must complete silently and hide XP');

/* report */
const flags = Object.entries(C.sourceFlags).map(([k, v]) => `  ${v ? 'ON ' : 'off'}  ${k}`).join('\n');
console.log('ORGANIZE content check\n');
console.log(`Stories: ${stories.length}   Decisions: ${stories.map((s) => s.beats.filter((b) => b.type === 'decision').length).join(' ')}   XP total: ${total}`);
console.log(`Source-gated flags:\n${flags}\n`);
console.log(`Draft lines awaiting editor confirmation (${drafts.length}):`);
drafts.forEach((d) => console.log(`  - ${d.where}${d.requires ? ` [gated: ${d.requires}]` : ''}\n      "${d.text}"`));
console.log('');
if (failures.length) {
  console.log(`FAILED (${failures.length}):`);
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('All checks passed. Every non-draft story string appears verbatim in the Game Bible.');
