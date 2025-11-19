# Chess Lessons Test Architecture

## Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ~45 tests (Playwright)
                    │   (Slowest)     │  Full user workflows
                    │                 │  Browser automation
                    └─────────────────┘
                   /                   \
              ┌──────────────────────────┐
              │  Integration Tests       │  ~15 tests (Mocha + Supertest)
              │  (Medium Speed)          │  API + Frontend integration
              │                          │  Real HTTP requests
              └──────────────────────────┘
             /                            \
        ┌─────────────────────────────────────┐
        │       Unit Tests                    │  ~35 tests (Mocha + Chai)
        │       (Fastest)                     │  Isolated function tests
        │                                     │  Mocked dependencies
        └─────────────────────────────────────┘
```

## System Architecture with Test Coverage

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (User)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Playwright E2E Tests                              │    │
│  │  - navigation.spec.js (15 tests)                   │    │
│  │  - puzzle-loading.spec.js (20 tests)               │    │
│  │  - keyboard.spec.js (10 tests)                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                  HTTP Server (Node.js)                       │
│  /home/connor/devshop/chessLessons/src/server.js            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Unit Tests: server.test.js (13 tests)             │    │
│  │  - GET /api/puzzles                                │    │
│  │  - GET /api/puzzle/:filename                       │    │
│  │  - Static file serving                             │    │
│  │  - Security (path traversal)                       │    │
│  │  - CORS headers                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Endpoints:                                                  │
│  ┌─────────────────────────────────────┐                   │
│  │ GET /                → index.html   │                   │
│  │ GET /api/puzzles     → JSON list    │                   │
│  │ GET /api/puzzle/:id  → PGN content  │                   │
│  │ GET /src/app.js      → JS file      │                   │
│  └─────────────────────────────────────┘                   │
└────────────────────┬─────────────────────────────────────────┘
                     │ Serves static files
                     ▼
┌──────────────────────────────────────────────────────────────┐
│              Frontend Application (Browser)                  │
│  /home/connor/devshop/chessLessons/src/app.js               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Unit Tests: app.test.js (22 tests)                │    │
│  │  - Constructor & init                              │    │
│  │  - loadPuzzleList()                                │    │
│  │  - parsePGNMetadata()                              │    │
│  │  - updateInfoPanel()                               │    │
│  │  - updateNavigation()                              │    │
│  │  - Navigation methods                              │    │
│  │  - loadPuzzle()                                    │    │
│  │  - Error handling                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Class: ChessPuzzleApp                                       │
│  ┌─────────────────────────────────────┐                   │
│  │ Properties:                         │                   │
│  │ - puzzles: string[]                 │                   │
│  │ - currentIndex: number              │                   │
│  │                                     │                   │
│  │ Methods:                            │                   │
│  │ - init()                            │                   │
│  │ - loadPuzzleList()                  │                   │
│  │ - loadPuzzle(index)                 │                   │
│  │ - parsePGNMetadata(pgn)             │                   │
│  │ - updateInfoPanel(metadata, name)   │                   │
│  │ - updateNavigation()                │                   │
│  │ - nextPuzzle()                      │                   │
│  │ - previousPuzzle()                  │                   │
│  │ - showNoPuzzlesMessage()            │                   │
│  └─────────────────────────────────────┘                   │
└────────────────────┬─────────────────────────────────────────┘
                     │ Fetch puzzles
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                   Data Layer (PGN Files)                     │
│  /home/connor/devshop/chessLessons/pgns/                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Integration Tests: puzzle-flow.test.js (15 tests) │    │
│  │  - Complete puzzle loading flow                    │    │
│  │  - API integration                                 │    │
│  │  - Metadata extraction                             │    │
│  │  - FEN validation                                  │    │
│  │  - Error recovery                                  │    │
│  │  - Performance benchmarks                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Files:                                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ puzzle1.pgn                         │                   │
│  │ puzzle2.pgn                         │                   │
│  │ puzzle3.pgn                         │                   │
│  └─────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

## Test Data Flow

```
┌─────────────┐
│  Test Suite │
└──────┬──────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────┐                    ┌─────────────────┐
│  Unit Tests  │                    │ Integration/E2E │
│   (Mocked)   │                    │  (Real Server)  │
└──────┬───────┘                    └────────┬────────┘
       │                                     │
       ├─── Stub fetch()                    ├─── HTTP GET /api/puzzles
       │                                     │
       ├─── Mock DOM                        ├─── HTTP GET /api/puzzle/puzzle1.pgn
       │                                     │
       ├─── Fake responses                  ├─── Browser automation
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌─────────────────┐
│   Execute    │                    │  Execute with   │
│  Functions   │                    │  Real Server    │
└──────┬───────┘                    └────────┬────────┘
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌─────────────────┐
│   Assertions │                    │   Assertions    │
│   (Chai)     │                    │   (Playwright)  │
└──────────────┘                    └─────────────────┘
```

## Test Execution Flow

### Unit Tests (Fast, Isolated)

```
npm test
   │
   ├─── Mocha loads .mocharc.json
   │
   ├─── Require test/helpers/setup.js
   │    └─── Setup JSDOM environment
   │    └─── Make Chai globally available
   │
   ├─── Run test/unit/server.test.js
   │    ├─── Test API endpoints (mocked)
   │    ├─── Test security
   │    └─── Test CORS
   │
   └─── Run test/unit/app.test.js
        ├─── Setup fresh DOM for each test
        ├─── Mock fetch()
        ├─── Test ChessPuzzleApp methods
        └─── Verify behavior
