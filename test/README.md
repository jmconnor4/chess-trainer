# Chess Lessons Test Suite

Comprehensive testing strategy for the Chess Lessons application using Mocha.js and Playwright.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This test suite provides comprehensive coverage for the Chess Lessons application:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test the interaction between components and APIs
- **E2E Tests**: Test complete user workflows using Playwright

## Test Structure

```
test/
├── unit/                      # Unit tests with Mocha
│   ├── app.test.js           # Frontend ChessPuzzleApp tests
│   └── server.test.js        # Backend server tests
├── integration/              # Integration tests
│   └── puzzle-flow.test.js   # Full puzzle loading flow tests
├── e2e/                      # End-to-end tests with Playwright
│   ├── navigation.spec.js    # User navigation tests
│   ├── puzzle-loading.spec.js # Puzzle display tests
│   └── keyboard.spec.js      # Keyboard navigation tests
├── fixtures/                 # Test data
│   ├── test-puzzle.pgn      # Sample PGN file
│   └── mock-puzzles.json    # Mock API responses
└── helpers/                  # Test utilities
    └── setup.js             # Mocha test setup
```

## Installation

Install all test dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### All Tests

```bash
# Run all Mocha tests (unit + integration)
npm test

# Run all E2E tests
npm run test:e2e
```

### By Category

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests with UI mode
npm run test:e2e:ui

# E2E tests in debug mode
npm run test:e2e:debug
```

### With Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

### Specific Test Files

```bash
# Run specific Mocha test file
npx mocha test/unit/app.test.js

# Run specific Playwright test file
npx playwright test test/e2e/navigation.spec.js
```

## Test Categories

### Unit Tests

#### `/test/unit/app.test.js`

Tests for the frontend `ChessPuzzleApp` class:

- Constructor and initialization
- Puzzle list loading
- PGN metadata parsing
- Info panel updates
- Navigation state management
- Error handling

**Example:**
```javascript
it('should parse PGN metadata correctly', () => {
  const app = new ChessPuzzleApp();
  const metadata = app.parsePGNMetadata(pgnContent);
  expect(metadata).to.have.property('Event', 'Test Puzzle');
});
```

#### `/test/unit/server.test.js`

Tests for the backend Node.js server:

- API endpoints (`/api/puzzles`, `/api/puzzle/:filename`)
- Static file serving
- Security (path traversal prevention)
- CORS headers
- Error handling

**Example:**
```javascript
it('should return a list of PGN files', (done) => {
  request('http://localhost:3000')
    .get('/api/puzzles')
    .expect(200)
    .end((err, res) => {
      expect(res.body.puzzles).to.be.an('array');
      done();
    });
});
```

### Integration Tests

#### `/test/integration/puzzle-flow.test.js`

Tests complete puzzle loading workflows:

- Puzzle list → puzzle content flow
- Navigation through all puzzles
- Metadata extraction and validation
- Error recovery
- Performance benchmarks
- Concurrent requests

**Example:**
```javascript
it('should load puzzle list and then load first puzzle', async () => {
  const listRes = await request(baseURL).get('/api/puzzles');
  const firstPuzzle = listRes.body.puzzles[0];
  const puzzleRes = await request(baseURL).get(`/api/puzzle/${firstPuzzle}`);
  expect(puzzleRes.text).to.include('[Event');
});
```

### E2E Tests

#### `/test/e2e/navigation.spec.js`

Tests user navigation through the application:

- Initial page load and display
- Next/Previous button navigation
- Keyboard arrow key navigation
- Button enable/disable states
- Navigation boundaries (first/last puzzle)
- Accessibility features

**Example:**
```javascript
test('should navigate to next puzzle when clicking next button', async ({ page }) => {
  await page.locator('#next-btn').click();
  const counter = await page.locator('#puzzle-counter').textContent();
  expect(counter).toMatch(/Puzzle 2 of \d+/);
});
```

#### `/test/e2e/puzzle-loading.spec.js`

Tests puzzle display and chess-specific features:

- Puzzle metadata display
- Chess board rendering
- Content updates on navigation
- Performance metrics
- Error handling (missing puzzles, network errors)
- Visual regression testing
- Mobile responsiveness

**Example:**
```javascript
test('should load puzzle metadata correctly', async ({ page }) => {
  const infoPanel = page.locator('#puzzle-info');
  await expect(infoPanel).toContainText('Event:');
  await expect(infoPanel).toContainText('Difficulty:');
});
```

#### `/test/e2e/keyboard.spec.js`

Tests keyboard navigation and accessibility:

- Arrow key navigation (left/right)
- Tab navigation through interactive elements
- Enter/Space key activation
- Focus indicators
- Screen reader compatibility
- Edge cases (modifier keys, rapid presses)

**Example:**
```javascript
test('should navigate to next puzzle using right arrow key', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  const counter = await page.locator('#puzzle-counter').textContent();
  expect(counter).toMatch(/Puzzle 2/);
});
```

## Writing Tests

### Mocha Test Structure

```javascript
describe('Component or Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).to.equal('expected');
  });
});
```

### Playwright Test Structure

```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform user action', async ({ page }) => {
    // Arrange
    const button = page.locator('#my-button');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('#result')).toHaveText('Success');
  });
});
```

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the user experiences
   - Don't test internal implementation details
   - Tests should survive refactoring

2. **Clear Test Names**
   ```javascript
   // Good
   test('should disable next button on last puzzle')

   // Bad
   test('button test')
   ```

3. **Arrange-Act-Assert Pattern**
   ```javascript
   it('should update counter when navigating', () => {
     // Arrange: Set up test conditions
     const app = new ChessPuzzleApp();
     app.puzzles = ['p1.pgn', 'p2.pgn'];

     // Act: Perform the action
     app.nextPuzzle();

     // Assert: Verify the outcome
     expect(app.currentIndex).to.equal(1);
   });
   ```

4. **Independent Tests**
   - Each test should run in isolation
   - Don't depend on test execution order
   - Clean up after each test

5. **Meaningful Assertions**
   ```javascript
   // Good
   expect(puzzles).to.have.lengthOf(3);
   expect(metadata.Event).to.equal('Test Event');

   // Bad
   expect(puzzles).to.exist;
   ```

### Mocha-Specific Best Practices

1. **Use Appropriate Hooks**
   ```javascript
   before(() => {})      // Once before all tests
   beforeEach(() => {})  // Before each test
   afterEach(() => {})   // After each test
   after(() => {})       // Once after all tests
   ```

2. **Async Testing**
   ```javascript
   // Using async/await
   it('should load data', async () => {
     const data = await fetchData();
     expect(data).to.exist;
   });

   // Using done callback
   it('should load data', (done) => {
     fetchData((err, data) => {
       expect(data).to.exist;
       done();
     });
   });
   ```

3. **Mock External Dependencies**
   ```javascript
   beforeEach(() => {
     fetchStub = sinon.stub(global, 'fetch');
     fetchStub.resolves({ json: async () => ({ puzzles: [] }) });
   });

   afterEach(() => {
     fetchStub.restore();
   });
   ```

### Playwright-Specific Best Practices

1. **Wait for Elements Properly**
   ```javascript
   // Good
   await page.waitForSelector('#element');
   await expect(page.locator('#element')).toBeVisible();

   // Avoid
   await page.waitForTimeout(5000);
   ```

2. **Use Locators Effectively**
   ```javascript
   // Prefer test IDs or semantic selectors
   page.locator('[data-testid="puzzle-viewer"]')
   page.locator('button:has-text("Next")')
   page.getByRole('button', { name: 'Next' })
   ```

3. **Handle Async Operations**
   ```javascript
   // Wait for navigation
   await page.waitForLoadState('networkidle');

   // Wait for specific state
   await expect(page.locator('#status')).toHaveText('Ready');
   ```

4. **Screenshots and Traces**
   ```javascript
   // Automatic on failure (configured in playwright.config.js)
   screenshot: 'only-on-failure'
   video: 'retain-on-failure'
   trace: 'on-first-retry'
   ```

### Chess-Specific Testing

1. **FEN Validation**
   ```javascript
   it('should have valid FEN position', () => {
     const fen = metadata.FEN;
     expect(fen.split(' ')).to.have.lengthOf(6);
   });
   ```

2. **PGN Metadata Parsing**
   ```javascript
   it('should extract all PGN tags', () => {
     const metadata = parsePGNMetadata(pgn);
     expect(metadata).to.include.all.keys('Event', 'Date', 'White', 'Black');
   });
   ```

3. **Board State Testing**
   ```javascript
   test('should update board when puzzle changes', async ({ page }) => {
     const initialBoard = await page.locator('ct-pgn-viewer').getAttribute('ct-1');
     await page.locator('#next-btn').click();
     const newBoard = await page.locator('ct-pgn-viewer').getAttribute('ct-1');
     expect(newBoard).not.toBe(initialBoard);
   });
   ```

## Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```
   **Solution**: Start the server before running integration/E2E tests:
   ```bash
   npm start
   ```

