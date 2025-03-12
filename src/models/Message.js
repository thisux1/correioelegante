const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  recipient: { type: String, required: true },
  media: { type: String }, // Caminho do arquivo no servidor
  user: { type: String, required: true }, // Identificador do usuário
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);