```

### Integration Tests (Medium Speed, Real APIs)

```
npm run test:integration
   │
   ├─── Start server (npm start)
   │
   ├─── Mocha runs test/integration/puzzle-flow.test.js
   │
   ├─── Make real HTTP requests
   │    ├─── GET /api/puzzles
   │    ├─── GET /api/puzzle/puzzle1.pgn
   │    └─── Validate responses
   │
   └─── Verify complete workflows
        ├─── Load list → load puzzle
        ├─── Navigate all puzzles
        └─── Handle errors
```

### E2E Tests (Slow, Full Automation)

```
npm run test:e2e
   │
   ├─── Playwright loads playwright.config.js
   │
   ├─── Start web server (npm start)
   │
   ├─── Launch browsers (Chromium, Firefox, WebKit)
   │
   ├─── Run test/e2e/navigation.spec.js
   │    ├─── Open http://localhost:3000
   │    ├─── Click buttons
   │    ├─── Verify DOM updates
   │    └─── Test keyboard navigation
   │
   ├─── Run test/e2e/puzzle-loading.spec.js
   │    ├─── Load puzzles
   │    ├─── Verify metadata display
   │    ├─── Test chess board rendering
   │    └─── Check performance
   │
   └─── Run test/e2e/keyboard.spec.js
        ├─── Test arrow keys
        ├─── Test tab navigation
        └─── Verify accessibility
```

## Test Dependencies Graph

```
┌────────────────────────────────────────────────┐
│              Test Environment                  │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │  Node.js + NPM                       │    │
│  └──────────────────────────────────────┘    │
│                    │                          │
│        ┌───────────┴───────────┐              │
│        │                       │              │
│   ┌────▼─────┐         ┌──────▼──────┐       │
│   │  Mocha   │         │  Playwright │       │
│   └────┬─────┘         └──────┬──────┘       │
│        │                      │              │
│   ┌────┴─────┬──────┬────┐   │              │
│   │          │      │    │   │              │
│ ┌─▼──┐  ┌───▼─┐ ┌──▼┐ ┌─▼───▼──┐           │
│ │Chai│  │Sinon│ │C8 │ │Browsers│           │
│ └────┘  └─────┘ └───┘ └────────┘           │
│   │        │      │        │                │
│   │   ┌────▼──────▼────┐   │                │
│   │   │  Supertest     │   │                │
│   │   └────────────────┘   │                │
│   │             │           │                │
│   └─────────────┴───────────┘                │
│                 │                            │
│        ┌────────▼────────┐                   │
│        │  JSDOM          │                   │
│        │  (DOM Emulation)│                   │
│        └─────────────────┘                   │
└────────────────────────────────────────────────┘
```

## File Dependencies

```
package.json
    │
    ├─── npm install → node_modules/
    │                   ├─── mocha
    │                   ├─── chai
    │                   ├─── sinon
    │                   ├─── @playwright/test
    │                   ├─── supertest
    │                   ├─── jsdom
    │                   └─── c8
    │
    ├─── .mocharc.json (Mocha config)
    │        │
    │        └─── test/helpers/setup.js
    │
    └─── playwright.config.js (Playwright config)
             │
             └─── webServer: npm start
```

## Test Isolation Strategies

### Unit Tests

```
┌─────────────────────────────────┐
│  Test 1                         │
│  ├─── beforeEach(): Mock fetch  │
│  ├─── Execute: loadPuzzleList() │
│  ├─── Assert: puzzles populated │
│  └─── afterEach(): Restore mocks│
└─────────────────────────────────┘
           │ Isolated
┌──────────▼──────────────────────┐
│  Test 2                         │
│  ├─── beforeEach(): Fresh mocks │
│  ├─── Execute: nextPuzzle()     │
│  ├─── Assert: index incremented │
│  └─── afterEach(): Cleanup      │
└─────────────────────────────────┘
```

### E2E Tests

```
┌─────────────────────────────────┐
│  Test 1: navigation.spec.js     │
│  ├─── Fresh browser context     │
│  ├─── Navigate to /             │
│  ├─── Execute: Click next       │
│  ├─── Assert: Counter updated   │
│  └─── Close context             │
└─────────────────────────────────┘
           │ Isolated
