// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const createRoutes = require('./routes/create');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/correio-elegante', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.userName = req.session.user ? req.session.user.identifier : null;
  next();
});

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
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contato' });
});

app.listen(3000, () => console.log('Servidor na porta 3000'));