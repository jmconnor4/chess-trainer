const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PGNS_DIR = path.join(__dirname, '..', 'pgns');

// Export the request handler for testing
const requestHandler = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // API endpoint to list all PGN files
  if (req.url === '/api/puzzles' && req.method === 'GET') {
    fs.readdir(PGNS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error reading puzzles directory' }));
        return;
      }

      const pgnFiles = files
        .filter(file => file.endsWith('.pgn'))
        .sort();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ puzzles: pgnFiles }));
    });
    return;
  }

  // API endpoint to get a specific PGN file
  if (req.url.startsWith('/api/puzzle/') && req.method === 'GET') {
    const filename = req.url.replace('/api/puzzle/', '');
    const filePath = path.join(PGNS_DIR, filename);

    // Security check: ensure the file is within PGNS_DIR
    if (!filePath.startsWith(PGNS_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Puzzle not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(data);
    });
    return;
  }

  // Serve static files
  let filePath = req.url === '/'
    ? path.join(__dirname, '..', 'index.html')
    : path.join(__dirname, '..', req.url);

  const extname = path.extname(filePath);
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
  };

  const contentType = contentTypeMap[extname] || 'text/plain';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

// Create server
const server = http.createServer(requestHandler);

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

// Export for testing
module.exports = { requestHandler, server, PGNS_DIR };
