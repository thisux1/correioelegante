const session = require('express-session');
const User = require('./models/User'); // Crie esse modelo

// Configurar sessões
app.use(session({
  secret: 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: false
}));

// Modelo de Usuário (src/models/User.js)
const userSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  password: String // Em produção, use bcrypt para hash
});
const User = mongoose.model('User', userSchema);

// Rota de autenticação
app.post('/auth', async (req, res) => {
  const { identifier, password } = req.body;
  let user = await User.findOne({ identifier });

  if (!user) {
    // Cadastro automático
    user = new User({ identifier, password });
    await user.save();
  } else if (user.password !== password) { // Em produção, compare hash
    return res.status(401).send('Senha incorreta');
  }

  req.session.user = { identifier: user.identifier };
  res.redirect('/create'); // Volta para a página create
});