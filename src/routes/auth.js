// src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  res.render('auth', { 
    title: 'Login ou Cadastro', 
    isLoggedIn: !!req.session.user, 
    error: null,
    formData: req.session.formData || null
  });
  delete req.session.formData;
});

router.post('/', async (req, res) => {
  // Log completo do corpo da requisição
  console.log('Requisição recebida em /auth:', req.body);

  const { identifier, password, redirect } = req.body;

  // Log detalhado da senha
  console.log('Dados extraídos:', { identifier, password, redirect });
  console.log('Validação da senha:', { 
    value: password, 
    type: typeof password, 
    length: password ? password.length : 'undefined', 
    trimmedLength: password ? password.trim().length : 'undefined' 
  });

  // Validação da senha
  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    console.log('Validação falhou para:', { password });
    return res.status(400).json({ 
      success: false, 
      error: 'A senha deve ter pelo menos 8 caracteres' 
    });
  }

  try {
    let user = await User.findOne({ identifier });

    if (user) {
      // Login
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          error: 'Senha incorreta' 
        });
      }
    } else {
      // Cadastro
      user = new User({ identifier, password });
      await user.save();
      console.log('Usuário cadastrado:', user);
    }

    // Define a sessão
    req.session.user = { identifier: user.identifier };
    req.session.save((err) => {
      if (err) {
        console.error('Erro ao salvar sessão:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Erro interno. Tente novamente.' 
        });
      }
      console.log('Sessão salva com sucesso:', req.session.user);
      res.json({ 
        success: true, 
        redirect: redirect || '/create' 
      });
    });
  } catch (err) {
    console.error('Erro no cadastro/login:', err);
    res.status(500).json({ 
      success: false, 
      error: err.code === 11000 ? 'Usuário já existe' : 'Erro ao processar. Tente novamente.'
    });
  }
});

module.exports = router;