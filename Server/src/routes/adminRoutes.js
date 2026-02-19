// routes/flashcardRoutes.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/diagnostics', adminAuth, adminController.getDiagnostics);
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/user/:id', adminAuth, adminController.deleteUser);
router.get('/transactions', adminAuth, adminController.getAllTransactions);
router.get('/bugs', adminAuth, adminController.getAllBugs);
router.get('/creations', adminAuth, adminController.getRecentCreations);


router.get('/feedback', adminAuth, adminController.getAllFeedback);
router.delete('/feedback/:id', adminAuth, adminController.deleteFeedback);
router.patch('/feedback/:id', adminAuth, adminController.respondToFeedback);

router.get('/analytics/logs', adminAuth, adminController.getAnalytics);
router.get('/arcade-diagnostics', adminAuth, adminController.getArcadeDiagnostics);

router.get('/success-stories/all', adminController.adminGetAllStories);
router.patch('/success-stories/approve/:id',adminAuth, adminController.approveStory);
router.delete('/success-stories/delete/:id',adminAuth, adminController.deleteStory);

router.patch('/success-stories/update/:id',adminAuth, adminController.updateStory);

router.post('/blog/create',adminAuth, adminController.createPost);
router.get('/blog/all',adminAuth, adminController.getAllAdminPosts);
router.patch('/blog/update/:id',adminAuth, adminController.updatePost);
router.delete('/blog/delete/:id',adminAuth, adminController.deletePost);


router.get('/content-analytics',adminAuth, adminController.getContentAnalytics);

router.get("/analytics/tools", adminAuth, adminController.getToolAnalytics);
router.put('/note/:noteId/visibility',adminAuth, adminController.chnageNoteVisibility );
router.delete('/note/:noteId', adminAuth, adminController.deleteNote);

router.get('/reports/',adminAuth, adminController.getAllReports);
router.get('/reports/analytics',adminAuth, adminController.getReportsAnalytics);
router.get('/reports/user/:userId',adminAuth, adminController.getUserReports);
router.get('/reports/:id',adminAuth, adminController.getReportById);
router.patch('/reports/:id',adminAuth, adminController.updateReportStatus);
router.delete('/reports/:id',adminAuth, adminController.deleteReport);
router.get('/reports/analytics/top-reported', adminAuth, adminController.getTopReportedUsers);



router.get('/comments/analytics',adminAuth , adminController.getCommentAnalytics);

// Main CRUD routes
router.get('/comments/',adminAuth , adminController.getAllComments);
router.get('/comments/note/:noteId',adminAuth , adminController.getNoteComments);
router.get('/comments/:id',adminAuth , adminController.getCommentById);
router.patch('/comments/:id',adminAuth , adminController.updateComment);
router.delete('/comments/:id',adminAuth , adminController.deleteComment);

// Reply routes
router.patch('/comments/:commentId/replies/:replyId',adminAuth , adminController.updateReply);
router.delete('/comments/:commentId/replies/:replyId',adminAuth , adminController.deleteReply);

// Bulk operations
router.post('/comments/bulk-delete',adminAuth , adminController.bulkDeleteComments);



module.exports = router;