const { test, expect } = require('@playwright/test');

test.describe('Enhanced Info Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForSelector('#puzzle-info');
    await page.waitForTimeout(1000); // Wait for puzzle to load
  });

  test('should display puzzle hero section with difficulty badge', async ({ page }) => {
    const puzzleHero = await page.locator('.puzzle-hero');
    await expect(puzzleHero).toBeVisible();

    const difficultyBadge = await page.locator('.difficulty-badge');
    await expect(difficultyBadge).toBeVisible();

    // Should have difficulty text
    const badgeText = await difficultyBadge.textContent();
    expect(badgeText).toBeTruthy();
  });

  test('should display puzzle title', async ({ page }) => {
    const puzzleTitle = await page.locator('.puzzle-title');
    await expect(puzzleTitle).toBeVisible();

    const titleText = await puzzleTitle.textContent();
    expect(titleText.length).toBeGreaterThan(0);
  });

  test('should display theme tags', async ({ page }) => {
    const themeTags = await page.locator('.theme-tags');
    await expect(themeTags).toBeVisible();

    const tags = await page.locator('.theme-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display learning objective section', async ({ page }) => {
    const learningSection = await page.locator('.learning-section');
    await expect(learningSection).toBeVisible();

    const objectiveText = await page.locator('.objective-text');
    await expect(objectiveText).toBeVisible();

    const text = await objectiveText.textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should have collapsible hints section', async ({ page }) => {
    const hintToggle = await page.locator('.hint-toggle');
    await expect(hintToggle).toBeVisible();

    // Initially hidden
    const hintContent = await page.locator('#hint-content');
    await expect(hintContent).not.toHaveClass(/visible/);

    // Click to reveal
    await hintToggle.click();
    await expect(hintContent).toHaveClass(/visible/);

    // Click again to hide
    await hintToggle.click();
    await expect(hintContent).not.toHaveClass(/visible/);
  });

  test('should display metadata grid with game details', async ({ page }) => {
    const metadataSection = await page.locator('.metadata-section');
    await expect(metadataSection).toBeVisible();

    const metadataItems = await page.locator('.metadata-item');
    const count = await metadataItems.count();
    expect(count).toBe(4); // White, Black, Date, Result

    // Check for labels
    await expect(page.locator('.metadata-label').nth(0)).toContainText('WHITE');
    await expect(page.locator('.metadata-label').nth(1)).toContainText('BLACK');
    await expect(page.locator('.metadata-label').nth(2)).toContainText('DATE');
    await expect(page.locator('.metadata-label').nth(3)).toContainText('RESULT');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const learningSection = await page.locator('.learning-section');
    await expect(learningSection).toHaveAttribute('aria-labelledby', 'objective-heading');

    const metadataSection = await page.locator('.metadata-section');
    await expect(metadataSection).toHaveAttribute('aria-labelledby', 'metadata-heading');

    const hintToggle = await page.locator('.hint-toggle');
    await expect(hintToggle).toHaveAttribute('aria-expanded');
    await expect(hintToggle).toHaveAttribute('aria-controls', 'hint-content');
  });

  test('should update info panel when navigating puzzles', async ({ page }) => {
    const initialTitle = await page.locator('.puzzle-title').textContent();

    // Navigate to next puzzle
    await page.click('#next-btn');
    await page.waitForTimeout(500);

    const newTitle = await page.locator('.puzzle-title').textContent();
    expect(newTitle).not.toBe(initialTitle);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for section elements
    const sections = await page.locator('.info-panel section');
    const count = await sections.count();
    expect(count).toBe(3); // learning, hints, metadata

    // Check for dl/dt/dd in metadata
    const dl = await page.locator('.metadata-grid');
    await expect(dl).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const puzzleHero = await page.locator('.puzzle-hero');
    await expect(puzzleHero).toBeVisible();

    const metadataGrid = await page.locator('.metadata-grid');
    await expect(metadataGrid).toBeVisible();
  });
});
