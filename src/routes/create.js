// src/routes/create.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  res.render('create', { title: 'Escreva Sua Mensagem', isLoggedIn: !!req.session.user });
});

router.post('/', upload.single('media'), async (req, res) => {
  if (!req.session.user) return res.redirect('/auth');
  const { message, recipient } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const newMessage = new Message({
      message,
      recipient,
      media,
      user: req.session.user.identifier,
      createdAt: new Date()
    });
    await newMessage.save();
    const url = `http://localhost:3000/message/${newMessage._id}`;
    const qrCodeUrl = await QRCode.toDataURL(url);
    res.render('payment', { qrCodeUrl, messageId: newMessage._id });
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).send('Erro ao processar a mensagem');
  }
});

router.get('/message/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).send('Mensagem não encontrada');
    res.render('message', { message, isLoggedIn: !!req.session.user });
  } catch (err) {
    res.status(500).send('Erro ao carregar mensagem');
  }
});

module.exports = router;