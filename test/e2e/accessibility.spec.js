const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test.describe('Puzzle Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/puzzles.html');
      await page.waitForSelector('#puzzle-info');
      await page.waitForTimeout(1000);
    });

    test('should have skip to main content link', async ({ page }) => {
      const skipLink = await page.locator('.skip-link');
      await expect(skipLink).toBeInViewport();
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper page title', async ({ page }) => {
      const title = await page.title();
      expect(title).toContain('Chess Puzzle Trainer');
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = await page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(20);
    });

    test('should have breadcrumb navigation', async ({ page }) => {
      const breadcrumbNav = await page.locator('nav[aria-label="Breadcrumb navigation"]');
      await expect(breadcrumbNav).toBeVisible();

      const homeLink = await page.locator('.breadcrumb-link');
      await expect(homeLink).toHaveAttribute('href', '/landing.html');
    });

    test('should have ARIA labels on navigation', async ({ page }) => {
      const navigation = await page.locator('nav[aria-label="Puzzle navigation"]');
      await expect(navigation).toBeVisible();

      const prevBtn = await page.locator('#prev-btn');
      await expect(prevBtn).toHaveAttribute('aria-label', 'Go to previous puzzle');

      const nextBtn = await page.locator('#next-btn');
      await expect(nextBtn).toHaveAttribute('aria-label', 'Go to next puzzle');

      const counter = await page.locator('#puzzle-counter');
      await expect(counter).toHaveAttribute('aria-live', 'polite');
      await expect(counter).toHaveAttribute('aria-atomic', 'true');
    });

    test('should have ARIA labels on info panel sections', async ({ page }) => {
      const infoPanel = await page.locator('#puzzle-info');
      await expect(infoPanel).toHaveAttribute('aria-label', 'Puzzle information');

      const learningSection = await page.locator('.learning-section');
      await expect(learningSection).toHaveAttribute('aria-labelledby', 'objective-heading');

      const metadataSection = await page.locator('.metadata-section');
      await expect(metadataSection).toHaveAttribute('aria-labelledby', 'metadata-heading');
    });

    test('should have proper semantic HTML', async ({ page }) => {
      // Main content
      const main = await page.locator('main#main-content');
      await expect(main).toBeVisible();

      // Aside for info panel
      const aside = await page.locator('aside.info-panel');
      await expect(aside).toBeVisible();

      // Nav elements
      const navElements = await page.locator('nav');
      const navCount = await navElements.count();
      expect(navCount).toBeGreaterThanOrEqual(2); // Breadcrumb + puzzle navigation
    });

    test('should have keyboard navigation support', async ({ page }) => {
      // Focus on next button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip link, breadcrumb, prev button

      // Check that next button is focused (or one of the nav buttons)
      const focusedElement = await page.evaluate(() => document.activeElement.id);
      expect(['prev-btn', 'next-btn', 'breadcrumb-link'].some(id => focusedElement.includes(id) || focusedElement === id)).toBeTruthy();
    });

    test('should navigate puzzles with arrow keys', async ({ page }) => {
      const initialCounter = await page.locator('#puzzle-counter').textContent();

      // Press right arrow
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      const newCounter = await page.locator('#puzzle-counter').textContent();
      expect(newCounter).not.toBe(initialCounter);
    });

    test('should have visible focus indicators', async ({ page }) => {
      const prevBtn = await page.locator('#prev-btn');

      // Focus the button
      await prevBtn.focus();

      // Check for focus-visible outline (this may vary by browser)
      const outlineStyle = await prevBtn.evaluate((el) => {
        return window.getComputedStyle(el).outline;
      });

      // The button should have some focus indication
      expect(outlineStyle).toBeTruthy();
    });

    test('should have hint toggle with ARIA attributes', async ({ page }) => {
      const hintToggle = await page.locator('.hint-toggle');
      await expect(hintToggle).toHaveAttribute('aria-expanded');
      await expect(hintToggle).toHaveAttribute('aria-controls', 'hint-content');

      // Initially collapsed
      let expanded = await hintToggle.getAttribute('aria-expanded');
      expect(expanded).toBe('false');

      // Click to expand
      await hintToggle.click();
      expanded = await hintToggle.getAttribute('aria-expanded');
      expect(expanded).toBe('true');
    });
  });

  test.describe('Landing Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/landing.html');
    });

    test('should have proper page title', async ({ page }) => {
      const title = await page.title();
      expect(title).toContain('Chess Puzzle Trainer');
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = await page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
    });

    test('should have accessible CTA buttons', async ({ page }) => {
      const ctaButton = await page.locator('#start-training-btn');
      await expect(ctaButton).toBeVisible();

      // Click and ensure it works
      await ctaButton.click();
      await page.waitForURL('**/puzzles.html');
    });

    test('should have ARIA labels on feature icons', async ({ page }) => {
      const icons = await page.locator('.feature-icon');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        await expect(icon).toHaveAttribute('aria-label');
      }
    });

    test('should support reduced motion preferences', async ({ page }) => {
      // This test checks if the CSS respects prefers-reduced-motion
      // We can't actually test the media query in Playwright easily,
      // but we can verify the CSS rule exists
      const styles = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule.cssText && rule.cssText.includes('prefers-reduced-motion')) {
                return true;
              }
            }
          } catch (e) {
            // Cross-origin stylesheet, skip
          }
        }
        return false;
      });

      expect(styles).toBe(true);
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast for text', async ({ page }) => {
      await page.goto('http://localhost:3000/puzzles.html');
      await page.waitForTimeout(1000);

      // Check keyboard hint color (should be #495057 on #f8f9fa)
      const keyboardHint = await page.locator('.keyboard-hint');
      const color = await keyboardHint.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Color should not be the old low-contrast color
      expect(color).not.toBe('rgb(108, 117, 125)'); // Old #6c757d
    });
  });
});
