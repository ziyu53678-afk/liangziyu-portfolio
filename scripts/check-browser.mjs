import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(origin, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('梁梓煜');
  await expect(page.getByText('关于我与联系', { exact: true })).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"],a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  results.push('首页署名、删除联系板块、产品按需加载通过');

  for (const [width, height] of [[320, 780], [390, 844], [768, 1024], [820, 1180], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.locator('.stats-grid').scrollIntoViewIfNeeded();
    await expect(page.locator('.stats-grid')).toContainText('500万+');
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 250));
      window.scrollTo(0, 0);
    });
    const findings = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      failedImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src),
      missingNames: [...document.querySelectorAll('button,a')].filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.querySelector('img[alt]')).length,
      overlappingStats: (() => {
        const boxes = [...document.querySelectorAll('.stats-grid strong > span')].map(el => el.getBoundingClientRect());
        return boxes.some((box, index) => boxes[index + 1] && box.right + 4 > boxes[index + 1].left);
      })(),
    }));
    expect(findings.overflow, `${width}px 不应横向溢出`).toBe(false);
    expect(findings.failedImages, `${width}px 图片加载`).toEqual([]);
    expect(findings.missingNames, '所有控件有名称').toBe(0);
    expect(findings.overlappingStats, `${width}px 运营数字间距`).toBe(false);
    results.push(`${width}×${height}：无横向溢出、图片完整、控件名称完整`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.locator('#mobile-navigation')).toBeVisible();
  await page.locator('#mobile-navigation').getByRole('link', { name: '产品实验' }).click();
  await expect(page.getByRole('button', { name: '打开导航', exact: true })).toHaveAttribute('aria-expanded', 'false');
  results.push('手机导航打开、跳转及自动关闭通过');

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const label of ['查看调研项目', '查看运营案例', '查看实习案例', '播放逃离后室演示']) {
    await page.getByRole('button', { name: label, exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    if (label === '播放逃离后室演示') {
      await page.locator('video.detail-video').evaluate(async video => {
        video.muted = true;
        await video.play();
        await new Promise(resolve => setTimeout(resolve, 250));
        if (!video.videoWidth || !video.duration) throw new Error('视频未正常解码');
        video.pause();
      });
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  results.push('调研、运营、实习、视频窗口和 Escape 关闭通过；视频正常解码');

  await page.getByRole('button', { name: '查看工作流', exact: true }).click();
  await page.getByRole('tab', { name: '配图', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('图像接口');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: '创建草稿' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: '关闭项目窗口' }).click();
  results.push('工作流节点点击与键盘切换通过');

  for (const [label, text] of [['打开热点显微镜交互窗口', '热搜显微镜'], ['打开流年交互窗口', '流年'], ['体验年度报告', 'REPLAY']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const frame = page.frameLocator('iframe');
    await expect(frame.locator('body')).toContainText(text, { timeout: 45000 });
    if (text === '热搜显微镜') {
      await frame.getByText('进入研究中心', { exact: true }).click();
      await expect(frame.locator('body')).toContainText('舆情', { timeout: 15000 });
    }
    if (text === '流年') {
      await frame.getByRole('link', { name: '搜索', exact: true }).click();
      await expect(frame.locator('input').first()).toBeVisible();
    }
    await page.getByRole('button', { name: '关闭项目窗口' }).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    results.push(`${text}：真实 iframe 加载与退出通过`);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await expect(page.locator('.hero-name')).toBeVisible();
  await page.locator('.stats-grid').scrollIntoViewIfNeeded();
  await expect(page.locator('.stats-grid')).toContainText('500万+');
  results.push('减少动态效果：姓名可见、数字完整');
  expect(errors).toEqual([]);
  results.push('无作品集页面 JavaScript 异常');
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/browser-check.json', JSON.stringify({ passed: true, origin, results, errors }, null, 2));
  console.log(results.join('\n'));
} catch (error) {
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/browser-check.json', JSON.stringify({ passed: false, origin, results, errors, failure: String(error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
