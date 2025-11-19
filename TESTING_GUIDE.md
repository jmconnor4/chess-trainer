# Chess Lessons Testing Guide

## Executive Summary

This document provides a comprehensive guide for implementing and maintaining tests for the Chess Lessons application using Mocha.js for unit/integration testing and Playwright for end-to-end testing.

## Application Overview

**Chess Lessons** is a web-based chess puzzle trainer that:
- Serves chess puzzles in PGN format from the `/pgns` directory
- Displays puzzles using the ChessTempo PGN viewer
- Allows navigation between puzzles via buttons or arrow keys
- Shows puzzle metadata (Event, Date, Players, Difficulty, Theme)

**Technology Stack:**
- Backend: Node.js HTTP server (vanilla)
- Frontend: Vanilla JavaScript (ChessPuzzleApp class)
- Chess Display: ChessTempo PGN Viewer (external library)

## Test Coverage Strategy

### 1. Unit Tests (Mocha + Chai + Sinon)

**Coverage: ~35 test cases**

#### Backend Tests (`/test/unit/server.test.js`)
- API endpoint validation
- Security (path traversal prevention)
- File serving
- Error handling
- CORS configuration

#### Frontend Tests (`/test/unit/app.test.js`)
- ChessPuzzleApp initialization
- PGN metadata parsing
- Navigation logic
- UI updates
- Error handling

### 2. Integration Tests (Mocha + Supertest)

**Coverage: ~15 test cases**

#### Full Flow Testing (`/test/integration/puzzle-flow.test.js`)
- Complete puzzle loading workflow
- API integration
- Data consistency
- Performance benchmarks
- Error recovery

### 3. End-to-End Tests (Playwright)

**Coverage: ~45 test cases**

#### Navigation Tests (`/test/e2e/navigation.spec.js`)
- Button navigation
- Keyboard navigation
- State management
- Accessibility

#### Puzzle Display Tests (`/test/e2e/puzzle-loading.spec.js`)
- Content rendering
- Metadata display
- Chess board updates
- Performance
- Visual regression

#### Keyboard Tests (`/test/e2e/keyboard.spec.js`)
- Arrow key navigation
- Tab navigation
- Focus management
- Screen reader support

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test                 # Mocha tests
npm run test:e2e        # Playwright tests

# Run specific categories
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only

# Development
npm run test:watch      # Watch mode
npm run test:e2e:ui     # Playwright UI mode

