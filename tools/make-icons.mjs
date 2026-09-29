#!/usr/bin/env node
// Regenerates the PNG app icons from icons/icon.svg (dev only; needs Playwright).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  const g = execSync('npm root -g').toString().trim();
  ({ chromium } = createRequire(path.join(g, 'noop.js'))('playwright'));
}
const svg = fs.readFileSync(path.join(ROOT, 'icons/icon.svg'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();

async function render(size, file, pad = 0) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - pad * 2;
  await page.setContent(`<html><body style="margin:0;background:#0b0b0a;display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: path.join(ROOT, 'icons', file), omitBackground: false });
}
await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'icon-maskable-512.png', 56); // keep the mark inside the maskable safe zone
await render(180, 'apple-touch-icon.png');
await browser.close();
console.log('icons written');