2. **Playwright Browsers Not Installed**
   ```
   Error: Executable doesn't exist
   ```
   **Solution**: Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. **JSDOM Errors in Unit Tests**
   ```
   Error: Not implemented: window.alert
   ```
   **Solution**: Mock browser APIs in test setup:
   ```javascript
   global.window.alert = sinon.stub();
   ```

4. **Flaky Tests**
   - Add appropriate waits in Playwright tests
   - Use `waitForLoadState` instead of `waitForTimeout`
   - Ensure tests are independent

5. **Test Timeouts**
   ```javascript
   // Increase timeout for slow tests
   test('slow operation', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // ... test code
   });
   ```

### Debugging

**Mocha Tests:**
```bash
# Run with debug output
DEBUG=* npm test

# Run single test with node inspector
node --inspect-brk node_modules/.bin/mocha test/unit/app.test.js
```

**Playwright Tests:**
```bash
# Debug mode with inspector
npm run test:e2e:debug

# UI mode for interactive debugging
npm run test:e2e:ui

# Headed mode (see browser)
npx playwright test --headed

# Specific browser
npx playwright test --project=chromium
```

### Coverage Reports

After running `npm run test:coverage`, view the report:

```bash
# Open coverage report in browser
open coverage/index.html
```

## Continuous Integration

Example GitHub Actions workflow:

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

      - run: npm install
      - run: npm test
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon.js Mocking](https://sinonjs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [PGN Format Specification](https://www.chessclub.com/help/PGN-spec)

## Contributing

When adding new features:

1. Write unit tests for new functions/methods
2. Add integration tests for API changes
3. Create E2E tests for new user workflows
4. Ensure all tests pass before submitting PR
5. Aim for >80% code coverage on critical paths
