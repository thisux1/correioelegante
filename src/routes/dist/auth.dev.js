"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var express = require('express');

var router = express.Router();

var User = require('../models/user');

var bcrypt = require('bcrypt');

router.get('/', function (req, res) {
  res.render('auth', {
    title: 'Login ou Cadastro',
    isLoggedIn: !!req.session.user,
    error: null,
    formData: req.session.formData || null
  });
  delete req.session.formData;
});
router.post('/', function _callee(req, res) {
  var _req$body, identifier, password, redirect, user, isMatch;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Log completo do corpo da requisição
          console.log('Requisição recebida em /auth:', req.body);
          _req$body = req.body, identifier = _req$body.identifier, password = _req$body.password, redirect = _req$body.redirect; // Log detalhado da senha

          console.log('Dados extraídos:', {
            identifier: identifier,
            password: password,
            redirect: redirect
          });
          console.log('Validação da senha:', {
            value: password,
            type: _typeof(password),
            length: password ? password.length : 'undefined',
            trimmedLength: password ? password.trim().length : 'undefined'
          }); // Validação da senha

          if (!(!password || typeof password !== 'string' || password.trim().length < 8)) {
            _context.next = 7;
            break;
          }

          console.log('Validação falhou para:', {
            password: password
          });
          return _context.abrupt("return", res.status(400).json({
            success: false,
            error: 'A senha deve ter pelo menos 8 caracteres'
          }));

        case 7:
          _context.prev = 7;
          _context.next = 10;
          return regeneratorRuntime.awrap(User.findOne({
            identifier: identifier
          }));

        case 10:
          user = _context.sent;

          if (!user) {
            _context.next = 19;
            break;
          }

          _context.next = 14;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 14:
          isMatch = _context.sent;

          if (isMatch) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", res.status(401).json({
            success: false,
            error: 'Senha incorreta'
          }));

        case 17:
          _context.next = 23;
          break;

        case 19:
          // Cadastro
          user = new User({
            identifier: identifier,
            password: password
          });
          _context.next = 22;
          return regeneratorRuntime.awrap(user.save());

        case 22:
          console.log('Usuário cadastrado:', user);

        case 23:
          // Define a sessão
          req.session.user = {
            identifier: user.identifier
          };
          req.session.save(function (err) {
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
          _context.next = 31;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](7);
          console.error('Erro no cadastro/login:', _context.t0);
          res.status(500).json({
            success: false,
            error: _context.t0.code === 11000 ? 'Usuário já existe' : 'Erro ao processar. Tente novamente.'
          });

        case 31:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 27]]);
});
module.exports = router;