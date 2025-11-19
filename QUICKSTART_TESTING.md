# Quick Start: Testing Chess Lessons

## 5-Minute Setup

```bash
# 1. Install dependencies (2 min)
npm install

# 2. Install Playwright browsers (2 min)
npx playwright install

# 3. Run tests (1 min)
npm test                # Unit + Integration tests
npm run test:e2e       # E2E tests (in separate terminal)
```

## Verify Installation

```bash
# Check all dependencies installed correctly
npm list mocha chai sinon @playwright/test

# Expected output:
# chess-lessons@0.0.0
# ├── @playwright/test@1.40.0
# ├── chai@4.3.10
# ├── mocha@10.2.0
# └── sinon@17.0.1
```

## Run Your First Test

### 1. Unit Tests (Fastest)

```bash
# Terminal 1: No server needed for unit tests
npm run test:unit

# Expected output:
# Chess Lessons Server
#   GET /api/puzzles
#     ✓ should return a list of PGN files
#     ✓ should filter and return only .pgn files
#   ...
# 35 passing (2s)
```

### 2. Integration Tests

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run integration tests
npm run test:integration

# Expected output:
# Chess Puzzle Integration Tests
#   Complete Puzzle Loading Flow
#     ✓ should load puzzle list and then load first puzzle (234ms)
#     ✓ should navigate through all available puzzles (567ms)
#   ...
# 15 passing (3s)
```

### 3. E2E Tests (Most Comprehensive)

```bash
# Terminal 1: Server starts automatically
npm run test:e2e

# Expected output:
# Running 45 tests using 3 workers
#   navigation.spec.js
#     ✓ should display the chess puzzle application (1234ms)
#     ✓ should navigate to next puzzle when clicking next button (567ms)
#   ...
# 45 passed (45s)
```

## Interactive Testing

### Playwright UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run tests individually
- Watch tests execute in real-time
- Debug failures
- View screenshots/videos

### Watch Mode (For TDD)

```bash
npm run test:watch
```

Tests automatically re-run when you save files.

## Common Commands

```bash
# All tests
npm test                  # Mocha (unit + integration)
npm run test:e2e         # Playwright (E2E)

# By category
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only

# Development
npm run test:watch       # Auto-rerun on changes
npm run test:e2e:ui      # Interactive UI
npm run test:e2e:debug   # Debug mode

# Coverage
npm run test:coverage    # Generate coverage report
open coverage/index.html # View report (Mac)
xdg-open coverage/index.html # View report (Linux)

# Specific files
npx mocha test/unit/app.test.js
npx playwright test test/e2e/navigation.spec.js

# Specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Understanding Test Results

### Mocha Output

```
  ChessPuzzleApp
    parsePGNMetadata()
      ✓ should parse PGN metadata correctly (5ms)
      ✗ should handle empty PGN content

  1 passing (234ms)
  1 failing

  1) ChessPuzzleApp parsePGNMetadata() should handle empty PGN content:
     AssertionError: expected undefined to deep equal {}
```

- ✓ = Test passed
- ✗ = Test failed
- Numbers in parentheses = execution time

### Playwright Output

```
Running 15 tests using 3 workers

  ✓ [chromium] navigation.spec.js:10:5 › should display application (1.2s)
  ✓ [firefox] navigation.spec.js:10:5 › should display application (1.3s)
  ✓ [webkit] navigation.spec.js:10:5 › should display application (1.5s)

  15 passed (23s)
```

- Tests run in parallel across browsers
- Each test runs on all configured browsers
- View detailed report: `npx playwright show-report`

## Test File Locations

```
test/
├── unit/              # Fast isolated tests
│   ├── app.test.js    # Frontend tests
│   └── server.test.js # Backend tests
│
├── integration/       # API integration tests
│   └── puzzle-flow.test.js
│
└── e2e/              # End-to-end browser tests
    ├── navigation.spec.js
    ├── puzzle-loading.spec.js
    └── keyboard.spec.js
```

## What Each Test Suite Does

### Unit Tests

**app.test.js** - Tests ChessPuzzleApp class:
- Parses PGN metadata
- Manages puzzle navigation
- Updates UI components
- Handles errors

**server.test.js** - Tests HTTP server:
- API endpoints work correctly
- Security (prevents directory traversal)
- File serving
- Error responses

### Integration Tests

**puzzle-flow.test.js** - Tests complete workflows:
- Load puzzle list → load specific puzzle
- Navigate through all puzzles
- Metadata extraction and validation
- Performance benchmarks

### E2E Tests

**navigation.spec.js** - Tests user navigation:
- Button clicks
- Keyboard arrow keys
- Navigation boundaries
- Accessibility

