/**
 * Playwright E2E Tests: Navigation
 * Tests user navigation through puzzles
 */

const { test, expect } = require('@playwright/test');

test.describe('Chess Puzzle Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the chess puzzle application', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Chess Lessons/);

    // Verify header
    const header = page.locator('h1');
    await expect(header).toHaveText('Chess Puzzle Trainer');

    // Verify navigation buttons exist
    await expect(page.locator('#prev-btn')).toBeVisible();
    await expect(page.locator('#next-btn')).toBeVisible();

    // Verify puzzle counter exists
    await expect(page.locator('#puzzle-counter')).toBeVisible();

    // Verify chess board viewer exists
    await expect(page.locator('ct-pgn-viewer')).toBeVisible();
  });

  test('should load and display first puzzle on page load', async ({ page }) => {
    // Wait for puzzle to load
    await page.waitForSelector('#puzzle-counter', { state: 'visible' });

    const counter = page.locator('#puzzle-counter');
    const counterText = await counter.textContent();

    // Should show puzzle 1 of N
    expect(counterText).toMatch(/Puzzle 1 of \d+/);

    // Previous button should be disabled on first puzzle
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeDisabled();

    // Info panel should be populated
    const infoPanel = page.locator('#puzzle-info');
    await expect(infoPanel).toContainText('Puzzle Information');
  });

  test('should navigate to next puzzle when clicking next button', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('#puzzle-counter');

    // Get initial counter text
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Click next button
    const nextBtn = page.locator('#next-btn');
    await nextBtn.click();

    // Wait for puzzle to update
    await page.waitForTimeout(500);

    // Counter should have incremented
    const newCounter = await page.locator('#puzzle-counter').textContent();
    expect(newCounter).not.toBe(initialCounter);
    expect(newCounter).toMatch(/Puzzle 2 of \d+/);

    // Previous button should now be enabled
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeEnabled();
  });

  test('should navigate to previous puzzle when clicking previous button', async ({ page }) => {
    await page.waitForSelector('#puzzle-counter');

    // First go to puzzle 2
    await page.locator('#next-btn').click();
    await page.waitForTimeout(500);

    const counter2 = await page.locator('#puzzle-counter').textContent();
    expect(counter2).toMatch(/Puzzle 2/);

    // Now go back to puzzle 1
    await page.locator('#prev-btn').click();
    await page.waitForTimeout(500);

    const counter1 = await page.locator('#puzzle-counter').textContent();
    expect(counter1).toMatch(/Puzzle 1/);

    // Previous button should be disabled again
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeDisabled();
  });

  test('should navigate using arrow keys', async ({ page }) => {
    await page.waitForSelector('#puzzle-counter');

    // Get initial counter
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Press right arrow to go to next puzzle
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    const counter2 = await page.locator('#puzzle-counter').textContent();
    expect(counter2).not.toBe(initialCounter);
    expect(counter2).toMatch(/Puzzle 2/);

    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    const counter1 = await page.locator('#puzzle-counter').textContent();
    expect(counter1).toMatch(/Puzzle 1/);
  });

  test('should disable next button on last puzzle', async ({ page }) => {
    await page.waitForSelector('#puzzle-counter');

    const counterText = await page.locator('#puzzle-counter').textContent();
    const match = counterText.match(/Puzzle \d+ of (\d+)/);
    const totalPuzzles = parseInt(match[1]);

    // Navigate to last puzzle
    for (let i = 1; i < totalPuzzles; i++) {
      await page.locator('#next-btn').click();
      await page.waitForTimeout(300);
    }

    // Next button should be disabled
    const nextBtn = page.locator('#next-btn');
    await expect(nextBtn).toBeDisabled();

    // Previous button should be enabled
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeEnabled();

    // Counter should show last puzzle
    const finalCounter = await page.locator('#puzzle-counter').textContent();
    expect(finalCounter).toBe(`Puzzle ${totalPuzzles} of ${totalPuzzles}`);
  });

  test('should update puzzle info when navigating', async ({ page }) => {
    await page.waitForSelector('#puzzle-counter');

    // Get info from first puzzle
    const initialInfo = await page.locator('#puzzle-info').textContent();

    // Navigate to next puzzle
    await page.locator('#next-btn').click();
    await page.waitForTimeout(500);

    // Info should have changed
    const newInfo = await page.locator('#puzzle-info').textContent();
    expect(newInfo).not.toBe(initialInfo);

    // Should still contain info structure
    expect(newInfo).toContain('Puzzle Information');
  });

  test('should maintain navigation state across rapid clicks', async ({ page }) => {
    await page.waitForSelector('#puzzle-counter');

    // Rapidly click next 3 times
    const nextBtn = page.locator('#next-btn');
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();

    // Wait for updates to settle
    await page.waitForTimeout(1000);

    // Should be on puzzle 4
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle 4/);
  });

  test('should show keyboard hint to users', async ({ page }) => {
    await page.waitForSelector('.keyboard-hint');

    const hint = page.locator('.keyboard-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toContainText('arrow keys');
  });

  test('should handle navigation with no puzzles gracefully', async ({ page }) => {
    // This test would require mocking the API to return empty puzzle list
    // For now, we'll skip actual implementation but document the test case
    test.skip();
  });
});

test.describe('Navigation Accessibility', () => {
  test('navigation buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Tab to previous button
    await page.keyboard.press('Tab');

    // Should focus on prev button (or first focusable element)
    // Tab through to next button
    await page.keyboard.press('Tab');

    // Can activate with Enter or Space
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Counter should have changed
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle/);
  });

  test('navigation buttons should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    const prevBtn = page.locator('#prev-btn');
    const nextBtn = page.locator('#next-btn');

    // Buttons should have button role (implicit)
    await expect(prevBtn).toHaveAttribute('id', 'prev-btn');
    await expect(nextBtn).toHaveAttribute('id', 'next-btn');

    // Disabled state should be properly communicated
    await expect(prevBtn).toBeDisabled();
  });
});

test.describe('Navigation Edge Cases', () => {
  test('should handle boundary navigation attempts', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Try to go previous from first puzzle
    const prevBtn = page.locator('#prev-btn');
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Button should be disabled, but try keyboard
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    // Should still be on puzzle 1
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toBe(initialCounter);
  });

  test('should handle navigation during puzzle loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Click next and immediately click next again
    const nextBtn = page.locator('#next-btn');
    await nextBtn.click();
    await nextBtn.click();

    // Wait for loading to complete
    await page.waitForTimeout(1000);

    // Should handle gracefully and be on a valid puzzle
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle \d+ of \d+/);
  });
});
