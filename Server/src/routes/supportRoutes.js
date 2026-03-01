const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { 
  createTicket, 
  getUserTickets, 
  getTicket,
  addMessage,
  getAllTickets, 
  updateTicketStatus 
} = require('../controllers/supportController');

// User routes
router.post('/create', authMiddleware, createTicket);
router.get('/my-tickets', authMiddleware, getUserTickets);
router.get('/ticket/:id', authMiddleware, getTicket);
router.post('/ticket/:id/message', authMiddleware, addMessage);

// Admin routes
router.get('/admin/all', adminAuth, getAllTickets);
router.patch('/admin/ticket/:id', adminAuth, updateTicketStatus);
router.post('/admin/ticket/:id/message', adminAuth, addMessage);

module.exports = router;
