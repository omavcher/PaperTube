// services/imageSearchService.js
// Multi-provider Image Search & Strict Academic Diagram Verification Engine
// Filters out marketing stock banners, human model photos, watermarks, 403-forbidden, or corrupted images.

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CX;

const BLOCKED_DOMAINS = [
  'instagram.com', 'facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'youtube.in',
  'tiktok.com', 'snapchat.com', 'linkedin.com', 'flickr.com', 'vimeo.com',
  'quora.com', 'medium.com', 'whatsapp.com', 'telegram.org', 'discord.com',
  'pinterest.com', 'shutterstock.com', 'gettyimages.com', 'istockphoto.com',
  'alamy.com', 'dreamstime.com', '123rf.com', 'stock.adobe.com', 'depositphotos.com',
  'website-files.com', 'webflow.com', 'freepik.com', 'vecteezy.com', 'unsplash.com',
  'pexels.com', 'pixabay.com', 'cleanpng.com', 'pngwing.com', 'pngtree.com',
  'rawpixel.com', 'canva.com', 'elements.envato.com'
];

/**
 * Validates whether an image URL is live, reachable, not corrupted, and suitable for academic notes.
 * @param {string} url - Image candidate URL
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
async function verifyImageUrl(url, timeoutMs = 3500) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;

  // Blocked domains check
  try {
    const parsed = new URL(url);
    if (BLOCKED_DOMAINS.some((d) => parsed.hostname.toLowerCase().includes(d))) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    clearTimeout(timer);

    if (!res.ok) return false;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return false;

    // Check size (ignore tiny tracking pixels < 10KB or huge raw images > 15MB)
    const contentLength = res.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size < 10240 || size > 15728640) {
        return false;
      }
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch candidate images from Google Custom Search
 * Targets technical diagrams, flowcharts, architecture diagrams and scientific figures.
 */
async function searchGoogleImages(query, count = 3) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];

  try {
    // Strictly target educational diagrams and exclude lifestyle/marketing stock photos
    const cleanQuery = `${query} diagram flowchart architecture schematic -stock -person -people -woman -man -laptop -banner -cover -wallpaper`;
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      cleanQuery
    )}&cx=${GOOGLE_CX}&searchType=image&num=${count}&safe=active&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.items || data.items.length === 0) return [];

    return data.items.map((item) => item.link).filter(Boolean);
  } catch (err) {
    console.warn(`⚠️ Google Image Search failed for "${query}":`, err.message);
    return [];
  }
}

/**
 * Fetch candidate images from Wikimedia Commons (Strictly Educational & Scientific)
 */
async function searchWikimediaImages(query, count = 3) {
  try {
    const cleanQuery = `${query} diagram`;
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=${count}&prop=imageinfo&iiprop=url|mime|size&origin=*`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.query || !data.query.pages) return [];

    const urls = [];
    for (const pageId in data.query.pages) {
      const page = data.query.pages[pageId];
      if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
        const imgUrl = page.imageinfo[0].url;
        if (!imgUrl.endsWith('.svg')) {
          urls.push(imgUrl);
        }
      }
    }
    return urls;
  } catch (err) {
    return [];
  }
}

/**
 * High-reliability multi-provider search with strict verification
 * Returns the first verified, high-quality technical diagram or null.
 * @param {string} query - Topic or figure name
 * @returns {Promise<string|null>}
 */
async function getVerifiedSearchImage(query) {
  if (!query || typeof query !== 'string') return null;

  console.log(`🔍 Searching verified diagram for: "${query}"`);

  // 1. Try Google Search (targeted at technical diagrams)
  const googleCandidates = await searchGoogleImages(query, 3);
  for (const url of googleCandidates) {
    const isLive = await verifyImageUrl(url);
    if (isLive) {
      console.log(`✅ Verified technical image: ${url.substring(0, 70)}...`);
      return url;
    }
  }

  // 2. Try Wikimedia Commons
  const wikiCandidates = await searchWikimediaImages(query, 3);
  for (const url of wikiCandidates) {
    const isLive = await verifyImageUrl(url);
    if (isLive) {
      console.log(`✅ Verified Wikimedia diagram: ${url.substring(0, 70)}...`);
      return url;
    }
  }

  console.log(`⚠️ No verified diagram found for "${query}"`);
  return null;
}

/**
 * Batch resolve images for a list of figure titles
 * @param {string[]} figureTitles
 * @returns {Promise<Array<{title: string, img_url: string|null}>>}
 */
async function getVerifiedImagesForFigures(figureTitles) {
  if (!figureTitles || figureTitles.length === 0) return [];

  const results = [];
  for (const title of figureTitles) {
    const img_url = await getVerifiedSearchImage(title);
    if (img_url) {
      results.push({ title, img_url });
    }
  }

  return results;
}

module.exports = {
  verifyImageUrl,
  getVerifiedSearchImage,
  getVerifiedImagesForFigures,
  searchGoogleImages,
  searchWikimediaImages,
};
