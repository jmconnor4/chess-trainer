const { test, expect } = require('@playwright/test');

test.describe('Welcome Modal', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
  });

  test('should display welcome modal on first visit', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('#welcome-modal');
    await expect(modal).toBeVisible();
  });

  test('should have proper modal structure', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('#welcome-modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-labelledby', 'welcome-title');
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    const title = await page.locator('#welcome-title');
    await expect(title).toContainText('Welcome to Chess Puzzle Trainer');
  });

  test('should display three welcome steps', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const steps = await page.locator('.welcome-step');
    const count = await steps.count();
    expect(count).toBe(3);

    // Check step content
    await expect(steps.nth(0).locator('h3')).toContainText('Study the Position');
    await expect(steps.nth(1).locator('h3')).toContainText('Make Your Moves');
    await expect(steps.nth(2).locator('h3')).toContainText('Learn & Progress');
  });

  test('should close modal when clicking Start Learning button', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('#welcome-modal');
    await expect(modal).toBeVisible();

    const closeBtn = await page.locator('#close-welcome-btn');
    await closeBtn.click();

    await expect(modal).not.toBeVisible();
  });

  test('should not show modal again when "Don\'t show again" is checked', async ({ page, context }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    // Check the "don't show again" checkbox
    await page.check('#dont-show-again');

    // Close the modal
    await page.click('#close-welcome-btn');
    await page.waitForTimeout(300);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(500);

    // Modal should not appear
    const modal = await page.locator('#welcome-modal');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('#welcome-modal');
    await expect(modal).toBeVisible();

    // Click on backdrop
    const backdrop = await page.locator('.modal-backdrop');
    await backdrop.click();

    await expect(modal).not.toBeVisible();
  });

  test('should close modal on Escape key', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('#welcome-modal');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(modal).not.toBeVisible();
  });

  test('should have accessible step icons', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const icons = await page.locator('.welcome-step .step-icon');
    const count = await icons.count();

    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      await expect(icon).toHaveAttribute('role', 'img');
      await expect(icon).toHaveAttribute('aria-label');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(500);

    const modal = await page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Check that modal fits on screen
    const boundingBox = await modal.boundingBox();
    expect(boundingBox.width).toBeLessThanOrEqual(375);
  });
});
