require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const createRoutes = require('./routes/create');
const authRoutes = require('./routes/auth');
const QRCode = require('qrcode');
const Message = require('./models/Message'); // Certifique-se de que o modelo Message está correto
const { MercadoPagoConfig, Payment } = require('mercadopago'); // Importação correta do MercadoPago

const app = express();

// Configuração do MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'SEU_ACCESS_TOKEN_AQUI'
});
const paymentClient = new Payment(client);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/correio-elegante', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.userName = req.session.user ? req.session.user.identifier : null;
  next();
});

// Rotas
app.use('/create', createRoutes);
app.use('/auth', authRoutes);
app.get('/', (req, res) => res.render('index'));
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/auth');
  res.render('profile', { user: req.session.user });
});
app.get('/contact', (req, res) => res.render('contact', { title: 'Contato' }));

// Rota GET para renderizar a página de pagamento
app.get('/payment', (req, res) => {
  const { messageId } = req.query;
  res.render('payment', { messageId, qrCodeUrl: null }); // qrCodeUrl será preenchido pelo POST
});

// Rota POST para processar o pagamento e gerar o QR Code
app.post('/payment', async (req, res) => {
  const { messageId } = req.body;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).send('Mensagem não encontrada');
    }

    const url = `${req.protocol}://${req.get('host')}/message/${message._id}`;
    const qrCodeUrl = await QRCode.toDataURL(url);

    res.json({ success: true, url, qrCode: qrCodeUrl });
  } catch (err) {
    console.error('Erro ao processar pagamento:', err);
    res.status(500).json({ success: false, error: 'Erro ao processar pagamento' });
  }
});

// Rota POST para receber o webhook de pagamento
app.post('/webhook', async (req, res) => {
  const paymentId = req.body.data?.id;
  if (!paymentId) return res.status(400).send('ID de pagamento não fornecido');

  try {
    const payment = await paymentClient.get(paymentId);
    if (payment.status === 'approved') {
      const message = await Message.findOneAndUpdate(
        { paymentId },
        { paymentStatus: 'paid' },
        { new: true }
      );
      console.log(`Pagamento aprovado para mensagem ${message._id}`);
    }
    res.status(200).send('Webhook recebido');
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(500).send('Erro ao processar webhook');
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});