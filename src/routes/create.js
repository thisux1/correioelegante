const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('create', { title: 'Escreva Sua Mensagem' });
});

router.post('/', (req, res) => {
  // Lógica para processar o formulário (a ser implementada)
  res.redirect('/payment'); // Exemplo
});

module.exports = router;