# Coverage
npm run test:coverage   # Generate coverage report
```

## Test Architecture

### Directory Structure

```
/home/connor/devshop/chessLessons/
├── test/
│   ├── unit/
│   │   ├── app.test.js              # Frontend unit tests
│   │   └── server.test.js           # Backend unit tests
│   ├── integration/
│   │   └── puzzle-flow.test.js      # Integration tests
│   ├── e2e/
│   │   ├── navigation.spec.js       # Navigation E2E tests
│   │   ├── puzzle-loading.spec.js   # Display E2E tests
│   │   └── keyboard.spec.js         # Keyboard E2E tests
│   ├── fixtures/
│   │   ├── test-puzzle.pgn          # Test data
│   │   └── mock-puzzles.json        # Mock responses
│   └── helpers/
│       └── setup.js                 # Test environment setup
├── .mocharc.json                    # Mocha configuration
├── playwright.config.js             # Playwright configuration
└── package.json                     # Test scripts
```

### Configuration Files

#### `.mocharc.json` - Mocha Configuration
```json
{
  "require": ["test/helpers/setup.js"],
  "spec": ["test/**/*.test.js"],
  "timeout": 5000,
  "color": true,
  "reporter": "spec"
}
```

#### `playwright.config.js` - Playwright Configuration
```javascript
module.exports = defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000'
  }
});
```

## Key Test Examples

### Unit Test Example

```javascript
// test/unit/app.test.js
describe('parsePGNMetadata()', () => {
  it('should parse PGN metadata correctly', () => {
    const app = new ChessPuzzleApp();
    const pgnContent = `
      [Event "Test Puzzle"]
      [Date "2024.01.01"]
      [White "Player1"]
      [Difficulty "Medium"]
    `;

    const metadata = app.parsePGNMetadata(pgnContent);

    expect(metadata).to.have.property('Event', 'Test Puzzle');
    expect(metadata).to.have.property('Date', '2024.01.01');
    expect(metadata).to.have.property('Difficulty', 'Medium');
  });
});
```

### Integration Test Example

```javascript
// test/integration/puzzle-flow.test.js
describe('Complete Puzzle Loading Flow', () => {
  it('should load puzzle list and then load first puzzle', async () => {
    // Step 1: Fetch puzzle list
    const listRes = await request('http://localhost:3000')
      .get('/api/puzzles')
      .expect(200);

    expect(listRes.body.puzzles).to.be.an('array');
    expect(listRes.body.puzzles.length).to.be.greaterThan(0);

    // Step 2: Load first puzzle
    const firstPuzzle = listRes.body.puzzles[0];
    const puzzleRes = await request('http://localhost:3000')
      .get(`/api/puzzle/${firstPuzzle}`)
      .expect(200);

    expect(puzzleRes.text).to.include('[Event');
  });
});
```

### E2E Test Example

```javascript
// test/e2e/navigation.spec.js
test('should navigate to next puzzle when clicking next button', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#puzzle-counter');

  // Get initial state
  const initialCounter = await page.locator('#puzzle-counter').textContent();

  // Click next button
  await page.locator('#next-btn').click();
  await page.waitForTimeout(500);

  // Verify navigation occurred
  const newCounter = await page.locator('#puzzle-counter').textContent();
  expect(newCounter).not.toBe(initialCounter);
  expect(newCounter).toMatch(/Puzzle 2 of \d+/);
});
```

## Chess-Specific Testing Patterns

### 1. PGN Metadata Validation

```javascript
it('should extract all required PGN tags', () => {
  const metadata = parsePGNMetadata(pgnContent);

  // Standard tags
  expect(metadata).to.have.property('Event');
  expect(metadata).to.have.property('Date');
  expect(metadata).to.have.property('White');
  expect(metadata).to.have.property('Black');

  // Custom tags for puzzles
  expect(metadata).to.have.property('FEN');
  expect(metadata).to.have.property('Difficulty');
  expect(metadata).to.have.property('Theme');
});
```

### 2. FEN Position Validation

```javascript
it('should validate FEN positions are properly formatted', () => {
  const fen = metadata.FEN;
  const parts = fen.split(' ');

  // FEN has 6 parts: position, active color, castling, en passant, halfmove, fullmove
  expect(parts).to.have.lengthOf(6);

  // Validate piece placement
  const piecePlacement = parts[0];
  expect(piecePlacement).to.match(/^[rnbqkpRNBQKP1-8\/]+$/);
});
```

### 3. Chess Board Rendering

```javascript
test('should render chess board with correct position', async ({ page }) => {
  await page.goto('/');

  // Wait for board to render
  const viewer = page.locator('ct-pgn-viewer');
  await expect(viewer).toBeVisible();

  // Verify board has content
  const viewerContent = await viewer.innerHTML();
  expect(viewerContent.length).toBeGreaterThan(0);
});
```

### 4. Move Navigation Testing

```javascript
test('should update board when puzzle changes', async ({ page }) => {
  await page.goto('/');

  // Get initial board state
  const initialBoard = await page.locator('ct-pgn-viewer').getAttribute('ct-1');

  // Navigate to next puzzle
  await page.locator('#next-btn').click();
  await page.waitForTimeout(1000);

  // Board should update
  const newBoard = await page.locator('ct-pgn-viewer').getAttribute('ct-1');
  expect(newBoard).not.toBe(initialBoard);
});
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```javascript
it('should update navigation state', () => {
  // Arrange: Set up test data
  const app = new ChessPuzzleApp();
  app.puzzles = ['p1.pgn', 'p2.pgn', 'p3.pgn'];
  app.currentIndex = 0;

  // Act: Execute the action
  app.nextPuzzle();

  // Assert: Verify the result
  expect(app.currentIndex).to.equal(1);
});
```

### 2. Test Independence

```javascript
beforeEach(() => {
  // Fresh state for each test
  fetchStub = sinon.stub(global, 'fetch');
  fetchStub.resolves({
    json: async () => ({ puzzles: [] })
  });
});

afterEach(() => {
  // Clean up after each test
  if (fetchStub) {
    fetchStub.restore();
  }
});
```

### 3. Meaningful Test Names

```javascript
// Good: Describes what and why
test('should disable next button on last puzzle to prevent navigation beyond bounds')

// Bad: Vague and unhelpful
test('button test')
```

### 4. Async Handling

```javascript
// Mocha with async/await
it('should load puzzle data', async () => {
  const data = await loadPuzzle('test.pgn');
  expect(data).to.exist;
});

// Playwright with proper waits
test('should display puzzle', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#puzzle-counter')).toBeVisible();
});
```

## Common Testing Scenarios

### Testing Error Handling