**puzzle-loading.spec.js** - Tests puzzle display:
- Metadata rendering
- Chess board updates
- Error handling
- Mobile responsiveness

**keyboard.spec.js** - Tests keyboard features:
- Arrow key navigation
- Tab navigation
- Focus management
- Screen reader support

## Debugging Failed Tests

### Mocha Tests

```bash
# Run single test
npx mocha test/unit/app.test.js --grep "should parse PGN"

# Enable debug output
DEBUG=* npm test

# Use Node debugger
node --inspect-brk node_modules/.bin/mocha test/unit/app.test.js
```

### Playwright Tests

```bash
# UI mode (easiest)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run in headed mode (see browser)
npx playwright test --headed

# Show last test report
npx playwright show-report
```

## Common Issues & Solutions

### "Server not running" error

```bash
# Solution: Start server in separate terminal
npm start
```

### "Executable doesn't exist" (Playwright)

```bash
# Solution: Install browsers
npx playwright install
```

### "Module not found"

```bash
# Solution: Install dependencies
npm install
```

### Tests timeout

```bash
# Solution: Increase timeout in test file
test.setTimeout(60000); // 60 seconds
```

### Port 3000 already in use

```bash
# Solution: Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

## Next Steps

1. **Run all tests** to verify setup
2. **Check coverage**: `npm run test:coverage`
3. **Read documentation**:
   - `/home/connor/devshop/chessLessons/TESTING_GUIDE.md` (comprehensive guide)
   - `/home/connor/devshop/chessLessons/TEST_SUMMARY.md` (overview)
   - `/home/connor/devshop/chessLessons/test/README.md` (test details)
4. **Write your first test** (see examples below)

## Write Your First Test

### Unit Test Example

Create: `test/unit/my-feature.test.js`

```javascript
const { expect } = require('chai');

describe('My Feature', () => {
  it('should work correctly', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = input.toUpperCase();

    // Assert
    expect(result).to.equal('TEST');
  });
});
```

Run: `npx mocha test/unit/my-feature.test.js`

### E2E Test Example

Create: `test/e2e/my-feature.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('My Feature', () => {
  test('should display correctly', async ({ page }) => {
    // Navigate
    await page.goto('/');

    // Interact
    await page.locator('#my-button').click();

    // Assert
    await expect(page.locator('#result')).toHaveText('Success');
  });
});
```

Run: `npx playwright test test/e2e/my-feature.spec.js`

## Test Coverage

After running tests with coverage:

```bash
npm run test:coverage
```

Open the report:
```bash
# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html

# Windows
start coverage/index.html
```

The report shows:
- Line coverage (% of lines executed)
- Branch coverage (% of if/else branches covered)
- Function coverage (% of functions called)
- Statement coverage (% of statements executed)

Aim for:
- Critical code: >90% coverage
- Overall: >80% coverage
- Don't obsess over 100%

## CI/CD Integration

Add to `.github/workflows/test.yml`:

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

## Best Practices

1. **Run tests before committing**
   ```bash
   npm test && npm run test:e2e
   ```

2. **Write tests for new features**
   - Unit test for logic
   - E2E test for user workflows

3. **Keep tests fast**
   - Unit tests: < 1s total
   - E2E tests: < 30s per file

4. **Make tests independent**
   - Each test should run in isolation
   - Don't depend on test order

5. **Use descriptive names**
   ```javascript
   // Good
   test('should disable next button on last puzzle')

   // Bad
   test('button test')
   ```

## Getting Help

1. Check documentation:
   - `/home/connor/devshop/chessLessons/TESTING_GUIDE.md`
   - `/home/connor/devshop/chessLessons/test/README.md`

2. View examples in existing tests:
   - `/home/connor/devshop/chessLessons/test/unit/app.test.js`
   - `/home/connor/devshop/chessLessons/test/e2e/navigation.spec.js`

3. Official documentation:
   - Mocha: https://mochajs.org/
   - Chai: https://www.chaijs.com/
   - Playwright: https://playwright.dev/

## Cheat Sheet

```bash
# Quick Commands
npm test                 # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Interactive UI
npm run test:coverage   # Coverage report
npm run test:watch      # Watch mode

# Debug
npm run test:e2e:debug  # Debug E2E
DEBUG=* npm test        # Debug unit tests

# Specific
npx mocha test/unit/app.test.js              # One file
npx playwright test test/e2e/navigation.spec.js  # One file
npx mocha test/unit/app.test.js --grep "PGN"    # One test
```

---

**Ready to test!** Start with `npm install && npx playwright install && npm test`
