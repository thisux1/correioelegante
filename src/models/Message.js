const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  senderName: { type: String, default: '' },
  message: { type: String, required: true },
  theme: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);