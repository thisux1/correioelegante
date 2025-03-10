const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const QRCode = require('qrcode');
const path = require('path'); // Para resolver caminhos corretamente

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../public')));

// Configuração do Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Caminho correto: src/views/

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/correio-elegante', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.get('/', (req, res) => res.render('index')); // Renderiza src/views/index.pug
app.get('/create', (req, res) => res.render('create')); // Renderiza src/views/create.pug (placeholder)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(3000, () => console.log('Servidor na porta 3000'));