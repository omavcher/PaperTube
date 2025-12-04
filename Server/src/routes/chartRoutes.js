const express = require("express");
const router = express.Router();
const chartController = require('../controllers/chartController');

// Chart generation routes
router.get('/notes/:noteId/charts', chartController.getChartSessions);
router.get('/notes/:noteId/charts/:chartId', chartController.getChart);
router.post('/notes/generate-chart', chartController.generateChart);
router.put('/notes/chart-feedback', chartController.updateChartFeedback);
router.delete('/notes/:noteId/charts/:chartId', chartController.deleteChart);
router.delete('/notes/:noteId/charts', chartController.clearChartSession);

// Chart utility routes
router.post('/charts/reset-models', chartController.resetChartModels);
router.get('/charts/status', chartController.getChartModelStatus);
router.post('/charts/reset-tokens', chartController.resetChartTokenCounter);

module.exports = router;