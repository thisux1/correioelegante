// src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
  res.render('auth', { title: 'Login ou Cadastro', isLoggedIn: false });
});

router.post('/', async (req, res) => {
  const { identifier, password, redirect } = req.body;

  // Verifica se os campos obrigatórios foram fornecidos
  if (!identifier || !password) {
    return res.status(400).send('E-mail/Usuário e senha são obrigatórios');
  }

  try {
    let user = await User.findOne({ identifier });

    if (!user) {
      // Cadastro automático apenas com dados válidos
      user = new User({ identifier, password });
      await user.save();
    } else if (user.password !== password) {
      return res.status(401).send('Senha incorreta');
    }

    req.session.user = { identifier: user.identifier };
    res.redirect(redirect || '/create');
  } catch (err) {
    console.error('Erro ao processar autenticação:', err);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;