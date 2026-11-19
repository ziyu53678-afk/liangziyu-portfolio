import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/flow-gallery.html');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.article-paper-heading h4').nth(1).waitFor();
  await page.waitForTimeout(500);

  const papers = page.locator('.article-paper');
  assert.equal(await papers.count(), 2);
  await page.evaluate(() => {
    const target = document.querySelector('.report-card').closest('.research-card');
    scrollTo(0, target.getBoundingClientRect().top + scrollY - 110);
  });
  await page.waitForTimeout(700);
  await papers.first().getByRole('button', { name: '在卡片中阅读', exact: true }).click();
  const cardScroll = papers.first().locator('.article-scroll');
  assert.equal(await papers.first().getAttribute('class'), 'article-paper is-reading');
  const pageBefore = await page.evaluate(() => scrollY);
  await cardScroll.hover();
  await page.mouse.wheel(0, 650);
  await page.waitForTimeout(450);
  const innerScroll = await cardScroll.evaluate(el => el.scrollTop);
  assert(innerScroll > 100, 'Wheel should scroll article text');
  assert(Math.abs(await page.evaluate(() => scrollY) - pageBefore) < 3, 'Article reading should not move exhibition');
  assert(Number(await papers.first().getByRole('progressbar').getAttribute('aria-valuenow')) > 0);
  await cardScroll.focus();
  await page.keyboard.press('Escape');
  assert.equal(await papers.first().getByRole('button', { name: '在卡片中阅读', exact: true }).getAttribute('aria-pressed'), 'false');
  await page.screenshot({ path: 'artifacts/article-card-desktop.png' });

  for (let index = 0; index < 2; index++) {
    if (index === 1) {
      await page.evaluate(() => {
        const target = document.querySelector('.commerce-card').closest('.research-card');
        scrollTo(0, target.getBoundingClientRect().top + scrollY - 110);
      });
      await page.waitForTimeout(600);
    }
    await papers.nth(index).getByRole('button', { name: '展开全文', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.article-full h2').waitFor();
    assert(await dialog.locator('.article-prose p').count() > 50, 'Full article body must be present');
    assert(await dialog.locator('.article-prose img').count() >= 8, 'Original figures must be included');
    if (index === 0) assert((await dialog.innerText()).includes('梁梓煜'), 'Original writing byline must be preserved');
    const body = dialog.locator('.article-dialog-scroll');
    await body.evaluate(async el => {
      for (let y = 0; y < el.scrollHeight; y += 650) {
        el.scrollTop = y;
        await new Promise(resolve => setTimeout(resolve, 35));
      }
    });
    await page.waitForTimeout(800);
    await dialog.locator('img').evaluateAll(images => Promise.all(images.map(async image => {
      image.loading = 'eager';
      await image.decode();
    })));
    const broken = await dialog.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
    assert.deepEqual(broken, [], 'All article figures must load');
    await body.evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: `artifacts/article-full-${index}-desktop.png` });
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  }

  const responsive = [];
  for (const width of [320, 390, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(180);
    const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
    assert.equal(dimensions.width, dimensions.content, `Page overflows at ${width}`);
    responsive.push(dimensions);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/flow-gallery.html');
  await papers.first().locator('.article-paper-heading h4').waitFor();
  await papers.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/article-card-mobile.png' });
  await papers.first().getByRole('button', { name: '展开全文', exact: true }).click();
  await page.getByRole('dialog').locator('.article-full h2').waitFor();
  const dialogFits = await page.locator('.article-dialog-scroll').evaluate(el => el.scrollWidth <= el.clientWidth);
  assert(dialogFits, 'Mobile full article should fit');
  await page.screenshot({ path: 'artifacts/article-full-mobile.png' });
  await page.getByRole('button', { name: '关闭文章', exact: true }).click();

  await page.route('**/articles/luckin.json', route => route.abort());
  await page.reload();
  await page.getByText('正文暂时无法载入', { exact: true }).waitFor();
  await page.unroute('**/articles/luckin.json');
  await page.getByRole('button', { name: '重新载入', exact: true }).click();
  await papers.first().locator('.article-paper-heading h4').waitFor();
  assert.deepEqual(errors, []);
  const result = { articles: 2, originalImages: 'loaded', cardWheel: innerScroll, exhibitionStayedStill: true, escapeAndFocus: 'passed', responsive, mobileDialog: 'fits', retry: 'passed', errors };
  writeFileSync('artifacts/article-check.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
