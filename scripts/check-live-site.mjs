import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const result = { url, widths: [], articleReading: false, productViewer: false, video: false, reducedMotion: false };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const failedLocal = [];
  const base = new URL(url);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    const resource = new URL(response.url());
    if (resource.origin === base.origin && response.status() >= 400) failedLocal.push(`${response.status()} ${resource.pathname}`);
  });
  assert.equal((await page.goto(url, { waitUntil: 'networkidle' })).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.match(await page.title(), /梁梓煜/);
  assert((await page.locator('body').innerText()).includes('28届深圳大学网络与新媒体'));
  assert.equal(await page.locator('.research-hall,.content-hall,.experiment-hall').count(), 3);
  assert.equal(await page.locator('a[href^="mailto:"],a[href^="tel:"]').count(), 0);
  await page.locator('.article-paper-heading h4').nth(1).waitFor();
  await page.getByRole('button', { name: '展开阅读全文', exact: true }).first().click();
  const article = page.locator('.article-dialog');
  await article.locator('.article-full h2').waitFor();
  assert((await article.innerText()).includes('梁梓煜'));
  assert((await article.locator('.article-prose p').count()) > 50);
  await article.locator('.article-prose img').evaluateAll(images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })));
  await page.keyboard.press('Escape');
  assert.equal(await article.count(), 0);
  result.articleReading = true;
  await page.getByRole('button', { name: '展开热点显微镜', exact: true }).click();
  await page.locator('.exhibit-viewer[open] iframe').waitFor();
  assert.match(await page.locator('.exhibit-viewer iframe').getAttribute('src'), /^https:\/\/hotscope/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('iframe').count(), 0);
  result.productViewer = true;
  await page.getByRole('button', { name: '展开逃离后室', exact: true }).click();
  const video = page.locator('.exhibit-viewer video');
  await video.evaluate(el => new Promise((resolve, reject) => {
    if (el.readyState >= 1) return resolve();
    el.addEventListener('loadedmetadata', resolve, { once: true });
    el.addEventListener('error', () => reject(new Error('Video failed to load')), { once: true });
  }));
  assert(await video.evaluate(el => el.duration > 0));
  await page.keyboard.press('Escape');
  result.video = true;
  for (const width of [320, 390, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(180);
    const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
    assert.equal(dimensions.width, dimensions.content, `Horizontal overflow at ${width}`);
    result.widths.push(width);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.type-inner').first().evaluate(el => getComputedStyle(el).transform), 'none');
  result.reducedMotion = true;
  assert.deepEqual(errors, []);
  assert.deepEqual(failedLocal, []);
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/site-check.json', JSON.stringify({ ...result, errors, failedLocal }, null, 2));
  console.log(JSON.stringify({ ...result, errors, failedLocal }, null, 2));
} finally {
  await browser.close();
}
