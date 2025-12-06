const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Compression settings
const COMPRESSION_LEVELS = {
    low: {
        name: 'Low',
        quality: 90,
        imageQuality: 85,
        downsampleRatio: 1,
        removeMetadata: false
    },
    medium: {
        name: 'Medium',
        quality: 80,
        imageQuality: 75,
        downsampleRatio: 0.75,
        removeMetadata: true
    },
    high: {
        name: 'High',
        quality: 70,
        imageQuality: 65,
        downsampleRatio: 0.5,
        removeMetadata: true
    },
    extreme: {
        name: 'Extreme',
        quality: 60,
        imageQuality: 50,
        downsampleRatio: 0.25,
        removeMetadata: true
    }
};

// Helper function to compress images in PDF
async function compressImages(pdfBytes, compressionLevel) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const images = await page.getImages();
            
            for (const image of images) {
                try {
                    const imageRef = image.ref;
                    const imageDict = pdfDoc.context.lookup(imageRef);
                    
                    // Get image data
                    const imageBytes = imageDict.getValue('Contents')?.value;
                    if (!imageBytes) continue;
                    
                    // Compress image based on level
                    const compressedImage = await sharp(imageBytes)
                        .jpeg({ quality: compressionLevel.imageQuality })
                        .resize({ 
                            width: Math.round(sharp.metadata().width * compressionLevel.downsampleRatio),
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .toBuffer();
                    
                    // Replace image in PDF
                    const newImage = await pdfDoc.embedJpg(compressedImage);
                    page.drawImage(newImage, {
                        x: image.x,
                        y: image.y,
                        width: image.width * compressionLevel.downsampleRatio,
                        height: image.height * compressionLevel.downsampleRatio
                    });
                    
                } catch (imageError) {
                    console.warn(`Failed to compress image on page ${i + 1}:`, imageError.message);
                    continue;
                }
            }
        }
        
        // Remove metadata if configured
        if (compressionLevel.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
            pdfDoc.setCreationDate(new Date());
            pdfDoc.setModificationDate(new Date());
        }
        
        // Save with compression
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 100
        });
        
        return compressedBytes;
        
    } catch (error) {
        console.error('Image compression failed:', error);
        return pdfBytes; // Return original if compression fails
    }
}

// Main compression function
exports.compressPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded'
            });
        }

        const { compressionLevel = 'medium', fileName } = req.body;
        const levelConfig = COMPRESSION_LEVELS[compressionLevel] || COMPRESSION_LEVELS.medium;
        
        console.log(`Compressing PDF with level: ${compressionLevel}`);
        
        // Get original file info
        const originalSize = req.file.size;
        const originalName = fileName || req.file.originalname;
        
        // Perform compression
        const compressedBytes = await compressImages(req.file.buffer, levelConfig);
        const compressedSize = compressedBytes.length;
        
        // Calculate compression ratio
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const compressedFileName = `compressed_${path.parse(originalName).name}_${timestamp}_${randomString}.pdf`;
        
        // Send response
        res.json({
            success: true,
            data: {
                originalName,
                compressedName: compressedFileName,
                originalSize,
                compressedSize,
                compressionRatio: parseFloat(compressionRatio),
                compressionLevel: levelConfig.name,
                fileData: compressedBytes.toString('base64')
            }
        });
        
    } catch (error) {
        console.error('PDF compression error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compress PDF',
            details: error.message
        });
    }
};

// Batch compression function
exports.batchCompressPDF = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No PDF files uploaded'
            });
        }

        const { compressionLevel = 'medium' } = req.body;
        const levelConfig = COMPRESSION_LEVELS[compressionLevel] || COMPRESSION_LEVELS.medium;
        
        console.log(`Batch compressing ${req.files.length} PDFs with level: ${compressionLevel}`);
        
        const results = [];
        
        for (const file of req.files) {
            try {
                const originalSize = file.size;
                
                // Perform compression
                const compressedBytes = await compressImages(file.buffer, levelConfig);
                const compressedSize = compressedBytes.length;
                
                // Calculate compression ratio
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
                
                // Generate unique filename
                const timestamp = Date.now();
                const randomString = crypto.randomBytes(4).toString('hex');
                const compressedFileName = `compressed_${path.parse(file.originalname).name}_${timestamp}_${randomString}.pdf`;
                
                results.push({
                    originalName: file.originalname,
                    compressedName: compressedFileName,
                    originalSize,
                    compressedSize,
                    compressionRatio: parseFloat(compressionRatio),
                    compressionLevel: levelConfig.name,
                    fileData: compressedBytes.toString('base64')
                });
                
            } catch (fileError) {
                console.error(`Failed to compress ${file.originalname}:`, fileError);
                results.push({
                    originalName: file.originalname,
                    error: 'Compression failed',
                    details: fileError.message
                });
            }
        }
        
        // Calculate batch statistics
        const successfulCompressions = results.filter(r => !r.error);
        const totalOriginalSize = successfulCompressions.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = successfulCompressions.reduce((sum, r) => sum + r.compressedSize, 0);
        const avgCompressionRatio = successfulCompressions.length > 0 
            ? successfulCompressions.reduce((sum, r) => sum + r.compressionRatio, 0) / successfulCompressions.length
            : 0;
        
        res.json({
            success: true,
            data: {
                files: results,
                summary: {
                    totalFiles: req.files.length,
                    successful: successfulCompressions.length,
                    failed: results.length - successfulCompressions.length,
                    totalOriginalSize,
                    totalCompressedSize,
                    totalSavings: totalOriginalSize - totalCompressedSize,
                    avgCompressionRatio: parseFloat(avgCompressionRatio.toFixed(2))
                }
            }
        });
        
    } catch (error) {
        console.error('Batch PDF compression error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compress PDFs',
            details: error.message
        });
    }
};