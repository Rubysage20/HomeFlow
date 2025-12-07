const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'important', 'celebration', 'reminder'],
    default: 'info'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic expiration
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Announcement', announcementSchema);