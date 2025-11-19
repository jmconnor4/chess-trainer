/**
 * Integration Tests for Chess Puzzle Flow
 * Tests the full puzzle loading and navigation flow
 */

const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { requestHandler } = require('../../src/server');

describe('Chess Puzzle Integration Tests', () => {
  let server;
  let app;
  let baseURL;

  before((done) => {
    // Start test server on a random port
    app = http.createServer(requestHandler);
    server = app.listen(0, () => {
      const port = server.address().port;
      baseURL = `http://localhost:${port}`;
      done();
    });
  });

  after((done) => {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Complete Puzzle Loading Flow', () => {
    it('should load puzzle list and then load first puzzle', async () => {
      // Step 1: Fetch puzzle list
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      expect(puzzleListRes.body.puzzles).to.be.an('array');
      expect(puzzleListRes.body.puzzles.length).to.be.greaterThan(0);

      // Step 2: Load first puzzle
      const firstPuzzle = puzzleListRes.body.puzzles[0];
      const puzzleRes = await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      expect(puzzleRes.text).to.include('[Event');
      expect(puzzleRes.text).to.be.a('string');
    });

    it('should navigate through all available puzzles', async () => {
      // Get all puzzles
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const puzzles = puzzleListRes.body.puzzles;

      // Load each puzzle sequentially
      for (let i = 0; i < puzzles.length; i++) {
        const puzzleRes = await request(baseURL)
          .get(`/api/puzzle/${puzzles[i]}`)
          .expect(200);

        expect(puzzleRes.text).to.include('[Event');
        console.log(`Successfully loaded puzzle ${i + 1}/${puzzles.length}: ${puzzles[i]}`);
      }
    });
  });

  describe('Puzzle Metadata Extraction Flow', () => {
    it('should extract and validate metadata from real puzzle files', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const firstPuzzle = puzzleListRes.body.puzzles[0];
      const puzzleRes = await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      const pgnContent = puzzleRes.text;

      // Parse metadata (using same logic as app)
      const metadata = {};
      const lines = pgnContent.split('\n');

      for (const line of lines) {
        const match = line.match(/\[(\w+)\s+"(.+)"\]/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      }

      // Verify expected metadata fields
      expect(metadata).to.have.property('Event');
      expect(metadata).to.have.property('FEN');
    });

    it('should validate FEN positions are properly formatted', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      for (const puzzle of puzzleListRes.body.puzzles) {
        const puzzleRes = await request(baseURL)
          .get(`/api/puzzle/${puzzle}`)
          .expect(200);

        const pgnContent = puzzleRes.text;
        const fenMatch = pgnContent.match(/\[FEN "(.+)"\]/);

        if (fenMatch) {
          const fen = fenMatch[1];
          // Basic FEN validation: should have 6 parts separated by spaces
          const fenParts = fen.split(' ');
          expect(fenParts.length).to.equal(6);

          // First part should contain valid piece notation
          const piecePlacement = fenParts[0];
          expect(piecePlacement).to.match(/^[rnbqkpRNBQKP1-8\/]+$/);
        }
      }
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle invalid puzzle requests gracefully', async () => {
      const invalidPuzzles = [
        'nonexistent.pgn',
        'invalid-name',
        '../../../etc/passwd',
        'test.txt'
      ];

      for (const invalidPuzzle of invalidPuzzles) {
        const res = await request(baseURL)
          .get(`/api/puzzle/${invalidPuzzle}`);

        // Should either return 404 or 403
        expect([403, 404]).to.include(res.status);
      }
    });

    it('should recover from network failures', async () => {
      // This test simulates the client-side retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const res = await request(baseURL)
            .get('/api/puzzles')
            .timeout(1000);

          if (res.status === 200) {
            expect(res.body.puzzles).to.be.an('array');
            break;
          }
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    });
  });

  describe('Navigation State Management', () => {
    it('should maintain correct state when navigating forward and backward', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const puzzles = puzzleListRes.body.puzzles;
      expect(puzzles.length).to.be.greaterThan(2);

      // Simulate navigation: 0 -> 1 -> 2 -> 1 -> 0
      const navigationSequence = [0, 1, 2, 1, 0];

      for (const index of navigationSequence) {
        const puzzle = puzzles[index];
        const res = await request(baseURL)
          .get(`/api/puzzle/${puzzle}`)
          .expect(200);

        expect(res.text).to.be.a('string');
        expect(res.text.length).to.be.greaterThan(0);
      }
    });

    it('should handle boundary conditions correctly', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const puzzles = puzzleListRes.body.puzzles;
      const lastIndex = puzzles.length - 1;

      // Test first puzzle
      await request(baseURL)
        .get(`/api/puzzle/${puzzles[0]}`)
        .expect(200);

      // Test last puzzle
      await request(baseURL)
        .get(`/api/puzzle/${puzzles[lastIndex]}`)
        .expect(200);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous puzzle requests', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const puzzles = puzzleListRes.body.puzzles;

      // Make concurrent requests for all puzzles
      const requests = puzzles.map(puzzle =>
        request(baseURL)
          .get(`/api/puzzle/${puzzle}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach(res => {
        expect(res.text).to.include('[Event');
      });
    });

    it('should handle rapid sequential requests', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const firstPuzzle = puzzleListRes.body.puzzles[0];

      // Make 10 rapid sequential requests
      for (let i = 0; i < 10; i++) {
        await request(baseURL)
          .get(`/api/puzzle/${firstPuzzle}`)
          .expect(200);
      }
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data for the same puzzle', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const firstPuzzle = puzzleListRes.body.puzzles[0];

      // Fetch the same puzzle multiple times
      const res1 = await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      const res2 = await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      const res3 = await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      // All responses should be identical
      expect(res1.text).to.equal(res2.text);
      expect(res2.text).to.equal(res3.text);
    });

    it('should maintain puzzle list order across requests', async () => {
      const res1 = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const res2 = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      expect(res1.body.puzzles).to.deep.equal(res2.body.puzzles);
    });
  });

  describe('Performance Tests', () => {
    it('should load puzzle list within acceptable time', async () => {
      const startTime = Date.now();

      await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 1 second
      expect(duration).to.be.lessThan(1000);
    });

    it('should load individual puzzles within acceptable time', async () => {
      const puzzleListRes = await request(baseURL)
        .get('/api/puzzles')
        .expect(200);

      const firstPuzzle = puzzleListRes.body.puzzles[0];
      const startTime = Date.now();

      await request(baseURL)
        .get(`/api/puzzle/${firstPuzzle}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 500ms
      expect(duration).to.be.lessThan(500);
    });
  });
});
