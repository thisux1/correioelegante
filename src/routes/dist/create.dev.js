"use strict";

// src/routes/create.js
var express = require('express');

var router = express.Router();

var multer = require('multer');

var path = require('path');

var Message = require('../models/Message');

var _require = require('mercadopago'),
    MercadoPagoConfig = _require.MercadoPagoConfig,
    Payment = _require.Payment; // Inicializar o client do Mercado Pago


var client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-2760815848165195-031402-38d641ac7bd3901d474400c55ecbd033-2005301057'
});
var paymentClient = new Payment(client);
var storage = multer.diskStorage({
  destination: function destination(req, res, cb) {
    return cb(null, 'public/uploads');
  },
  filename: function filename(req, file, cb) {
    return cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function fileFilter(req, file, cb) {
    var allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);else cb(new Error('Tipo de arquivo não suportado'));
  }
});
router.get('/', function (req, res) {
  var formData = req.session.formData || {};
  res.render('create', {
    title: 'Crie sua Mensagem',
    isLoggedIn: !!req.session.user,
    formData: formData,
    error: null
  });
  delete req.session.formData;
});
router.post('/', upload.single('media'), function _callee(req, res) {
  var _req$body, message, recipient, media, newMessage, paymentData, payment, pixData;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.session.user) {
            _context.next = 3;
            break;
          }

          req.session.formData = {
            message: req.body.message,
            recipient: req.body.recipient
          };
          return _context.abrupt("return", res.redirect('/auth'));

        case 3:
          _req$body = req.body, message = _req$body.message, recipient = _req$body.recipient;
          media = req.file ? "/uploads/".concat(req.file.filename) : null;

          if (!(!message || !recipient)) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", res.render('create', {
            title: 'Crie sua Mensagem',
            isLoggedIn: true,
            formData: req.body,
            error: 'Mensagem e destinatário são obrigatórios'
          }));

        case 7:
          _context.prev = 7;
          newMessage = new Message({
            message: message,
            recipient: recipient,
            media: media,
            user: req.session.user.identifier,
            createdAt: new Date(),
            paymentStatus: 'pending'
          });
          _context.next = 11;
          return regeneratorRuntime.awrap(newMessage.save());

        case 11:
          // Criar cobrança no Mercado Pago
          paymentData = {
            transaction_amount: 5.00,
            description: "Pagamento da mensagem ".concat(newMessage._id),
            payment_method_id: 'pix',
            payer: {
              email: req.session.user.identifier
            },
            notification_url: "".concat(req.protocol, "://").concat(req.get('host'), "/webhook")
          };
          _context.next = 14;
          return regeneratorRuntime.awrap(paymentClient.create(paymentData));

        case 14:
          payment = _context.sent;
          newMessage.paymentId = payment.id;
          _context.next = 18;
          return regeneratorRuntime.awrap(newMessage.save());

        case 18:
          pixData = {
            qrCode: payment.point_of_interaction.transaction_data.qr_code_base64,
            pixKey: payment.point_of_interaction.transaction_data.qr_code,
            messageId: newMessage._id,
            url: "".concat(req.protocol, "://").concat(req.get('host'), "/message/").concat(newMessage._id)
          };
          res.render('payment', pixData);
          _context.next = 26;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](7);
          console.error('Erro ao criar mensagem ou cobrança:', _context.t0);
          res.status(500).send('Erro ao processar a mensagem');

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 22]]);
});
router.get('/message/:id', function _callee2(req, res) {
  var message;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Message.findById(req.params.id));

        case 3:
          message = _context2.sent;

          if (message) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(404).render('404', {
            title: 'Mensagem não encontrada'
          }));

        case 6:
          if (!(message.paymentStatus !== 'paid')) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", res.render('payment-pending', {
            messageId: message._id
          }));

        case 8:
          res.render('message', {
            message: message,
            isLoggedIn: !!req.session.user,
            title: 'Sua Mensagem'
          });
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error('Erro ao carregar mensagem:', _context2.t0);
          res.status(500).send('Erro ao carregar mensagem');

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;