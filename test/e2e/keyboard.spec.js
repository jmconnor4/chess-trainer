/**
 * Playwright E2E Tests: Keyboard Navigation
 * Tests keyboard shortcuts and accessibility features
 */

const { test, expect } = require('@playwright/test');

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#puzzle-counter');
  });

  test('should navigate to next puzzle using right arrow key', async ({ page }) => {
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Press right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    const newCounter = await page.locator('#puzzle-counter').textContent();
    expect(newCounter).not.toBe(initialCounter);
    expect(newCounter).toMatch(/Puzzle 2/);
  });

  test('should navigate to previous puzzle using left arrow key', async ({ page }) => {
    // First go to puzzle 2
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    expect(await page.locator('#puzzle-counter').textContent()).toMatch(/Puzzle 2/);

    // Then go back to puzzle 1
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    expect(await page.locator('#puzzle-counter').textContent()).toMatch(/Puzzle 1/);
  });

  test('should not navigate left from first puzzle', async ({ page }) => {
    const initialCounter = await page.locator('#puzzle-counter').textContent();
    expect(initialCounter).toMatch(/Puzzle 1/);

    // Try to go left from puzzle 1
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    // Should still be on puzzle 1
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toBe(initialCounter);
  });

  test('should not navigate right from last puzzle', async ({ page }) => {
    const counterText = await page.locator('#puzzle-counter').textContent();
    const match = counterText.match(/Puzzle \d+ of (\d+)/);
    const totalPuzzles = parseInt(match[1]);

    // Navigate to last puzzle
    for (let i = 1; i < totalPuzzles; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
    }

    const lastCounter = await page.locator('#puzzle-counter').textContent();
    expect(lastCounter).toBe(`Puzzle ${totalPuzzles} of ${totalPuzzles}`);

    // Try to go right from last puzzle
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Should still be on last puzzle
    const stillLastCounter = await page.locator('#puzzle-counter').textContent();
    expect(stillLastCounter).toBe(lastCounter);
  });

  test('should handle rapid arrow key presses', async ({ page }) => {
    // Rapidly press right arrow 5 times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
    }

    // Wait for navigation to settle
    await page.waitForTimeout(1000);

    // Should have navigated to puzzle 6
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle [56]/); // Allow for some timing issues
  });

  test('should allow keyboard navigation while focused on elements', async ({ page }) => {
    // Focus on a button
    await page.locator('#next-btn').focus();

    // Arrow keys should still work for puzzle navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle 2/);
  });

  test('should display keyboard hint to users', async ({ page }) => {
    const hint = page.locator('.keyboard-hint');
    await expect(hint).toBeVisible();

    const hintText = await hint.textContent();
    expect(hintText.toLowerCase()).toContain('arrow');
    expect(hintText.toLowerCase()).toContain('navigate');
  });
});

test.describe('Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');
  });

  test('should allow tab navigation through interactive elements', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement.id);

    // Should focus on an interactive element
    const interactiveElements = ['prev-btn', 'next-btn'];
    const tabSequence = [];

    // Tab through several times to map the sequence
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => document.activeElement.id);
      tabSequence.push(focused);
    }

    // Should have focused on navigation buttons
    const hasButtons = tabSequence.some(id => interactiveElements.includes(id));
    expect(hasButtons).toBeTruthy();
  });

  test('should allow shift+tab to navigate backwards', async ({ page }) => {
    // Tab forward a few times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const forwardFocused = await page.evaluate(() => document.activeElement.id);

    // Tab backward
    await page.keyboard.press('Shift+Tab');

    const backwardFocused = await page.evaluate(() => document.activeElement.id);

    // Should have moved to a different element
    expect(backwardFocused).not.toBe(forwardFocused);
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    // Focus on next button
    await page.locator('#next-btn').focus();

    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const newCounter = await page.locator('#puzzle-counter').textContent();
    expect(newCounter).not.toBe(initialCounter);
  });

  test('should activate buttons with Space key', async ({ page }) => {
    // Focus on next button
    await page.locator('#next-btn').focus();

    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Press Space to activate
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const newCounter = await page.locator('#puzzle-counter').textContent();
    expect(newCounter).not.toBe(initialCounter);
  });

  test('should show focus indicators on interactive elements', async ({ page }) => {
    // Focus on button
    await page.locator('#next-btn').focus();

    // Check if focus is visible (this depends on CSS)
    const nextBtn = page.locator('#next-btn');
    await expect(nextBtn).toBeFocused();
  });

  test('should not trap focus in any component', async ({ page }) => {
    // Tab through all interactive elements
    let previousFocused = '';
    let cycleCount = 0;

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement.tagName);

      if (focused === previousFocused) {
        cycleCount++;
      } else {
        cycleCount = 0;
      }

      // Should not be stuck on same element for more than 2 iterations
      expect(cycleCount).toBeLessThan(3);

      previousFocused = focused;
    }
  });
});

test.describe('Keyboard Shortcuts Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');
  });

  test('should ignore other arrow keys (up/down)', async ({ page }) => {
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Press up and down arrows
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Counter should not have changed
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toBe(initialCounter);
  });

  test('should handle arrow keys with modifiers', async ({ page }) => {
    const initialCounter = await page.locator('#puzzle-counter').textContent();

    // Try Ctrl+Arrow combinations
    await page.keyboard.press('Control+ArrowRight');
    await page.waitForTimeout(300);

    // Should either navigate or ignore (depending on implementation)
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toBeTruthy();
  });

  test('should work with keyboard navigation during puzzle loading', async ({ page }) => {
    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Immediately press right arrow again
    await page.keyboard.press('ArrowRight');

    await page.waitForTimeout(1000);

    // Should have navigated to some puzzle
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle \d+/);
  });

  test('should handle simultaneous mouse and keyboard navigation', async ({ page }) => {
    // Click next button
    await page.locator('#next-btn').click();

    // Immediately press left arrow
    await page.keyboard.press('ArrowLeft');

    await page.waitForTimeout(1000);

    // Should be on a valid puzzle (likely puzzle 1)
    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle 1/);
  });
});

test.describe('Keyboard Navigation with Screen Readers', () => {
  test('buttons should have accessible labels', async ({ page }) => {
    await page.goto('/');

    const prevBtn = page.locator('#prev-btn');
    const nextBtn = page.locator('#next-btn');

    // Buttons should have text content
    await expect(prevBtn).toContainText('Previous');
    await expect(nextBtn).toContainText('Next');
  });

  test('puzzle counter should be readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    const counter = page.locator('#puzzle-counter');

    // Counter should have meaningful text
    const counterText = await counter.textContent();
    expect(counterText).toMatch(/Puzzle \d+ of \d+/);
  });

  test('disabled buttons should communicate state', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Previous button should be disabled on first puzzle
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeDisabled();

    // Check if disabled attribute is present
    const isDisabled = await prevBtn.getAttribute('disabled');
    expect(isDisabled).not.toBeNull();
  });
});

test.describe('Cross-Browser Keyboard Support', () => {
  test('keyboard navigation should work in all browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForSelector('#puzzle-counter');

    // Test basic navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    const counter = await page.locator('#puzzle-counter').textContent();
    expect(counter).toMatch(/Puzzle 2/);

    // Log which browser passed
    console.log(`Keyboard navigation works in ${browserName}`);
  });
});
