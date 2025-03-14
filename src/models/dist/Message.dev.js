"use strict";

// src/models/Message.js
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  media: {
    type: String
  },
  user: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    "default": 'theme1'
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  paymentStatus: {
    type: String,
    "default": 'pending',
    "enum": ['pending', 'paid']
  },
  // Status do pagamento
  paymentId: {
    type: String
  } // ID da cobrança no Mercado Pago

});
module.exports = mongoose.model('Message', messageSchema);