┌──────────▼──────────────────────┐
│  Test 2: puzzle-loading.spec.js │
│  ├─── Fresh browser context     │
│  ├─── Navigate to /             │
│  ├─── Execute: Load puzzle      │
│  ├─── Assert: Metadata shown    │
│  └─── Close context             │
└─────────────────────────────────┘
```

## Coverage Report Structure

```
npm run test:coverage
    │
    ├─── c8 collects coverage
    │
    └─── Generates report:
         │
         coverage/
         ├── index.html (Main report)
         ├── lcov-report/
         │   ├── index.html
         │   ├── src/
         │   │   ├── app.js.html
         │   │   └── server.js.html
         │   └── coverage.json
         └── lcov.info
```

## Continuous Testing Workflow

```
Developer writes code
         │
         ▼
    git commit
         │
         ├─── Pre-commit hook (optional)
         │    └─── npm test
         │
         ▼
     git push
         │
         ▼
   CI/CD Pipeline (GitHub Actions)
         │
         ├─── npm install
         │
         ├─── npm test (Unit + Integration)
         │    ├─── Pass → Continue
         │    └─── Fail → Stop deployment
         │
         ├─── npx playwright install
         │
         ├─── npm run test:e2e
         │    ├─── Pass → Continue
         │    └─── Fail → Stop deployment
         │
         └─── Deploy to production
```

## Test Execution Matrix

```
┌─────────────┬──────────┬─────────────┬──────────┬──────────┐
│ Test Type   │ Framework│ Speed       │ Isolation│ Scope    │
├─────────────┼──────────┼─────────────┼──────────┼──────────┤
│ Unit        │ Mocha    │ < 1s total  │ High     │ Function │
│ Integration │ Mocha    │ 2-5s total  │ Medium   │ API      │
│ E2E         │ Playwright│ 30-60s each│ Low      │ User Flow│
└─────────────┴──────────┴─────────────┴──────────┴──────────┘
```

## Browser Testing Matrix (Playwright)

```
┌──────────────┬──────────┬─────────┬────────────┐
│ Test File    │ Chromium │ Firefox │ WebKit     │
├──────────────┼──────────┼─────────┼────────────┤
│ navigation   │    ✓     │    ✓    │     ✓      │
│ puzzle-load  │    ✓     │    ✓    │     ✓      │
│ keyboard     │    ✓     │    ✓    │     ✓      │
└──────────────┴──────────┴─────────┴────────────┘

Total: 45 tests × 3 browsers = 135 test runs
```

## Mock Strategy

### What We Mock in Unit Tests

```
✓ Mocked:
  - global.fetch (network requests)
  - window/document (browser APIs)
  - ChessTempo viewer (external library)
  - File system (fs operations)

✗ NOT Mocked:
  - Core JavaScript (Array, Object, etc.)
  - ChessPuzzleApp class (code under test)
  - Test assertions (Chai)
```

### What's Real in E2E Tests

```
✓ Real:
  - Browser (Chromium/Firefox/WebKit)
  - HTTP server (Node.js)
  - DOM rendering
  - User interactions
  - Network requests
  - File system

✗ NOT Real:
  - External chess APIs (if any)
  - Third-party analytics (if any)
```

## Test Naming Convention

```
Unit Tests:
  describe('ClassName/FunctionName', () => {
    it('should [expected behavior] when [condition]', () => {})
  })

E2E Tests:
  test.describe('Feature Name', () => {
    test('should [user action] and [expected result]', async ({ page }) => {})
  })
```

## Debugging Architecture

```
Development Mode:
  npm run test:watch        → Auto-rerun on file changes
  npm run test:e2e:ui       → Interactive Playwright UI
  npm run test:e2e:debug    → Step-through debugging

Production/CI Mode:
  npm test                  → Run all Mocha tests
  npm run test:e2e         → Run all Playwright tests
  npm run test:coverage    → Generate coverage report
```

## Performance Benchmarks

```
Expected Test Execution Times:

Unit Tests:
  server.test.js        < 500ms
  app.test.js          < 1000ms
  Total                < 2000ms

Integration Tests:
  puzzle-flow.test.js  2000-5000ms

E2E Tests (per browser):
  navigation.spec.js      5-10s
  puzzle-loading.spec.js  10-15s
  keyboard.spec.js        5-10s
  Total per browser      20-35s
  Total all browsers     60-105s
```

---

**Legend:**
- → : Data flow / Dependency
- ├─ : Child element
- └─ : Last child element
- ▼ : Sequential flow
- ✓ : Included/Tested
- ✗ : Excluded/Not tested
