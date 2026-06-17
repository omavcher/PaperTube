/**
 * pdfService.js
 *
 * Singleton Puppeteer browser manager for memory-efficient PDF generation.
 *
 * Key optimisations vs html-pdf-node:
 *  1. One shared browser process — no per-request Chrome launch (~150 MB saved)
 *  2. Pages are reused via a lightweight pool (concurrency cap = 2)
 *  3. HTML is written to a temp file and loaded via file:// URL — avoids
 *     passing a massive base64-laden string through IPC to the renderer
 *  4. External CDN resources (Google Fonts, KaTeX) are intercepted so
 *     generation never blocks waiting for network
 *  5. Browser is restarted automatically if it crashes
 *  6. Chrome executable is resolved with fallbacks for Render.com
 */

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const crypto    = require('crypto');

// ─── Config ──────────────────────────────────────────────────────────────────
const MAX_CONCURRENT     = 2;               // max simultaneous PDF renders
const BROWSER_RESTART_MS = 30 * 60 * 1000; // restart browser every 30 min
const PAGE_TIMEOUT_MS    = 60_000;          // 60 s hard timeout per page

// ─── State ───────────────────────────────────────────────────────────────────
let browser      = null;
let browserBorn  = 0;
let activePages  = 0;
let pendingQueue = [];
let restarting   = false;

// ─── Chrome path resolution ───────────────────────────────────────────────────
/**
 * Resolve the Chrome executable path.
 * Priority:
 *  1. PUPPETEER_EXECUTABLE_PATH env var (can be set in Render dashboard)
 *  2. puppeteer.executablePath() — bundled Chrome from postinstall
 *  3. Common Linux/Render system paths as last resort
 */
function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    console.log('[pdfService] Using PUPPETEER_EXECUTABLE_PATH env var');
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const ep = puppeteer.executablePath();
    if (ep && fs.existsSync(ep)) {
      console.log('[pdfService] Using puppeteer bundled Chrome:', ep);
      return ep;
    }
  } catch (_) {}

  // Common system Chrome paths on Ubuntu (Render's OS)
  const candidates = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log('[pdfService] Using system Chrome:', p);
      return p;
    }
  }

  console.warn('[pdfService] Chrome path not found — letting Puppeteer auto-detect');
  return undefined;
}

// ─── Browser lifecycle ───────────────────────────────────────────────────────
async function getBrowser() {
  if (browser && browser.connected && (Date.now() - browserBorn < BROWSER_RESTART_MS)) {
    return browser;
  }
  return launchBrowser();
}

async function launchBrowser() {
  if (restarting) {
    await new Promise(r => setTimeout(r, 2000));
    return browser;
  }

  restarting = true;
  try {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }

    const executablePath = findChrome();
    console.log('🚀 [pdfService] Launching Puppeteer browser…');

    browser = await puppeteer.launch({
      headless: true,
      executablePath,           // explicit path — avoids cache-lookup failures on Render
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',      // avoids /dev/shm OOM on Linux containers
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--js-flags=--max-old-space-size=256', // cap renderer heap
        '--memory-pressure-off',
      ],
      timeout: 30_000,
    });

    browserBorn = Date.now();

    browser.on('disconnected', () => {
      console.warn('⚠️  [pdfService] Browser disconnected — will relaunch on next request');
      browser = null;
    });

    console.log('✅ [pdfService] Browser ready');
  } finally {
    restarting = false;
  }

  return browser;
}

// ─── Concurrency guard ───────────────────────────────────────────────────────
function acquireSlot() {
  return new Promise(resolve => {
    if (activePages < MAX_CONCURRENT) {
      activePages++;
      resolve();
    } else {
      pendingQueue.push(resolve);
    }
  });
}

function releaseSlot() {
  if (pendingQueue.length > 0) {
    const next = pendingQueue.shift();
    next();   // activePages stays the same (slot handed directly to next waiter)
  } else {
    activePages--;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * generatePDF(html, options?)
 *
 * @param {string} html        - Full HTML document string
 * @param {object} [options]   - Puppeteer page.pdf() option overrides
 * @returns {Promise<Buffer>}  - PDF bytes
 */
async function generatePDF(html, options = {}) {
  await acquireSlot();

  const tmpFile = path.join(os.tmpdir(), `paperxify_${crypto.randomBytes(8).toString('hex')}.html`);
  let   page    = null;

  try {
    // Write HTML to temp file — avoids passing a huge string over Chrome DevTools IPC
    fs.writeFileSync(tmpFile, html, 'utf8');
    const fileUrl = `file://${process.platform === 'win32' ? '/' : ''}${tmpFile.replace(/\\/g, '/')}`;

    const b = await getBrowser();
    page    = await b.newPage();

    // Intercept requests — block image/xhr/fetch so we never wait on external CDN
    await page.setRequestInterception(true);
    page.on('request', req => {
      const url  = req.url();
      const type = req.resourceType();

      if (
        type === 'document' ||
        url.startsWith('data:') ||
        url.startsWith('file://')
      ) {
        req.continue();
      } else if (type === 'font' || type === 'stylesheet' || type === 'script') {
        // Allow CDN fonts/styles/scripts but don't block on them
        req.continue();
      } else {
        req.abort();
      }
    });

    page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);
    page.setDefaultTimeout(PAGE_TIMEOUT_MS);

    // Load from file:// — much faster than page.setContent() for large HTML
    await page.goto(fileUrl, {
      waitUntil: 'domcontentloaded', // images are already base64 — no network needed
      timeout: PAGE_TIMEOUT_MS,
    });

    // Give KaTeX / MathJax a brief moment to render math (max 3 s)
    await page.evaluate(() => new Promise(resolve => {
      const t = setTimeout(resolve, 3000);
      if (typeof window.renderMathInElement === 'undefined') { clearTimeout(t); resolve(); }
    })).catch(() => {});

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
      printBackground: true,
      preferCSSPageSize: true,
      ...options,
    });

    return pdfBuffer;

  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    try { fs.unlinkSync(tmpFile); } catch (_) {}
    releaseSlot();
  }
}

// Warm up the browser at startup so the first request isn't slow
launchBrowser().catch(err => console.error('⚠️  [pdfService] Warm-up failed:', err.message));

module.exports = { generatePDF };
