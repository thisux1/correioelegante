"use strict";

var express = require('express');

var mongoose = require('mongoose');

var session = require('express-session');

var multer = require('multer');

var path = require('path');

var createRoutes = require('./routes/create');

var authRoutes = require('./routes/auth');

var QRCode = require('qrcode');

var Message = require('./models/Message'); // Certifique-se de que o modelo Message está correto


var app = express(); // Middleware

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express["static"](path.join(__dirname, '../public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production'
  }
}));
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    return cb(null, 'public/uploads');
  },
  filename: function filename(req, file, cb) {
    return cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({
  storage: storage
});
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Conexão com MongoDB

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/correio-elegante', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  return console.log('MongoDB conectado');
})["catch"](function (err) {
  return console.error('Erro ao conectar ao MongoDB:', err);
});
app.use(function (req, res, next) {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.userName = req.session.user ? req.session.user.identifier : null;
  next();
}); // Rotas

app.use('/create', createRoutes);
app.use('/auth', authRoutes);
app.get('/', function (req, res) {
  return res.render('index');
});
app.get('/logout', function (req, res) {
  req.session.destroy(function () {
    return res.redirect('/');
  });
});
app.get('/profile', function (req, res) {
  if (!req.session.user) return res.redirect('/auth');
  res.render('profile', {
    user: req.session.user
  });
});
app.get('/contact', function (req, res) {
  return res.render('contact', {
    title: 'Contato'
  });
}); // Rota GET para renderizar a página de pagamento

app.get('/payment', function (req, res) {
  var messageId = req.query.messageId;
  res.render('payment', {
    messageId: messageId,
    qrCodeUrl: null
  }); // qrCodeUrl será preenchido pelo POST
}); // Rota POST para processar o pagamento e gerar o QR Code

app.post('/payment', function _callee(req, res) {
  var messageId, message, url, qrCodeUrl;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          messageId = req.body.messageId;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(Message.findById(messageId));

        case 4:
          message = _context.sent;

          if (message) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", res.status(404).send('Mensagem não encontrada'));

        case 7:
          url = "".concat(req.protocol, "://").concat(req.get('host'), "/message/").concat(message._id);
          _context.next = 10;
          return regeneratorRuntime.awrap(QRCode.toDataURL(url));

        case 10:
          qrCodeUrl = _context.sent;
          res.render('payment', {
            messageId: messageId,
            qrCodeUrl: qrCodeUrl
          });
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](1);
          console.error('Erro ao processar pagamento:', _context.t0);
          res.status(500).send('Erro ao processar pagamento');

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 14]]);
}); // Inicia o servidor

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Servidor rodando na porta ".concat(PORT));
});