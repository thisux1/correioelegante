const mongoose = require('mongoose');
const shortid = require('shortid');

const cardSchema = new mongoose.Schema({
  message: { type: String, required: true },
  recipient: { type: String, required: true },
  media: { type: String },
  sender: { type: String },
  theme: { type: String, default: 'theme1' },
  uniqueId: { type: String, unique: true, default: shortid.generate },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', cardSchema);