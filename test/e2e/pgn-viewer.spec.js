const { test, expect } = require('@playwright/test');

test.describe('PGN Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    // Wait for the app to initialize
    await page.waitForSelector('ct-pgn-viewer');
  });

  test('should display chess board correctly', async ({ page }) => {
    // Wait for puzzle to load
    await page.waitForTimeout(1000);

    // Check that viewer exists
    const viewer = await page.locator('ct-pgn-viewer');
    await expect(viewer).toBeVisible();

    // Check that there's no error message
    const viewerText = await viewer.textContent();
    expect(viewerText).not.toContain('Error parsing');
    expect(viewerText).not.toContain('Error processing');
  });

  test('should load PGN data correctly', async ({ page }) => {
    // Wait for puzzle to load
    await page.waitForTimeout(1000);

    const viewer = await page.locator('ct-pgn-viewer');
    const viewerText = await viewer.textContent();

    // Should contain PGN headers
    expect(viewerText).toContain('[Event');
    expect(viewerText).toContain('[FEN');
  });

  test('should update viewer when navigating puzzles', async ({ page }) => {
    // Wait for initial puzzle
    await page.waitForTimeout(1000);

    const viewer = await page.locator('ct-pgn-viewer');
    const initialContent = await viewer.textContent();

    // Click next button
    await page.click('#next-btn');
    await page.waitForTimeout(500);

    const newContent = await viewer.textContent();

    // Content should change
    expect(newContent).not.toBe(initialContent);
  });

  test('should display puzzle metadata in info panel', async ({ page }) => {
    // Wait for puzzle to load
    await page.waitForTimeout(1000);

    const infoPanel = await page.locator('#puzzle-info');
    const infoPanelText = await infoPanel.textContent();

    // Should contain metadata
    expect(infoPanelText).toContain('Event:');
    expect(infoPanelText).toContain('Difficulty:');
  });
});
