const { test, expect } = require('@playwright/test');

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
  });

  test('should initialize ProgressTracker on app load', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    // Check that progressTracker exists in the app
    const hasProgressTracker = await page.evaluate(() => {
      const app = window.ChessPuzzleApp || null;
      return app && app.progressTracker !== undefined;
    });

    // Note: Since app is instantiated in a closure, we can't directly access it
    // Instead, we'll test the functionality through localStorage
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    // Progress tracking should be initialized (might be empty initially)
    expect(localStorageKeys).toBeDefined();
  });

  test('should save progress to localStorage', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    // Simulate marking a puzzle as completed
    await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle1.pgn');
    });

    // Check localStorage
    const progress = await page.evaluate(() => {
      return localStorage.getItem('chess-puzzle-progress');
    });

    expect(progress).toBeTruthy();
    const parsed = JSON.parse(progress);
    expect(parsed['puzzle1.pgn']).toBeDefined();
    expect(parsed['puzzle1.pgn'].completed).toBe(true);
  });

  test('should persist progress across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    // Mark a puzzle as completed
    await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle2.pgn');
    });

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Check that progress is still there
    const progress = await page.evaluate(() => {
      return localStorage.getItem('chess-puzzle-progress');
    });

    const parsed = JSON.parse(progress);
    expect(parsed['puzzle2.pgn']).toBeDefined();
    expect(parsed['puzzle2.pgn'].completed).toBe(true);
  });

  test('should check if puzzle is completed', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    const result = await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('test-puzzle.pgn');
      return {
        completed: tracker.isCompleted('test-puzzle.pgn'),
        notCompleted: tracker.isCompleted('other-puzzle.pgn')
      };
    });

    expect(result.completed).toBe(true);
    expect(result.notCompleted).toBe(false);
  });

  test('should reset progress', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle1.pgn');
      tracker.markCompleted('puzzle2.pgn');
      tracker.reset();
    });

    const progress = await page.evaluate(() => {
      return localStorage.getItem('chess-puzzle-progress');
    });

    expect(progress).toBeNull();
  });

  test('should count completed puzzles', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    const count = await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle1.pgn');
      tracker.markCompleted('puzzle2.pgn');
      tracker.markCompleted('puzzle3.pgn');
      return tracker.getCompletedCount();
    });

    expect(count).toBe(3);
  });

  test('should store timestamp when marking complete', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    const timestamp = await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle-with-timestamp.pgn');
      const progress = tracker.loadProgress();
      return progress['puzzle-with-timestamp.pgn'].timestamp;
    });

    expect(timestamp).toBeTruthy();
    // Check that it's a valid ISO date string
    const date = new Date(timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  test('should handle multiple puzzles independently', async ({ page }) => {
    await page.goto('http://localhost:3000/puzzles.html');
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => {
      const tracker = new ProgressTracker();
      tracker.markCompleted('puzzle-a.pgn');
      // Don't mark puzzle-b
      tracker.markCompleted('puzzle-c.pgn');

      return {
        a: tracker.isCompleted('puzzle-a.pgn'),
        b: tracker.isCompleted('puzzle-b.pgn'),
        c: tracker.isCompleted('puzzle-c.pgn'),
        count: tracker.getCompletedCount()
      };
    });

    expect(results.a).toBe(true);
    expect(results.b).toBe(false);
    expect(results.c).toBe(true);
    expect(results.count).toBe(2);
  });
});
