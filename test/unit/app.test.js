/**
 * Unit Tests for ChessPuzzleApp (Frontend)
 * Tests the client-side application logic
 */

const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { createFreshDOM } = require('../helpers/setup');

describe('ChessPuzzleApp', () => {
  let ChessPuzzleApp;
  let dom;
  let fetchStub;

  beforeEach(() => {
    // Create a fresh DOM with the necessary HTML structure
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="puzzle-info"></div>
          <div id="puzzle-counter"></div>
          <button id="prev-btn"></button>
          <button id="next-btn"></button>
          <ct-pgn-viewer></ct-pgn-viewer>
        </body>
      </html>
    `;

    dom = createFreshDOM(htmlContent);
    global.window = dom.window;
    global.document = dom.document;

    // Mock fetch BEFORE loading the app code
    fetchStub = sinon.stub(global, 'fetch');
    // Set default stub behavior to prevent errors
    fetchStub.resolves({
      ok: true,
      json: async () => ({ puzzles: [] }),
      text: async () => '[Event "Test"]\n\n1.e4'
    });

    // Load the app code
    const appCode = fs.readFileSync(
      path.join(__dirname, '../../src/app.js'),
      'utf8'
    );

    // Modify the code to not auto-initialize on DOMContentLoaded
    // and to expose the class globally
    const modifiedCode = appCode
      .replace(
        /document\.addEventListener\('DOMContentLoaded',.*?\}\);/s,
        '// DOMContentLoaded handler removed for testing'
      )
      .replace(
        'class ChessPuzzleApp',
        'window.ChessPuzzleApp = class ChessPuzzleApp'
      );

    // Execute app code in the context of our fake DOM
    eval(modifiedCode);

    // Get the ChessPuzzleApp class from the window
    ChessPuzzleApp = global.window.ChessPuzzleApp;
  });

  afterEach(() => {
    if (fetchStub) {
      fetchStub.restore();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with empty puzzles array', () => {
      // Mock fetch to prevent actual API calls
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      expect(app.puzzles).to.be.an('array');
      expect(app.currentIndex).to.equal(0);
    });

    it('should set currentIndex to 0 initially', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      expect(app.currentIndex).to.equal(0);
    });
  });

  describe('loadPuzzleList()', () => {
    it('should fetch puzzle list from API', async () => {
      const mockPuzzles = ['puzzle1.pgn', 'puzzle2.pgn', 'puzzle3.pgn'];
      fetchStub.resolves({
        json: async () => ({ puzzles: mockPuzzles })
      });

      const app = new ChessPuzzleApp();
      // Wait for init to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetchStub.calledWith('/api/puzzles')).to.be.true;
    });

    it('should populate puzzles array with fetched data', async () => {
      const mockPuzzles = ['puzzle1.pgn', 'puzzle2.pgn'];
      fetchStub.resolves({
        json: async () => ({ puzzles: mockPuzzles })
      });

      const app = new ChessPuzzleApp();
      await app.loadPuzzleList();

      expect(app.puzzles).to.deep.equal(mockPuzzles);
    });

    it('should handle fetch errors gracefully', async () => {
      fetchStub.rejects(new Error('Network error'));

      const app = new ChessPuzzleApp();
      await app.loadPuzzleList();

      expect(app.puzzles).to.deep.equal([]);
    });

    it('should handle missing puzzles property in response', async () => {
      fetchStub.resolves({
        json: async () => ({})
      });

      const app = new ChessPuzzleApp();
      await app.loadPuzzleList();

      expect(app.puzzles).to.deep.equal([]);
    });
  });

  describe('parsePGNMetadata()', () => {
    it('should parse PGN metadata correctly', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const pgnContent = fs.readFileSync(
        path.join(__dirname, '../fixtures/test-puzzle.pgn'),
        'utf8'
      );

      const metadata = app.parsePGNMetadata(pgnContent);

      expect(metadata).to.have.property('Event', 'Test Puzzle');
      expect(metadata).to.have.property('Date', '2024.01.01');
      expect(metadata).to.have.property('White', 'TestPlayer1');
      expect(metadata).to.have.property('Black', 'TestPlayer2');
    });

    it('should extract FEN from metadata', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const pgnContent = `[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]`;

      const metadata = app.parsePGNMetadata(pgnContent);
      expect(metadata.FEN).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('should extract custom fields like Difficulty and Theme', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const pgnContent = `[Difficulty "Hard"]\n[Theme "Checkmate"]`;

      const metadata = app.parsePGNMetadata(pgnContent);
      expect(metadata.Difficulty).to.equal('Hard');
      expect(metadata.Theme).to.equal('Checkmate');
    });

    it('should handle empty PGN content', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const metadata = app.parsePGNMetadata('');

      expect(metadata).to.deep.equal({});
    });

    it('should handle PGN with no metadata tags', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const metadata = app.parsePGNMetadata('1.e4 e5 2.Nf3');

      expect(metadata).to.deep.equal({});
    });
  });

  describe('updateInfoPanel()', () => {
    it('should update info panel with puzzle metadata', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const metadata = {
        Event: 'Test Event',
        Date: '2024.01.01',
        White: 'Player1',
        Black: 'Player2',
        Result: '1-0',
        Difficulty: 'Medium',
        Theme: 'Tactics'
      };

      app.updateInfoPanel(metadata, 'test.pgn');

      const infoPanel = document.getElementById('puzzle-info');
      expect(infoPanel.innerHTML).to.include('Test Event');
      expect(infoPanel.innerHTML).to.include('Player1');
      expect(infoPanel.innerHTML).to.include('Medium');
      expect(infoPanel.innerHTML).to.include('Tactics');
    });

    it('should display default values for missing metadata', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      app.updateInfoPanel({}, 'test.pgn');

      const infoPanel = document.getElementById('puzzle-info');
      expect(infoPanel.innerHTML).to.include('Unknown');
      expect(infoPanel.innerHTML).to.include('Not rated');
    });

    it('should include description if provided', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const metadata = {
        Description: 'This is a test description'
      };

      app.updateInfoPanel(metadata, 'test.pgn');

      const infoPanel = document.getElementById('puzzle-info');
      expect(infoPanel.innerHTML).to.include('This is a test description');
    });

    it('should not show description section if not available', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      app.updateInfoPanel({}, 'test.pgn');

      const infoPanel = document.getElementById('puzzle-info');
      expect(infoPanel.innerHTML).to.not.include('No description available');
    });
  });

  describe('updateNavigation()', () => {
    it('should update puzzle counter display', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: ['p1.pgn', 'p2.pgn', 'p3.pgn'] })
      });

      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn', 'p3.pgn'];
      app.currentIndex = 1;
      app.updateNavigation();

      const counter = document.getElementById('puzzle-counter');
      expect(counter.textContent).to.equal('Puzzle 2 of 3');
    });

    it('should disable prev button on first puzzle', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: ['p1.pgn', 'p2.pgn'] })
      });

      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn'];
      app.currentIndex = 0;
      app.updateNavigation();

      const prevBtn = document.getElementById('prev-btn');
      expect(prevBtn.disabled).to.be.true;
    });

    it('should disable next button on last puzzle', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: ['p1.pgn', 'p2.pgn'] })
      });

      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn'];
      app.currentIndex = 1;
      app.updateNavigation();

      const nextBtn = document.getElementById('next-btn');
      expect(nextBtn.disabled).to.be.true;
    });

    it('should enable both buttons when in middle of puzzle list', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: ['p1.pgn', 'p2.pgn', 'p3.pgn'] })
      });

      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn', 'p3.pgn'];
      app.currentIndex = 1;
      app.updateNavigation();

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      expect(prevBtn.disabled).to.be.false;
      expect(nextBtn.disabled).to.be.false;
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] }),
        text: async () => '[Event "Test"]\n\n1.e4'
      });
    });

    it('previousPuzzle() should decrement currentIndex', async () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn', 'p3.pgn'];
      app.currentIndex = 2;

      const loadSpy = sinon.spy(app, 'loadPuzzle');
      app.previousPuzzle();

      expect(loadSpy.calledWith(1)).to.be.true;
    });

    it('previousPuzzle() should not go below 0', () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn'];
      app.currentIndex = 0;

      const loadSpy = sinon.spy(app, 'loadPuzzle');
      app.previousPuzzle();

      expect(loadSpy.called).to.be.false;
    });

    it('nextPuzzle() should increment currentIndex', () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn', 'p3.pgn'];
      app.currentIndex = 0;

      const loadSpy = sinon.spy(app, 'loadPuzzle');
      app.nextPuzzle();

      expect(loadSpy.calledWith(1)).to.be.true;
    });

    it('nextPuzzle() should not exceed puzzle count', () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn', 'p2.pgn'];
      app.currentIndex = 1;

      const loadSpy = sinon.spy(app, 'loadPuzzle');
      app.nextPuzzle();

      expect(loadSpy.called).to.be.false;
    });
  });

  describe('loadPuzzle()', () => {
    beforeEach(() => {
      fetchStub.resolves({
        json: async () => ({ puzzles: ['p1.pgn'] }),
        text: async () => '[Event "Test"]\n\n1.e4'
      });
    });

    it('should fetch puzzle content from API', async () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['puzzle1.pgn'];

      await app.loadPuzzle(0);

      expect(fetchStub.calledWith('/api/puzzle/puzzle1.pgn')).to.be.true;
    });

    it('should handle invalid index gracefully', async () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn'];

      await app.loadPuzzle(-1);
      expect(fetchStub.callCount).to.be.lessThan(2);

      await app.loadPuzzle(10);
      expect(fetchStub.callCount).to.be.lessThan(3);
    });

    it('should update currentIndex when loading puzzle', async () => {
      const app = new ChessPuzzleApp();
      // Wait for init to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      app.puzzles = ['p1.pgn', 'p2.pgn'];
      app.currentIndex = 0;

      await app.loadPuzzle(1);

      expect(app.currentIndex).to.equal(1);
    });

    it('should handle fetch errors gracefully', async () => {
      const app = new ChessPuzzleApp();
      app.puzzles = ['p1.pgn'];

      fetchStub.rejects(new Error('Network error'));

      // Should not throw
      await app.loadPuzzle(0);
    });
  });

  describe('showNoPuzzlesMessage()', () => {
    it('should display appropriate message when no puzzles exist', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      app.showNoPuzzlesMessage();

      const counter = document.getElementById('puzzle-counter');
      expect(counter.textContent).to.equal('No puzzles');
    });

    it('should disable navigation buttons', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      app.showNoPuzzlesMessage();

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      expect(prevBtn.disabled).to.be.true;
      expect(nextBtn.disabled).to.be.true;
    });

    it('should show helpful message in info panel', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      app.showNoPuzzlesMessage();

      const infoPanel = document.getElementById('puzzle-info');
      expect(infoPanel.innerHTML).to.include('No Puzzles Found');
      expect(infoPanel.innerHTML).to.include('pgns/');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed PGN metadata', () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [] })
      });

      const app = new ChessPuzzleApp();
      const malformedPGN = '[Event "Test]\n[InvalidTag';

      const metadata = app.parsePGNMetadata(malformedPGN);
      // Should return partial metadata or empty object without crashing
      expect(metadata).to.be.an('object');
    });

    it('should handle null or undefined puzzle names', async () => {
      fetchStub.resolves({
        json: async () => ({ puzzles: [null, undefined, 'valid.pgn'] })
      });

      const app = new ChessPuzzleApp();
      await app.loadPuzzleList();

      // Should handle gracefully
      expect(app.puzzles).to.be.an('array');
    });
  });
});
