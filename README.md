# Chess Puzzle Trainer

A simple, interactive chess puzzle trainer application that allows you to study chess positions from PGN files. Navigate through puzzles, analyze positions, and improve your chess tactics.

## Features

- Interactive chess board viewer powered by ChessTempo PGN Viewer
- Load and display chess puzzles from PGN files
- Navigate between puzzles using buttons or keyboard shortcuts
- View puzzle metadata including event, players, date, difficulty, and themes
- Clean, responsive interface
- Keyboard navigation support

## Prerequisites

- Node.js (any recent version)

## Installation

1. Clone or download this repository
2. No additional dependencies needed - the app uses Node.js built-in modules

## Project Structure

```
chessLessons/
├── index.html          # Main HTML file
├── server.js           # Node.js HTTP server
├── package.json        # Project configuration
├── src/
│   └── app.js          # Frontend application logic
├── styles/
│   └── main.css        # Application styles
└── pgns/               # Directory for your PGN puzzle files
    ├── puzzle1.pgn
    ├── puzzle2.pgn
    └── ...
```

## Setup

1. Add your chess puzzle PGN files to the `pgns/` directory
2. PGN files should have the `.pgn` extension
3. Optionally, add metadata to your PGN files for better organization:

```pgn
[Event "Tactical Exercise"]
[Date "2024.01.15"]
[White "Player1"]
[Black "Player2"]
[Result "*"]
[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]
[Difficulty "Intermediate"]
[Theme "Fork"]
[Description "Find the winning move for White"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 *
```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. The app will automatically load all PGN files from the `pgns/` directory

## Usage

### Navigation

- **Next Puzzle**: Click the "Next →" button or press the right arrow key (→)
- **Previous Puzzle**: Click the "← Previous" button or press the left arrow key (←)
- **Chess Board**: Use the ChessTempo viewer controls to play through moves

### Viewing Puzzle Information

The right panel displays:
- Puzzle filename
- Event name
- Date
- Players (White/Black)
- Game result
- Difficulty level (if specified in PGN)
- Theme/Category (if specified in PGN)
- Description (if specified in PGN)

## PGN Metadata Fields

The application recognizes standard and custom PGN metadata fields:

### Standard Fields
- `Event` - Tournament or event name
- `Date` - Date of the game
- `White` - White player name
- `Black` - Black player name
- `Result` - Game result (1-0, 0-1, 1/2-1/2, *)
- `FEN` - Starting position (if not the standard starting position)

### Custom Fields
- `Difficulty` - Puzzle difficulty (e.g., "Beginner", "Intermediate", "Advanced")
- `Theme` - Tactical theme (e.g., "Fork", "Pin", "Discovered Attack")
- `Description` - Puzzle instructions or hints

## API Endpoints

The server provides the following API endpoints:

- `GET /api/puzzles` - Returns a list of all available PGN files
- `GET /api/puzzle/:filename` - Returns the content of a specific PGN file

## Configuration

The server port can be configured using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

Default port is 3000.

## Browser Support

The application works in all modern browsers that support:
- ES6+ JavaScript
- Custom Elements (Web Components)
- Fetch API

## Troubleshooting

### No puzzles showing

1. Ensure PGN files are in the `pgns/` directory
2. Verify PGN files have the `.pgn` extension
3. Check the browser console for errors
4. Verify the server is running on http://localhost:3000

### PGN files not loading

1. Check that PGN files are properly formatted
2. Ensure files are saved with UTF-8 encoding
3. Check server logs for file reading errors

## Credits

- Chess board viewer: [ChessTempo PGN Viewer](https://chesstempo.com/)
- Built with vanilla JavaScript and Node.js

## License

This project is private and for personal use.
