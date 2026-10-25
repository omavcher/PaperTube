const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

// GET /api/news — Fetch all aggregated news
router.get("/", newsController.getAllNews);

// GET /api/news/curated — 5 Global + 5 User Country breaking news
router.get("/curated", newsController.getCuratedFeed);

// GET /api/news/search — Search news by keyword / topic
router.get("/search", newsController.searchNews);

// GET /api/news/categories — List all supported news categories
router.get("/categories", newsController.getCategories);

// GET /api/news/countries — List all supported country regions
router.get("/countries", newsController.getCountries);

// POST /api/news/scrape-article — Deep scrape full text & all images for a given article URL
router.post("/scrape-article", newsController.scrapeArticle);

module.exports = router;
