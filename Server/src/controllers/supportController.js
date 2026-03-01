const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

const createTicket = async (req, res) => {
  try {
    const { category, description, chatHistory } = req.body;
    const userId = req.user._id || req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newTicket = new SupportTicket({
      userId,
      userEmail: user.email,
      category,
      description,
      chatHistory: chatHistory || []
    });

    await newTicket.save();

    res.status(201).json({ success: true, message: 'Ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Server error creating ticket' });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tickets' });
  }
};

const getTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    const userId = req.user._id || req.user.id;
    // ensure user owns ticket unless admin (admin check handled at route generally)
    if (ticket.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ticket' });
  }
};

const addMessage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { message, sender } = req.body; // user or admin
    
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.chatHistory.push({
      sender,
      message,
      createdAt: new Date()
    });

    // If a user replies, ensure status is 'In Progress' rather than 'Resolved'
    if (sender === 'user' && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    res.status(200).json({ success: true, message: 'Message added', ticket });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ success: false, message: 'Server error adding message' });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tickets' });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const ticketId = req.params.id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) {
      ticket.status = status;
      if (status === 'Resolved' || status === 'Closed') {
        ticket.resolvedAt = new Date();
      }
    }
    
    if (priority) {
      ticket.priority = priority;
    }

    await ticket.save();

    res.status(200).json({ success: true, message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, message: 'Server error updating ticket' });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicket,
  addMessage,
  getAllTickets,
  updateTicketStatus
};
