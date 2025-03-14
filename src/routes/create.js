// src/routes/create.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const { MercadoPagoConfig, Payment } = require('mercadopago');

// Inicializar o client do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-2760815848165195-031402-38d641ac7bd3901d474400c55ecbd033-2005301057'
});
const paymentClient = new Payment(client);

const storage = multer.diskStorage({
  destination: (req, res, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não suportado'));
  }
});

router.get('/', (req, res) => {
  const formData = req.session.formData || {};
  res.render('create', { 
    title: 'Crie sua Mensagem', 
    isLoggedIn: !!req.session.user,
    formData,
    error: null
  });
  delete req.session.formData;
});

router.post('/', upload.single('media'), async (req, res) => {
  if (!req.session.user) {
    req.session.formData = {
      message: req.body.message,
      recipient: req.body.recipient
    };
    return res.redirect('/auth');
  }

  const { message, recipient } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;

  if (!message || !recipient) {
    return res.render('create', {
      title: 'Crie sua Mensagem',
      isLoggedIn: true,
      formData: req.body,
      error: 'Mensagem e destinatário são obrigatórios'
    });
  }

  try {
    const newMessage = new Message({
      message,
      recipient,
      media,
      user: req.session.user.identifier,
      createdAt: new Date(),
      paymentStatus: 'pending'
    });
    await newMessage.save();

    // Criar cobrança no Mercado Pago
    const paymentData = {
      transaction_amount: 5.00,
      description: `Pagamento da mensagem ${newMessage._id}`,
      payment_method_id: 'pix',
      payer: { email: req.session.user.identifier },
      notification_url: `${req.protocol}://${req.get('host')}/webhook`
    };
    const payment = await paymentClient.create(paymentData);

    newMessage.paymentId = payment.id;
    await newMessage.save();

    const pixData = {
      qrCode: payment.point_of_interaction.transaction_data.qr_code_base64,
      pixKey: payment.point_of_interaction.transaction_data.qr_code,
      messageId: newMessage._id,
      url: `${req.protocol}://${req.get('host')}/message/${newMessage._id}`
    };

    res.render('payment', pixData);
  } catch (err) {
    console.error('Erro ao criar mensagem ou cobrança:', err);
    res.status(500).send('Erro ao processar a mensagem');
  }
});

router.get('/message/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).render('404', { title: 'Mensagem não encontrada' });
    if (message.paymentStatus !== 'paid') {
      return res.render('payment-pending', { messageId: message._id });
    }
    res.render('message', { 
      message, 
      isLoggedIn: !!req.session.user,
      title: 'Sua Mensagem'
    });
  } catch (err) {
    console.error('Erro ao carregar mensagem:', err);
    res.status(500).send('Erro ao carregar mensagem');
  }
});

module.exports = router;