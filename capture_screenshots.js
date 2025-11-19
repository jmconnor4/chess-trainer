const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const screenshotDir = '/tmp/chess-ui-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // Navigate to the app
  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForTimeout(3000); // Wait for content to load
  
  // Capture desktop view
  await desktopPage.screenshot({ 
    path: path.join(screenshotDir, '01-desktop-initial.png'),
    fullPage: true 
  });
  
  // Capture with focus on navigation
  await desktopPage.locator('#next-btn').focus();
  await desktopPage.screenshot({ 
    path: path.join(screenshotDir, '02-desktop-nav-focus.png'),
    fullPage: true 
  });
  
  // Click next to see second puzzle
  await desktopPage.click('#next-btn');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ 
    path: path.join(screenshotDir, '03-desktop-puzzle2.png'),
    fullPage: true 
  });
  
  // Tablet viewport
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 }
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto('http://localhost:3000');
  await tabletPage.waitForTimeout(2000);
  await tabletPage.screenshot({ 
    path: path.join(screenshotDir, '04-tablet-view.png'),
    fullPage: true 
  });
  
  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ 
    path: path.join(screenshotDir, '05-mobile-view.png'),
    fullPage: true 
  });
  
  // Check accessibility tree
  const snapshot = await desktopPage.accessibility.snapshot();
  fs.writeFileSync(
    path.join(screenshotDir, 'accessibility-tree.json'),
    JSON.stringify(snapshot, null, 2)
  );
  
  await browser.close();
  console.log('Screenshots saved to:', screenshotDir);
}

captureScreenshots().catch(console.error);
