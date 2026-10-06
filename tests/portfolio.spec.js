const { test: base, expect } = require('@playwright/test');

// Observe every page before navigation, including reloads and new tabs.
const test = base.extend({
  browserErrors: [async ({ context }, use) => {
    const errors = [];
    const observe = (page) => page.on('pageerror', (error) => errors.push(error.message));
    context.pages().forEach(observe);
    context.on('page', observe);
    await use();
    expect(errors, 'Uncaught browser errors').toEqual([]);
  }, { auto: true }],
});

// The redesign renders a full-screen intro overlay (position:fixed; inset:0;
// z-index:200; pointer-events:auto) on the first visit, which covers the page
// and intercepts clicks. Seed the "seen" flag so tests exercise the actual app
// instead of the overlay. See static/redesign/intro.jsx.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('asoufi.intro.seen', '1'); } catch (e) {}
  });
  await page.goto('/');
});

test.describe('Portfolio', () => {
  // The scroll lock writes an inline style on <body>; '' means "unlocked".
  const bodyOverflow = (page) => page.evaluate(() => document.body.style.overflow);


  test('has the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Amjad Soufi/);
  });

  test('renders the hero heading and all primary sections', async ({ page }) => {
    // There is exactly one <h1> in the DOM (the hero title).
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Full-stack');

    for (const id of ['intro', 'about', 'skills', 'work', 'contact']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('nav scrolls to a section', async ({ page }) => {
    // Navigation is JS smooth-scroll (scrollToId), not anchor links, so there
    // is no URL hash to assert — assert the section actually reaches the viewport.
    await page.getByTestId('nav-link-work').click();
    await expect(page.locator('#work')).toBeInViewport({ ratio: 0.1 });
  });

  test('opens a project modal with content', async ({ page }) => {
    const card = page.getByTestId('project-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();

    const modal = page.getByTestId('project-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByTestId('modal-title')).not.toBeEmpty();
  });

  test('closes the project modal', async ({ page }) => {
    const card = page.getByTestId('project-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page.getByTestId('project-modal')).toBeVisible();

    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('project-modal')).toBeHidden();
  });

  test('mobile menu opens, navigates, and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const toggle = page.getByTestId('nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const drawer = page.getByTestId('nav-drawer');
    await expect(drawer).toBeVisible();

    await page.getByTestId('nav-drawer-link-skills').click();
    await expect(drawer).toBeHidden();
  });

  test('scroll lock is consistent across rapid modal open/close', async ({ page }) => {
    // Cycled through real UI actions: each open adds a holder and each close
    // releases it; the final state must always be restored. The compound
    // "release one holder while another remains" case is covered by the
    // overlapping intro + drawer test.
    for (let i = 0; i < 3; i++) {
      const card = page.getByTestId('project-card').first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await expect(page.getByTestId('project-modal')).toBeVisible();
      expect(await bodyOverflow(page)).toBe('hidden');

      await page.getByTestId('modal-close').click();
      await expect(page.getByTestId('project-modal')).toBeHidden();
      expect(await bodyOverflow(page)).toBe('');
    }
  });

  test('modal locks page scroll and restores it on close', async ({ page }) => {
    expect(await bodyOverflow(page)).toBe('');

    const card = page.getByTestId('project-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page.getByTestId('project-modal')).toBeVisible();
    expect(await bodyOverflow(page)).toBe('hidden');

    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('project-modal')).toBeHidden();
    expect(await bodyOverflow(page)).toBe('');
  });

  test('mobile drawer locks page scroll and restores it on close', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    expect(await bodyOverflow(page)).toBe('');

    const toggle = page.getByTestId('nav-toggle');
    await toggle.click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    expect(await bodyOverflow(page)).toBe('hidden');

    await toggle.click();
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
    expect(await bodyOverflow(page)).toBe('');
  });

  test('overlapping locks: intro releasing cannot unlock while the drawer is open', async ({ page }) => {
    // Freeze time so the intro's 900ms fade stays in flight while the drawer
    // opens — that guarantees a real overlap between two lock holders.
    await page.clock.install();
    await page.addInitScript(() => { try { localStorage.removeItem('asoufi.intro.seen'); } catch (e) {} });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const intro = page.locator('.intro');
    await expect(intro).toBeVisible();
    expect(await bodyOverflow(page)).toBe('hidden'); // holder 1: intro

    await page.keyboard.press('Escape'); // -> fading (pointer-events: none), still locked
    await page.getByTestId('nav-toggle').click(); // holder 2: drawer
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    expect(await bodyOverflow(page)).toBe('hidden');

    await page.clock.runFor(1000); // intro's fade timer fires and the intro unmounts
    await expect(intro).toBeHidden();
    expect(await bodyOverflow(page)).toBe('hidden'); // drawer still holds the lock

    await page.getByTestId('nav-toggle').click();
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
    expect(await bodyOverflow(page)).toBe('');
  });
});


test.describe('Regression checks', () => {
  test('mobile drawer traps focus and restores it after dismissal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const toggle = page.getByTestId('nav-toggle');
    const first = page.getByTestId('nav-drawer-link-intro');
    const last = page.getByTestId('nav-drawer-link-contact');
    await toggle.click();
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    for (const id of ['about', 'skills', 'work', 'contact']) {
      await page.keyboard.press('Tab');
      await expect(page.getByTestId(`nav-drawer-link-${id}`)).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('mobile drawer prevents background scrolling and restores the original position', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const initialY = await page.evaluate(() => window.scrollY);
    const heroTopBeforeOpen = await page.locator('#intro').evaluate((el) => el.getBoundingClientRect().top);
    await page.getByTestId('nav-toggle').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe('fixed');
    const heroTop = await page.locator('#intro').evaluate((el) => el.getBoundingClientRect().top);
    expect(heroTop).toBe(heroTopBeforeOpen);
    await page.mouse.move(180, 420);
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(100);
    expect(await page.locator('#intro').evaluate((el) => el.getBoundingClientRect().top)).toBe(heroTop);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(initialY);
    expect(await page.evaluate(() => document.body.style.position)).toBe('');
  });

  test('desktop resize closes the drawer and releases scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByTestId('nav-toggle').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.setViewportSize({ width: 1000, height: 700 });
    await expect(page.getByTestId('nav-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
    await expect(page.getByRole('button', { name: 'Amjad Soufi — back to top' })).toBeFocused();
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('nav-drawer')).toBeHidden();
  });

  test('project modal traps initial container focus and restores the opener', async ({ page }) => {
    const card = page.getByTestId('project-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    const modal = page.getByTestId('project-modal');
    const first = page.getByTestId('modal-close');
    const last = modal.locator('a').last();
    await expect(modal).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await modal.focus();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(card).toBeFocused();
  });

  test('contact links and clipboard use the new email', async ({ page }) => {
    const email = 'amjadsoufi5588@gmail.com';
    const mailLinks = page.locator('a[href^="mailto:"]');
    await expect(mailLinks).toHaveCount(2);
    for (const link of await mailLinks.all()) {
      await expect(link).toHaveAttribute('href', `mailto:${email}`);
    }
    await expect(page.locator('.hero-socials')).toContainText(email);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (text) => { window.copiedEmail = text; } },
      });
    });
    const copy = page.locator('.email-val');
    await copy.scrollIntoViewIfNeeded();
    await copy.click();
    await expect(copy).toContainText('copied ✓');
    expect(await page.evaluate(() => window.copiedEmail)).toBe(email);
  });

  test('contact fallback uses the new email without JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(baseURL);
      await expect(page.locator('#contact a')).toHaveAttribute('href', 'mailto:amjadsoufi5588@gmail.com');
      await expect(page.locator('#intro')).toContainText('amjadsoufi5588@gmail.com');
    } finally {
      await context.close();
    }
  });

  test('filters projects and preserves the editorial theme toggle', async ({ page }) => {
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#work .chip').filter({ hasText: /^React$/ }).click();
    await expect(page.getByTestId('project-card')).toHaveCount(1);
    await expect(page.getByTestId('project-card')).toContainText('Kanban App');
    await page.locator('#work .chip-all').click();
    await expect(page.getByTestId('project-card')).toHaveCount(5);
  });
});

test.describe('Brussels clock', () => {
  // A visitor in another timezone must still see the portfolio's local time.
  test.use({ timezoneId: 'America/New_York' });
  for (const [season, date, expected] of [
    ['winter', '2026-01-15T12:00:00Z', /13:00 (CET|GMT\+1)/],
    ['summer', '2026-07-15T12:00:00Z', /14:00 (CEST|GMT\+2)/],
  ]) {
    test(`shows Brussels ${season} time`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(date));
      await page.reload();
      await expect(page.getByTestId('brussels-clock')).toHaveText(expected);
    });
  }
});
