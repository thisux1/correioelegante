"use strict";

// public/js/create.js
document.addEventListener('DOMContentLoaded', function () {
  var messageForm = document.querySelector('#messageForm');
  var previewBtn = document.querySelector('#previewBtn');
  var previewArea = document.querySelector('#previewArea');
  var previewMessage = document.querySelector('#previewMessage');
  var previewRecipient = document.querySelector('#previewRecipient');
  var previewMedia = document.querySelector('#previewMedia');
  var mediaInput = document.querySelector('#media');
  var fileNameSpan = document.querySelector('.file-name');
  var mediaPreview = document.querySelector('.media-preview');
  var loginModal = document.querySelector('#loginModal');
  var authForm = document.querySelector('#authForm');
  var modalError = document.querySelector('#modalError');
  var themeSelector = document.querySelector('#themeSelector');
  var isLoggedIn = document.body.querySelector('.container').dataset.loggedIn === 'true'; // Função para salvar os dados do formulário

  var saveFormData = function saveFormData() {
    var formData = {
      message: document.querySelector('#message').value,
      recipient: document.querySelector('#recipient').value,
      media: mediaInput.files[0] ? {
        name: mediaInput.files[0].name,
        type: mediaInput.files[0].type,
        data: URL.createObjectURL(mediaInput.files[0])
      } : null
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  }; // Função para restaurar os dados do formulário


  var restoreFormData = function restoreFormData() {
    var savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData.message) document.querySelector('#message').value = savedData.message;
    if (savedData.recipient) document.querySelector('#recipient').value = savedData.recipient;

    if (savedData.media) {
      fileNameSpan.textContent = savedData.media.name;
      var previewElement = savedData.media.type.startsWith('image') ? 'img' : savedData.media.type.startsWith('video') ? 'video' : 'audio';
      var element = document.createElement(previewElement);
      element.src = savedData.media.data;
      if (previewElement !== 'img') element.controls = true;
      mediaPreview.innerHTML = '';
      mediaPreview.appendChild(element);
    }
  }; // Função para mostrar o preview


  var showPreview = function showPreview() {
    var savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    previewMessage.textContent = savedData.message || 'Digite sua mensagem...';
    previewRecipient.textContent = savedData.recipient || 'Nome e sala do destinatário';
    previewMedia.innerHTML = '';

    if (savedData.media) {
      var previewElement = savedData.media.type.startsWith('image') ? 'img' : savedData.media.type.startsWith('video') ? 'video' : 'audio';
      var element = document.createElement(previewElement);
      element.src = savedData.media.data;
      if (previewElement !== 'img') element.controls = true;
      previewMedia.appendChild(element);
    }

    previewArea.classList.remove('hidden');
  }; // Restaurar dados ao carregar a página


  if (!isLoggedIn) restoreFormData(); // Preview automático da mídia no formulário

  mediaInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    fileNameSpan.textContent = file ? file.name : 'Nenhum arquivo selecionado';
    mediaPreview.innerHTML = '';

    if (file) {
      var fileType = file.type.split('/')[0];

      if (fileType === 'image') {
        var img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        mediaPreview.appendChild(img);
      } else if (fileType === 'video') {
        var video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        mediaPreview.appendChild(video);
      } else if (fileType === 'audio') {
        var audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        mediaPreview.appendChild(audio);
      }
    }

    saveFormData();
  }); // Botão Visualizar Prévia

  previewBtn.addEventListener('click', function (e) {
    e.preventDefault();
    saveFormData();

    if (!isLoggedIn) {
      loginModal.classList.remove('hidden');
    } else {
      showPreview();
    }
  }); // Controle do tema (só para logados)

  if (themeSelector) {
    themeSelector.addEventListener('change', function (e) {
      var selectedTheme = e.target.value;
      previewArea.className = "hidden ".concat(selectedTheme);
    });
  } // Submissão do formulário de autenticação no modal


  authForm.addEventListener('submit', function _callee(e) {
    var identifier, password, redirect, formData, response, result;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            identifier = authForm.querySelector('[name="identifier"]').value;
            password = authForm.querySelector('[name="password"]').value;
            redirect = authForm.querySelector('[name="redirect"]').value;
            formData = "identifier=".concat(encodeURIComponent(identifier), "&password=").concat(encodeURIComponent(password), "&redirect=").concat(encodeURIComponent(redirect));
            console.log('Enviando dados do formulário:', {
              identifier: identifier,
              password: password,
              redirect: redirect
            });
            _context.prev = 6;
            _context.next = 9;
            return regeneratorRuntime.awrap(fetch('/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: formData
            }));

          case 9:
            response = _context.sent;
            _context.next = 12;
            return regeneratorRuntime.awrap(response.json());

          case 12:
            result = _context.sent;
            console.log('Resposta do servidor:', result);

            if (result.success) {
              loginModal.classList.add('hidden'); // Fecha o modal

              document.body.querySelector('.container').dataset.loggedIn = 'true'; // Atualiza isLoggedIn

              restoreFormData(); // Restaura os dados do formulário

              showPreview(); // Mostra o preview
            } else {
              modalError.textContent = result.error;
              modalError.classList.remove('hidden');
            }

            _context.next = 22;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](6);
            console.error('Erro ao enviar:', _context.t0);
            modalError.textContent = 'Erro ao conectar ao servidor';
            modalError.classList.remove('hidden');

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[6, 17]]);
  }); // Fechar modal ao clicar fora

  loginModal.addEventListener('click', function (e) {
    if (e.target === loginModal) {
      loginModal.classList.add('hidden');
    }
  }); // Submissão do formulário principal

  messageForm.addEventListener('submit', function _callee2(e) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!isLoggedIn) {
              e.preventDefault();
              saveFormData();
              loginModal.classList.remove('hidden');
            } // O backend redireciona para /payment automaticamente


          case 1:
          case "end":
            return _context2.stop();
        }
      }
    });
  }); // Limpar localStorage após envio bem-sucedido do formulário principal

  messageForm.addEventListener('submit', function (e) {
    localStorage.removeItem('formData');
  });
});