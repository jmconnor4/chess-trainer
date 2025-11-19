/**
 * Mocha Test Setup
 * This file is loaded before all tests and sets up the testing environment
 */

const { JSDOM } = require('jsdom');
const chai = require('chai');

// Make chai available globally
global.expect = chai.expect;
global.assert = chai.assert;

/**
 * Setup browser-like environment for frontend tests
 * This creates a fake DOM environment for testing frontend code
 */
function setupDOMEnvironment() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;

  // Mock fetch for frontend tests
  global.fetch = require('node-fetch');

  return dom;
}

/**
 * Cleanup DOM environment after tests
 */
function cleanupDOMEnvironment() {
  if (global.window) {
    global.window.close();
  }
  delete global.window;
  delete global.document;
  delete global.navigator;
  delete global.HTMLElement;
}

/**
 * Create a fresh DOM for each test
 */
function createFreshDOM(htmlContent = '<!DOCTYPE html><html><body></body></html>') {
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  return {
    window: dom.window,
    document: dom.window.document,
  };
}

// Export utilities
module.exports = {
  setupDOMEnvironment,
  cleanupDOMEnvironment,
  createFreshDOM,
};
