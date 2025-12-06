const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { compressPDF, batchCompressPDF } = require('../controllers/pdfController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Compression routes
router.post('/compress', upload.single('pdf'), compressPDF);
router.post('/compress/batch', upload.array('pdfs', 10), batchCompressPDF);

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

module.exports = router;