```javascript
describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    fetchStub.rejects(new Error('Network error'));

    const app = new ChessPuzzleApp();
    await app.loadPuzzleList();

    // Should not crash, should set empty array
    expect(app.puzzles).to.deep.equal([]);
  });
});
```

### Testing Boundary Conditions

```javascript
describe('Navigation Boundaries', () => {
  it('should not navigate before first puzzle', () => {
    const app = new ChessPuzzleApp();
    app.puzzles = ['p1.pgn', 'p2.pgn'];
    app.currentIndex = 0;

    const loadSpy = sinon.spy(app, 'loadPuzzle');
    app.previousPuzzle();

    expect(loadSpy.called).to.be.false;
    expect(app.currentIndex).to.equal(0);
  });

  it('should not navigate past last puzzle', () => {
    const app = new ChessPuzzleApp();
    app.puzzles = ['p1.pgn', 'p2.pgn'];
    app.currentIndex = 1;

    const loadSpy = sinon.spy(app, 'loadPuzzle');
    app.nextPuzzle();

    expect(loadSpy.called).to.be.false;
    expect(app.currentIndex).to.equal(1);
  });
});
```

### Testing User Interactions

```javascript
test('should respond to keyboard navigation', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#puzzle-counter');

  // Test right arrow
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  let counter = await page.locator('#puzzle-counter').textContent();
  expect(counter).toMatch(/Puzzle 2/);

  // Test left arrow
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(500);
  counter = await page.locator('#puzzle-counter').textContent();
  expect(counter).toMatch(/Puzzle 1/);
});
```

## Debugging Tests

### Mocha Tests

```bash
# Run with verbose output
DEBUG=* npm test

# Run specific test
npx mocha test/unit/app.test.js --grep "should parse PGN"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/mocha test/unit/app.test.js
```

### Playwright Tests

```bash
# UI Mode (interactive debugging)
npm run test:e2e:ui

# Debug mode with inspector
npm run test:e2e:debug

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test test/e2e/navigation.spec.js

# Generate trace
npx playwright test --trace on
```

## Performance Testing

### Load Time Benchmarks

```javascript
describe('Performance Tests', () => {
  it('should load puzzle list within acceptable time', async () => {
    const startTime = Date.now();

    await request('http://localhost:3000')
      .get('/api/puzzles')
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).to.be.lessThan(1000); // 1 second
  });
});
```

### Playwright Performance

```javascript
test('should load initial puzzle quickly', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await page.waitForSelector('#puzzle-counter');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Accessibility Testing

### Keyboard Navigation

```javascript
test('navigation buttons should be keyboard accessible', async ({ page }) => {
  await page.goto('/');

  // Tab to buttons
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Activate with Enter
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const counter = await page.locator('#puzzle-counter').textContent();
  expect(counter).toMatch(/Puzzle/);
});
```

### Screen Reader Support

```javascript
test('buttons should have accessible labels', async ({ page }) => {
  await page.goto('/');

  const prevBtn = page.locator('#prev-btn');
  const nextBtn = page.locator('#next-btn');

  await expect(prevBtn).toContainText('Previous');
  await expect(nextBtn).toContainText('Next');
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm test

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Issue: Tests fail with "fetch is not defined"

**Solution**: Mock fetch in test setup:
```javascript
global.fetch = require('node-fetch');
```

### Issue: Playwright can't find elements

**Solution**: Add proper waits:
```javascript
await page.waitForLoadState('networkidle');
await page.waitForSelector('#element');
```

### Issue: JSDOM errors in unit tests

**Solution**: Mock browser APIs:
```javascript
global.window = dom.window;
global.document = dom.window.document;
```

### Issue: Flaky tests

**Solutions**:
- Use `waitForLoadState` instead of `waitForTimeout`
- Ensure tests are independent
- Add proper cleanup in `afterEach`
- Use Playwright's auto-waiting features

## Next Steps

1. **Install dependencies**: `npm install`
2. **Install Playwright**: `npx playwright install`
3. **Run unit tests**: `npm run test:unit`
4. **Run E2E tests**: `npm run test:e2e:ui`
5. **Review coverage**: `npm run test:coverage`
6. **Add custom tests** for your specific puzzle features

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Mocking Library](https://sinonjs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest API Testing](https://github.com/visionmedia/supertest)
- [PGN Specification](https://www.chessclub.com/help/PGN-spec)

## Support

For questions or issues:
1. Check the `/test/README.md` for detailed documentation
2. Review test examples in the test files
3. Consult the Playwright/Mocha documentation
4. Open an issue in the project repository
