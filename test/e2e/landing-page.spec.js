const { test, expect } = require('@playwright/test');

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/landing.html');
  });

  test('should display hero section with main heading', async ({ page }) => {
    const heading = await page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Master Chess Tactics');
  });

  test('should display hero subtitle', async ({ page }) => {
    const subtitle = await page.locator('.hero-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('Sharpen your tactical vision');
  });

  test('should have working Start Training button', async ({ page }) => {
    const ctaButton = await page.locator('#start-training-btn');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText('Start Training');

    // Check link href
    const href = await ctaButton.getAttribute('href');
    expect(href).toBe('/puzzles.html');
  });

  test('should display three feature cards', async ({ page }) => {
    const featureCards = await page.locator('.feature-card');
    const count = await featureCards.count();
    expect(count).toBe(3);

    // Check feature card headings
    await expect(page.locator('.feature-card h3').nth(0)).toContainText('Real Game Positions');
    await expect(page.locator('.feature-card h3').nth(1)).toContainText('Difficulty Levels');
    await expect(page.locator('.feature-card h3').nth(2)).toContainText('Thematic Training');
  });

  test('should display How It Works section', async ({ page }) => {
    const howItWorksHeading = await page.locator('.how-it-works h2');
    await expect(howItWorksHeading).toBeVisible();
    await expect(howItWorksHeading).toContainText('How It Works');
  });

  test('should display three steps', async ({ page }) => {
    const steps = await page.locator('.steps li');
    const count = await steps.count();
    expect(count).toBe(3);

    // Check step numbers
    await expect(page.locator('.step-number').nth(0)).toContainText('1');
    await expect(page.locator('.step-number').nth(1)).toContainText('2');
    await expect(page.locator('.step-number').nth(2)).toContainText('3');
  });

  test('should have secondary CTA button', async ({ page }) => {
    const secondaryCta = await page.locator('.cta-button-secondary');
    await expect(secondaryCta).toBeVisible();
    await expect(secondaryCta).toContainText('Begin Your Journey');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const heroSection = await page.locator('.hero-section');
    await expect(heroSection).toBeVisible();

    const featureGrid = await page.locator('.feature-grid');
    await expect(featureGrid).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check page title
    const title = await page.title();
    expect(title).toContain('Chess Puzzle Trainer');

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Master chess tactics/);

    // Check ARIA labels on icons
    const icons = await page.locator('.feature-icon');
    const firstIcon = icons.nth(0);
    await expect(firstIcon).toHaveAttribute('aria-label');
  });

  test('should navigate to puzzles page when clicking CTA', async ({ page }) => {
    await page.click('#start-training-btn');
    await page.waitForURL('**/puzzles.html');
    expect(page.url()).toContain('/puzzles.html');
  });
});
