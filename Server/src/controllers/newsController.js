const newsService = require("../services/newsService");

/**
 * GET /api/news
 * Fetch all aggregated news with filtering and pagination
 * Query Params: ?category=tech&country=US&limit=20&page=1&deepScrape=false
 */
exports.getAllNews = async (req, res) => {
  try {
    const {
      category = "all",
      country = "GLOBAL",
      limit = 20,
      page = 1,
      deepScrape = "false"
    } = req.query;

    const data = await newsService.fetchAllNews({
      category,
      country,
      limit: Math.min(50, Math.max(1, parseInt(limit, 10) || 20)),
      page: Math.max(1, parseInt(page, 10) || 1),
      deepScrape: deepScrape === "true" || deepScrape === "1"
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllNews:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message
    });
  }
};

/**
 * GET /api/news/search
 * Search real-time news by query keywords
 * Query Params: ?q=AI+GPT+model&category=technology&country=US&limit=20&page=1
 */
exports.searchNews = async (req, res) => {
  try {
    const {
      q = "",
      query = "",
      category = "all",
      country = "GLOBAL",
      limit = 20,
      page = 1,
      deepScrape = "false"
    } = req.query;

    const searchQuery = q || query || "";
    if (!searchQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required."
      });
    }

    const data = await newsService.fetchNewsByQuery({
      query: searchQuery,
      category,
      country,
      limit: Math.min(50, Math.max(1, parseInt(limit, 10) || 20)),
      page: Math.max(1, parseInt(page, 10) || 1),
      deepScrape: deepScrape === "true" || deepScrape === "1"
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in searchNews:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to search news",
      error: error.message
    });
  }
};

/**
 * GET /api/news/curated
 * Fetch 5 Global News + 5 User Country Regional News
 * Query Params: ?country=IN&category=technology&limitGlobal=5&limitCountry=5
 */
exports.getCuratedFeed = async (req, res) => {
  try {
    // Detect country from query param or header (e.g. Cloudflare / CF-IPCountry)
    const clientCountry = req.query.country || req.headers["cf-ipcountry"] || req.user?.country || "IN";
    const {
      category = "technology",
      limitGlobal = 5,
      limitCountry = 5,
      deepScrape = "false"
    } = req.query;

    const data = await newsService.getCuratedFeed({
      country: clientCountry,
      category,
      limitGlobal: Math.min(20, Math.max(1, parseInt(limitGlobal, 10) || 5)),
      limitCountry: Math.min(20, Math.max(1, parseInt(limitCountry, 10) || 5)),
      deepScrape: deepScrape === "true" || deepScrape === "1"
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getCuratedFeed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch curated news feed",
      error: error.message
    });
  }
};

/**
 * POST /api/news/scrape-article
 * Deep scrape any article URL for full text, headings, and all images
 * Body: { url: "https://..." }
 */
exports.scrapeArticle = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "A valid article 'url' starting with http is required."
      });
    }

    const scrapedData = await newsService.scrapeArticleContent(url);
    if (!scrapedData) {
      return res.status(404).json({
        success: false,
        message: "Could not extract article content from the specified URL."
      });
    }

    return res.status(200).json({
      success: true,
      url,
      data: scrapedData
    });
  } catch (error) {
    console.error("Error in scrapeArticle:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to scrape article",
      error: error.message
    });
  }
};

/**
 * GET /api/news/categories
 * Returns all supported categories
 */
exports.getCategories = (req, res) => {
  const categories = newsService.getCategories();
  return res.status(200).json({ success: true, categories });
};

/**
 * GET /api/news/countries
 * Returns all supported country regions
 */
exports.getCountries = (req, res) => {
  const countries = newsService.getCountries();
  return res.status(200).json({ success: true, countries });
};
