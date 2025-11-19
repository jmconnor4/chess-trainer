class ChessPuzzleApp {
  constructor() {
    this.puzzles = [];
    this.currentIndex = 0;
    this.pgnViewer = null;
    this.progressTracker = new ProgressTracker();
    this.init();
  }

  async init() {
    await this.loadPuzzleList();
    this.setupEventListeners();
    this.showWelcomeModal();
    if (this.puzzles.length > 0) {
      await this.loadPuzzle(0);
    } else {
      this.showNoPuzzlesMessage();
    }
  }

  showWelcomeModal() {
    const hasSeenWelcome = localStorage.getItem('chess-puzzle-welcome-seen');
    if (hasSeenWelcome) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'welcome-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'welcome-title');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="modal-backdrop" aria-hidden="true"></div>
      <div class="modal-content">
        <h2 id="welcome-title">Welcome to Chess Puzzle Trainer!</h2>
        <div class="welcome-steps">
          <div class="welcome-step">
            <span class="step-icon" role="img" aria-label="Chess piece">♟️</span>
            <h3>Study the Position</h3>
            <p>Each puzzle shows a critical moment from a real game. Your job is to find the best move or sequence.</p>
          </div>
          <div class="welcome-step">
            <span class="step-icon" role="img" aria-label="Target">🎯</span>
            <h3>Make Your Moves</h3>
            <p>Click on pieces to move them on the board. The puzzle will guide you through the solution.</p>
          </div>
          <div class="welcome-step">
            <span class="step-icon" role="img" aria-label="Book">📚</span>
            <h3>Learn & Progress</h3>
            <p>Read the description and hints to understand the tactical pattern. Navigate puzzles with arrows or keyboard.</p>
          </div>
        </div>
        <button class="cta-button" id="close-welcome-btn">Start Learning</button>
        <label class="dont-show-label">
          <input type="checkbox" id="dont-show-again"> Don't show this again
        </label>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('close-welcome-btn');
    const dontShowCheckbox = document.getElementById('dont-show-again');

    closeBtn.addEventListener('click', () => {
      if (dontShowCheckbox.checked) {
        localStorage.setItem('chess-puzzle-welcome-seen', 'true');
      }
      modal.remove();
    });

    // Close on backdrop click
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      modal.remove();
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && document.getElementById('welcome-modal')) {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  async loadPuzzleList() {
    try {
      const response = await fetch('/api/puzzles');
      const data = await response.json();
      console.log({data})
      this.puzzles = data.puzzles || [];
    } catch (error) {
      console.error('Error loading puzzle list:', error);
      this.puzzles = [];
    }
  }

  async loadPuzzle(index) {
    if (index < 0 || index >= this.puzzles.length) return;

    this.currentIndex = index;
    const puzzleName = this.puzzles[index];

    try {
      const response = await fetch(`/api/puzzle/${puzzleName}`);
      const pgnData = await response.text();

      // Update the PGN viewer
      const viewer = document.querySelector('ct-pgn-viewer');
      console.log({viewer})
      console.log({pgnData})
      viewer.textContent = pgnData.split(',').join('\n');

      // Parse PGN metadata
      const metadata = this.parsePGNMetadata(pgnData);
      this.updateInfoPanel(metadata, puzzleName);
      this.updateNavigation();

    } catch (error) {
      console.error('Error loading puzzle:', error);
    }
  }

  parsePGNMetadata(pgn) {
    const metadata = {};
    const lines = pgn.split('\n');

    for (const line of lines) {
      const match = line.match(/\[(\w+)\s+"(.+)"\]/);
      if (match) {
        metadata[match[1]] = match[2];
      }
    }

    return metadata;
  }

  updateInfoPanel(metadata, puzzleName) {
    const infoPanel = document.getElementById('puzzle-info');

    // Extract useful metadata
    const event = metadata.Event || 'Chess Puzzle';
    const date = metadata.Date || 'Unknown';
    const white = metadata.White || 'Unknown';
    const black = metadata.Black || 'Unknown';
    const result = metadata.Result || '*';
    const fen = metadata.FEN || 'Starting position';
    const difficulty = metadata.Difficulty || 'Not rated';
    const theme = metadata.Theme || 'Tactics';
    const description = metadata.Description || 'Find the best continuation in this position.';
    const hint = metadata.Hint || 'Look for forcing moves: checks, captures, and threats.';
    const objective = metadata.Objective || description;

    // Split themes for display as tags
    const themes = theme.split(',').map(t => t.trim());

    infoPanel.innerHTML = `
      <!-- Hero Section -->
      <div class="puzzle-hero">
        <div class="difficulty-badge ${difficulty.toLowerCase()}">${difficulty}</div>
        <h2 class="puzzle-title">${event}</h2>
        <div class="theme-tags">
          ${themes.map(t => `<span class="theme-tag">${t}</span>`).join('')}
        </div>
      </div>

      <!-- Learning Objective -->
      <section class="learning-section" aria-labelledby="objective-heading">
        <div class="section-label" id="objective-heading">Your Challenge</div>
        <p class="objective-text">${objective}</p>
      </section>

      <!-- Hints (Collapsible) -->
      <section class="hints-section">
        <button class="hint-toggle"
                aria-expanded="false"
                aria-controls="hint-content"
                onclick="this.setAttribute('aria-expanded', this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'); document.getElementById('hint-content').classList.toggle('visible')">
          <span>💡 Need a hint?</span>
          <span aria-hidden="true">▼</span>
        </button>
        <div id="hint-content" class="hint-content">
          ${hint}
        </div>
      </section>

      <!-- Game Metadata -->
      <section class="metadata-section" aria-labelledby="metadata-heading">
        <div class="section-label" id="metadata-heading">Game Details</div>
        <dl class="metadata-grid">
          <div class="metadata-item">
            <dt class="metadata-label">White</dt>
            <dd class="metadata-value">${white}</dd>
          </div>
          <div class="metadata-item">
            <dt class="metadata-label">Black</dt>
            <dd class="metadata-value">${black}</dd>
          </div>
          <div class="metadata-item">
            <dt class="metadata-label">Date</dt>
            <dd class="metadata-value">${date}</dd>
          </div>
          <div class="metadata-item">
            <dt class="metadata-label">Result</dt>
            <dd class="metadata-value">${result}</dd>
          </div>
        </dl>
      </section>
    `;
  }

  updateNavigation() {
    const counter = document.getElementById('puzzle-counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    counter.textContent = `Puzzle ${this.currentIndex + 1} of ${this.puzzles.length}`;

    prevBtn.disabled = this.currentIndex === 0;
    nextBtn.disabled = this.currentIndex === this.puzzles.length - 1;
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.addEventListener('click', () => this.previousPuzzle());
    nextBtn.addEventListener('click', () => this.nextPuzzle());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousPuzzle();
      } else if (e.key === 'ArrowRight') {
        this.nextPuzzle();
      }
    });
  }

  previousPuzzle() {
    if (this.currentIndex > 0) {
      this.loadPuzzle(this.currentIndex - 1);
    }
  }

  nextPuzzle() {
    if (this.currentIndex < this.puzzles.length - 1) {
      this.loadPuzzle(this.currentIndex + 1);
    }
  }

  showNoPuzzlesMessage() {
    const viewer = document.querySelector('ct-pgn-viewer');
    viewer.textContent = '[Event "No Puzzles"]\n\nNo puzzles found in the pgns directory. Please add .pgn files to get started.';

    const infoPanel = document.getElementById('puzzle-info');
    infoPanel.innerHTML = `
      <h2>No Puzzles Found</h2>
      <p>Add .pgn files to the <code>pgns/</code> directory to get started.</p>
    `;

    document.getElementById('puzzle-counter').textContent = 'No puzzles';
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
  }
}

// Progress Tracker Class
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    const saved = localStorage.getItem('chess-puzzle-progress');
    return saved ? JSON.parse(saved) : {};
  }

  markCompleted(puzzleId) {
    this.progress[puzzleId] = {
      completed: true,
      timestamp: new Date().toISOString()
    };
    this.save();
  }

  isCompleted(puzzleId) {
    return this.progress[puzzleId]?.completed || false;
  }

  save() {
    localStorage.setItem('chess-puzzle-progress', JSON.stringify(this.progress));
  }

  reset() {
    this.progress = {};
    localStorage.removeItem('chess-puzzle-progress');
  }

  getCompletedCount() {
    return Object.keys(this.progress).length;
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChessPuzzleApp();
});
