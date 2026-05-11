const { test, expect } = require('@playwright/test');

test.describe('Portfolio Tests', () => {
  test.beforeEach(async ({ page }) => {
    // We use the baseURL from playwright.config.js
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Amjad Soufi/);
  });

  test('should have the main heading', async ({ page }) => {
    const heading = page.locator('h1.hero__title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Full Stack');
  });

  test('should navigate to sections when clicking nav links', async ({ page }) => {
    const aboutLink = page.locator('.header__link[href="#about"]');
    await aboutLink.click();
    await expect(page).toHaveURL(/#about/);
  });

  test('should open project modal on click', async ({ page }) => {
    // Find the first project "Details" button
    const firstProjectDetails = page.locator('.project-card button').first();
    
    // Scroll to it to trigger animations
    await firstProjectDetails.scrollIntoViewIfNeeded();
    
    // Wait for animation to finish (opacity 0 -> 1)
    await expect(firstProjectDetails).toBeVisible({ timeout: 10000 });
    await firstProjectDetails.click();
    
    // Check if modal is visible
    const modal = page.locator('#projectModal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toHaveClass(/active/);
    
    // Check if modal has content
    const modalTitle = page.locator('#modalTitle');
    await expect(modalTitle).not.toBeEmpty();
  });

  test('should close modal when clicking close button', async ({ page }) => {
    // Open modal first
    const firstProjectDetails = page.locator('.project-card button').first();
    await firstProjectDetails.scrollIntoViewIfNeeded();
    await firstProjectDetails.click();
    
    await expect(page.locator('#projectModal')).toBeVisible();

    // Click close button
    const closeBtn = page.locator('.modal__close');
    await closeBtn.click();
    
    // Check if modal is hidden
    await expect(page.locator('#projectModal')).not.toBeVisible();
  });

  test('mobile menu should work', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburger = page.locator('.header__hamburger');
    await expect(hamburger).toBeVisible();
    
    await hamburger.click();
    
    const mobileNav = page.locator('.mobile-nav');
    await expect(mobileNav).toBeVisible({ timeout: 5000 });
    await expect(mobileNav).toHaveClass(/active/);
    
    // Click a link and check if it closes
    await mobileNav.locator('a[href="#skills"]').click();
    await expect(mobileNav).not.toBeVisible({ timeout: 5000 });
  });
});
