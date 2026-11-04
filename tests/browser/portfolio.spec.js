import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { statSync } from 'node:fs';

const calm = async (page) => page.addInitScript(() => localStorage.setItem('sk-motion', 'off'));

test('renders the hero, live snapshot, and a working 3D sculpture', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Code with character.' })).toBeVisible();
  await expect(page.locator('.sculpture-canvas')).toHaveClass(/is-ready/, { timeout: 20000 });
  await expect(page.locator('.activity-summary strong')).toHaveText('37');
  await expect(page.locator('.project-card')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('navigation and project dialogs work with keyboard and focus return', async ({ page }) => {
  await calm(page);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: /Work/ }).click();
  await expect(page).toHaveURL(/#work$/);
  const trigger = page.getByRole('button', { name: 'Explore the Gradient Lab case study' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Gradient Lab/ })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Visit the live site' })).toHaveAttribute('href', 'https://gradientlab09.vercel.app');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('the mini gradient lab edits, copies, and exports a real image', async ({ page }) => {
  await calm(page);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#playground');
  await page.getByRole('button', { name: 'Blue hour' }).click();
  await page.getByRole('button', { name: 'conic', exact: true }).click();
  const angle = page.getByRole('slider', { name: 'ANGLE' });
  await angle.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.css-output')).toContainText('conic-gradient(from 360deg');
  await expect(page.locator('.css-output')).toContainText('#172c50');
  await page.getByRole('button', { name: 'Copy CSS' }).click();
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('conic-gradient');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save wallpaper' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('sayak-blue-hour.png');
  expect(statSync(await download.path()).size).toBeGreaterThan(1000);
});

test('contact form validates honestly and prepares an email draft', async ({ page }) => {
  await calm(page);
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Start a conversation with Sayak' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Prepare my message' }).click();
  await expect(dialog.locator('#error-name')).toBeVisible();
  await expect(dialog.locator('#error-email')).toBeVisible();
  await expect(dialog.locator('#error-message')).toBeVisible();
  await dialog.getByLabel('Your name').fill('Alex Morgan');
  await dialog.getByLabel('Your email').fill('alex@example.com');
  await dialog.getByLabel('What brings you here?').selectOption('A creative project');
  await dialog.getByLabel(/A little about your idea/).fill('I would love to collaborate on an expressive, accessible portfolio website.');
  await dialog.getByRole('button', { name: 'Prepare my message' }).click();
  await expect(dialog.getByRole('heading', { name: /A good start/ })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Open my email app' })).toHaveAttribute('href', /^mailto:codewithsayak@gmail.com\?subject=/);
  await expect(dialog.getByText('Nothing has been sent or stored on this website.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('mobile navigation, layout, and dialogs stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await calm(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Start a conversation with Sayak' }).click();
  const box = await page.getByRole('dialog').boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('reduced motion is respected and can be overridden explicitly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  expect(await page.locator('.project-card').first().evaluate((node) => getComputedStyle(node).position)).toBe('relative');
  expect(await page.locator('.manifesto-word').first().evaluate((node) => getComputedStyle(node).opacity)).toBe('1');
  await page.getByRole('button', { name: 'Enable animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
});

test('scroll-driven project stacking actually transforms the first card', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const second = document.querySelectorAll('.project-card')[1];
    window.scrollTo(0, second.getBoundingClientRect().top + window.scrollY - 220);
  });
  await page.waitForTimeout(1200);
  const first = page.locator('.project-card').first();
  expect(await first.evaluate((node) => getComputedStyle(node).position)).toBe('sticky');
  const scale = await first.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).a);
  expect(scale).toBeLessThan(1);
  expect(scale).toBeGreaterThan(0.9);
});

test('the journey unfolds horizontally while pinned, and can be skipped', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#journey')).toHaveClass(/is-cinematic/);
  await page.evaluate(() => document.fonts.ready);
  const start = await page.locator('.journey-cinema').evaluate((node) => node.getBoundingClientRect().top + window.scrollY - 88);
  await page.evaluate((y) => window.scrollTo(0, y + 1200), start);
  await expect.poll(() => page.locator('.journey-track').evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41)).toBeLessThan(-500);
  await expect(page.locator('.journey-progress > .micro > span').first()).not.toHaveText('01');
  expect(await page.locator('.journey-pin').evaluate((node) => getComputedStyle(node).position)).toBe('fixed');
  await page.getByRole('link', { name: 'Skip to the build log' }).click();
  await expect(page).toHaveURL(/#activity$/);
  await expect(page.locator('#activity')).toBeInViewport();
});

test('the journey stays vertical and readable on mobile and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.journey-step')).toHaveCount(4);
  expect(await page.locator('#journey').evaluate((node) => node.classList.contains('is-cinematic'))).toBe(false);
  expect(await page.locator('.journey-progress').evaluate((node) => getComputedStyle(node).display)).toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  expect(await page.locator('#journey').evaluate((node) => node.classList.contains('is-cinematic'))).toBe(false);
  await expect(page.locator('.journey-step')).toHaveCount(4);
});

test('pausing motion inside the pinned journey restores the static layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#journey')).toHaveClass(/is-cinematic/);
  const start = await page.locator('.journey-cinema').evaluate((node) => node.getBoundingClientRect().top + window.scrollY - 88);
  await page.evaluate((y) => window.scrollTo(0, y + 900), start);
  await expect.poll(() => page.locator('.journey-track').evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41)).toBeLessThan(-300);
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('#journey')).not.toHaveClass(/is-cinematic/);
  expect(await page.locator('.journey-track').evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('page and dialogs pass automated WCAG A/AA checks', async ({ page }) => {
  await calm(page);
  await page.goto('/');
  const scan = async () => (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
  expect(await scan()).toEqual([]);
  await page.locator('#journey').scrollIntoViewIfNeeded();
  expect(await scan()).toEqual([]);
  await page.getByRole('button', { name: 'Explore the Developer Portfolio case study' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await scan()).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start a conversation with Sayak' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await scan()).toEqual([]);
});
