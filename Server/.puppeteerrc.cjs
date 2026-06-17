/**
 * Puppeteer configuration for Render.com deployment.
 *
 * By default Puppeteer caches Chrome at /opt/render/.cache/puppeteer which
 * lives OUTSIDE the project directory and is wiped on every new deploy.
 *
 * Setting cacheDirectory to a path INSIDE the project makes Render persist
 * it between deploys via its build cache, so Chrome is only downloaded once.
 *
 * Reference: https://pptr.dev/guides/configuration
 */
const { join } = require('path');

/** @type {import("puppeteer").Configuration} */
module.exports = {
  // Store downloaded browsers inside the project so Render persists them.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
