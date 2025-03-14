// public/js/create.js
document.addEventListener('DOMContentLoaded', () => {
  const messageForm = document.querySelector('#messageForm');
  const previewBtn = document.querySelector('#previewBtn');
  const previewArea = document.querySelector('#previewArea');
  const previewMessage = document.querySelector('#previewMessage');
  const previewRecipient = document.querySelector('#previewRecipient');
  const previewMedia = document.querySelector('#previewMedia');
  const mediaInput = document.querySelector('#media');
  const fileNameSpan = document.querySelector('.file-name');
  const mediaPreview = document.querySelector('.media-preview');
  const loginModal = document.querySelector('#loginModal');
  const authForm = document.querySelector('#authForm');
  const modalError = document.querySelector('#modalError');
  const themeSelector = document.querySelector('#themeSelector');
  const isLoggedIn = document.body.querySelector('.container').dataset.loggedIn === 'true';

  // Função para salvar os dados do formulário
  const saveFormData = () => {
    const formData = {
      message: document.querySelector('#message').value,
      recipient: document.querySelector('#recipient').value,
      media: mediaInput.files[0] ? {
        name: mediaInput.files[0].name,
        type: mediaInput.files[0].type,
        data: URL.createObjectURL(mediaInput.files[0])
      } : null
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  };

  // Função para restaurar os dados do formulário
  const restoreFormData = () => {
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData.message) document.querySelector('#message').value = savedData.message;
    if (savedData.recipient) document.querySelector('#recipient').value = savedData.recipient;
    if (savedData.media) {
      fileNameSpan.textContent = savedData.media.name;
      const previewElement = savedData.media.type.startsWith('image') ? 'img' :
                            savedData.media.type.startsWith('video') ? 'video' : 'audio';
      const element = document.createElement(previewElement);
      element.src = savedData.media.data;
      if (previewElement !== 'img') element.controls = true;
      mediaPreview.innerHTML = '';
      mediaPreview.appendChild(element);
    }
  };

  // Função para mostrar o preview
  const showPreview = () => {
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    previewMessage.textContent = savedData.message || 'Digite sua mensagem...';
    previewRecipient.textContent = savedData.recipient || 'Nome e sala do destinatário';
    previewMedia.innerHTML = '';
    if (savedData.media) {
      const previewElement = savedData.media.type.startsWith('image') ? 'img' :
                            savedData.media.type.startsWith('video') ? 'video' : 'audio';
      const element = document.createElement(previewElement);
      element.src = savedData.media.data;
      if (previewElement !== 'img') element.controls = true;
      previewMedia.appendChild(element);
    }
    previewArea.classList.remove('hidden');
  };

  // Restaurar dados ao carregar a página
  if (!isLoggedIn) restoreFormData();

  // Preview automático da mídia no formulário
  mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    fileNameSpan.textContent = file ? file.name : 'Nenhum arquivo selecionado';
    mediaPreview.innerHTML = '';
    if (file) {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        mediaPreview.appendChild(img);
      } else if (fileType === 'video') {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        mediaPreview.appendChild(video);
      } else if (fileType === 'audio') {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        mediaPreview.appendChild(audio);
      }
    }
    saveFormData();
  });

  // Botão Visualizar Prévia
  previewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    saveFormData();
    if (!isLoggedIn) {
      loginModal.classList.remove('hidden');
    } else {
      showPreview();
    }
  });

  // Controle do tema (só para logados)
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      const selectedTheme = e.target.value;
      previewArea.className = `hidden ${selectedTheme}`;
    });
  }

  // Submissão do formulário de autenticação no modal
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = authForm.querySelector('[name="identifier"]').value;
    const password = authForm.querySelector('[name="password"]').value;
    const redirect = authForm.querySelector('[name="redirect"]').value;
    const formData = `identifier=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}&redirect=${encodeURIComponent(redirect)}`;
    console.log('Enviando dados do formulário:', { identifier, password, redirect });

    try {
      const response = await fetch('/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      const result = await response.json();
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
    } catch (err) {
      console.error('Erro ao enviar:', err);
      modalError.textContent = 'Erro ao conectar ao servidor';
      modalError.classList.remove('hidden');
    }
  });

  // Fechar modal ao clicar fora
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.add('hidden');
    }
  });

  // Submissão do formulário principal
  messageForm.addEventListener('submit', async (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      saveFormData();
      loginModal.classList.remove('hidden');
    }
    // O backend redireciona para /payment automaticamente
  });

  // Limpar localStorage após envio bem-sucedido do formulário principal
  messageForm.addEventListener('submit', (e) => {
    localStorage.removeItem('formData');
  });
});