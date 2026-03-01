const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin', 'bot'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  chatHistory: [messageSchema],
  resolvedAt: { type: Date },
  ticketId: { type: String, required: true, unique: true }
}, { timestamps: true });

// Pre-save to generate a random 8-character string for ticketId if not present
supportTicketSchema.pre('validate', function(next) {
  if (!this.ticketId) {
    this.ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
