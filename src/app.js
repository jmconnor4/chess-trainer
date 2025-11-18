class ChessPuzzleApp {
  constructor() {
    this.puzzles = [];
    this.currentIndex = 0;
    this.pgnViewer = null;
    this.init();
  }

  async init() {
    await this.loadPuzzleList();
    this.setupEventListeners();
    if (this.puzzles.length > 0) {
      await this.loadPuzzle(0);
    } else {
      this.showNoPuzzlesMessage();
    }
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
      viewer.setHTMLUnsafe(pgnData);

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
    const event = metadata.Event || 'Unknown';
    const date = metadata.Date || 'Unknown';
    const white = metadata.White || 'Unknown';
    const black = metadata.Black || 'Unknown';
    const result = metadata.Result || '*';
    const fen = metadata.FEN || 'Starting position';

    // Custom fields (you can add these to your PGN files)
    const difficulty = metadata.Difficulty || 'Not rated';
    const theme = metadata.Theme || 'Tactics';
    const description = metadata.Description || 'No description available';

    infoPanel.innerHTML = `
      <h2>Puzzle Information</h2>
      <div class="info-item">
        <strong>File:</strong> ${puzzleName}
      </div>
      <div class="info-item">
        <strong>Event:</strong> ${event}
      </div>
      <div class="info-item">
        <strong>Date:</strong> ${date}
      </div>
      <div class="info-item">
        <strong>White:</strong> ${white}
      </div>
      <div class="info-item">
        <strong>Black:</strong> ${black}
      </div>
      <div class="info-item">
        <strong>Result:</strong> ${result}
      </div>
      <div class="info-item">
        <strong>Difficulty:</strong> ${difficulty}
      </div>
      <div class="info-item">
        <strong>Theme:</strong> ${theme}
      </div>
      ${description !== 'No description available' ? `
      <div class="info-item description">
        <strong>Description:</strong>
        <p>${description}</p>
      </div>
      ` : ''}
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

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChessPuzzleApp();
});
