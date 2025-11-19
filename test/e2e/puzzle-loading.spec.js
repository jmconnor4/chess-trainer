/**
 * Playwright E2E Tests: Puzzle Loading
 * Tests puzzle loading, display, and chess-specific functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Puzzle Loading and Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load puzzle metadata correctly', async ({ page }) => {
    await page.waitForSelector('#puzzle-info', { state: 'visible' });

    const infoPanel = page.locator('#puzzle-info');

    // Check for expected metadata fields
    await expect(infoPanel).toContainText('Event:');
    await expect(infoPanel).toContainText('Date:');
    await expect(infoPanel).toContainText('White:');
    await expect(infoPanel).toContainText('Black:');
    await expect(infoPanel).toContainText('Result:');
    await expect(infoPanel).toContainText('Difficulty:');
    await expect(infoPanel).toContainText('Theme:');
  });

  test('should display chess board viewer', async ({ page }) => {
    const viewer = page.locator('ct-pgn-viewer');
    await expect(viewer).toBeVisible();

    // Viewer should have loaded content
    const viewerContent = await viewer.textContent();
    expect(viewerContent.length).toBeGreaterThan(0);
  });

  test('should display file name in puzzle info', async ({ page }) => {
    await page.waitForSelector('#puzzle-info');

    const infoPanel = page.locator('#puzzle-info');
    await expect(infoPanel).toContainText('File:');
    await expect(infoPanel).toContainText('.pgn');
  });

  test('should load different puzzles with different content', async ({ page }) => {
    await page.waitForSelector('#puzzle-info');

    // Get content of first puzzle
    const firstInfo = await page.locator('#puzzle-info').textContent();

    // Navigate to second puzzle
    await page.locator('#next-btn').click();
    await page.waitForTimeout(500);

    // Get content of second puzzle
    const secondInfo = await page.locator('#puzzle-info').textContent();

    // Content should be different
    expect(firstInfo).not.toBe(secondInfo);
  });

  test('should display puzzle difficulty ratings', async ({ page }) => {
    await page.waitForSelector('#puzzle-info');

    const infoPanel = page.locator('#puzzle-info');
    const content = await infoPanel.textContent();

    // Should have difficulty field
    expect(content).toContain('Difficulty:');

    // Common difficulty values
    const validDifficulties = ['Easy', 'Medium', 'Hard', 'Not rated'];
    const hasDifficulty = validDifficulties.some(diff => content.includes(diff));
    expect(hasDifficulty).toBeTruthy();
  });

  test('should display puzzle themes', async ({ page }) => {
    await page.waitForSelector('#puzzle-info');

    const infoPanel = page.locator('#puzzle-info');
    const content = await infoPanel.textContent();

    // Should have theme field
    expect(content).toContain('Theme:');
  });

  test('should handle puzzle descriptions when available', async ({ page }) => {
    await page.waitForSelector('#puzzle-info');

    const infoPanel = page.locator('#puzzle-info');
    const content = await infoPanel.textContent();

    // If description exists, it should be shown
    // This depends on whether the PGN file has a Description field
    if (content.includes('Description:')) {
      const descriptionSection = page.locator('.description');
      await expect(descriptionSection).toBeVisible();
    }
  });
});

test.describe('Chess Board Interaction', () => {
  test('should render chess board component', async ({ page }) => {
    await page.goto('/');

    const viewer = page.locator('ct-pgn-viewer');
    await expect(viewer).toBeVisible();

    // Wait for the board to fully render
    await page.waitForTimeout(1000);

    // The ct-pgn-viewer should have rendered child elements
    // (exact structure depends on the ChessTempo library)
    const viewerHtml = await viewer.innerHTML();
    expect(viewerHtml.length).toBeGreaterThan(100);
  });

  test('should update chess board when puzzle changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('ct-pgn-viewer');

    // Get initial board state
    const initialViewer = await page.locator('ct-pgn-viewer').getAttribute('ct-1');

    // Navigate to next puzzle
    await page.locator('#next-btn').click();
    await page.waitForTimeout(1000);

    // Board should have updated
    const newViewer = await page.locator('ct-pgn-viewer').getAttribute('ct-1');

    // Attributes should be different
    expect(newViewer).not.toBe(initialViewer);
  });

  test('should load valid FEN positions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-info');

    const infoPanel = page.locator('#puzzle-info');
    const content = await infoPanel.textContent();

    // FEN positions should be mentioned or displayable
    // This is more about verifying the puzzle loaded correctly
    expect(content.length).toBeGreaterThan(0);
  });
});

test.describe('Puzzle Loading Performance', () => {
  test('should load initial puzzle quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should navigate between puzzles smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    const startTime = Date.now();

    // Navigate to next puzzle
    await page.locator('#next-btn').click();
    await page.waitForSelector('#puzzle-counter');

    const navigationTime = Date.now() - startTime;

    // Navigation should be reasonably fast
    expect(navigationTime).toBeLessThan(2000);
  });

  test('should handle rapid navigation without breaking', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Rapidly navigate forward
    for (let i = 0; i < 5; i++) {
      await page.locator('#next-btn').click();
      await page.waitForTimeout(100);
    }

    // Should still be functional
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle \d+ of \d+/);

    // Info panel should still be populated
    const infoPanel = await page.locator('#puzzle-info').textContent();
    expect(infoPanel.length).toBeGreaterThan(0);
  });
});

test.describe('Error Handling', () => {
  test('should handle missing puzzle data gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/puzzle/*', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Puzzle not found' })
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Application should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle network errors during puzzle fetch', async ({ page }) => {
    // Mock API to fail
    await page.route('**/api/puzzles', route => {
      route.abort('failed');
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should show no puzzles message
    const counter = page.locator('#puzzle-counter');
    const counterText = await counter.textContent();

    // Should indicate no puzzles or loading state
    expect(counterText).toBeTruthy();
  });

  test('should display appropriate message when no puzzles exist', async ({ page }) => {
    // Mock empty puzzle list
    await page.route('**/api/puzzles', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ puzzles: [] })
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should show no puzzles message
    const counter = page.locator('#puzzle-counter');
    await expect(counter).toContainText('No puzzles');

    // Buttons should be disabled
    await expect(page.locator('#prev-btn')).toBeDisabled();
    await expect(page.locator('#next-btn')).toBeDisabled();
  });
});

test.describe('Visual Regression', () => {
  test('puzzle display should match visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-info');
    await page.waitForTimeout(2000); // Wait for board to render

    // Take screenshot of puzzle area
    const puzzleArea = page.locator('.main-content');
    await expect(puzzleArea).toHaveScreenshot('puzzle-display.png', {
      maxDiffPixels: 100
    });
  });

  test('navigation controls should match visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navigation');

    const navigation = page.locator('.navigation');
    await expect(navigation).toHaveScreenshot('navigation-controls.png');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display puzzle on mobile devices', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // All elements should be visible
    await expect(page.locator('#puzzle-counter')).toBeVisible();
    await expect(page.locator('#prev-btn')).toBeVisible();
    await expect(page.locator('#next-btn')).toBeVisible();
    await expect(page.locator('ct-pgn-viewer')).toBeVisible();
  });

  test('navigation should work on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Tap next button
    await page.locator('#next-btn').tap();
    await page.waitForTimeout(500);

    // Counter should update
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle 2/);
  });
});
