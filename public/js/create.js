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
  });

  // Botão Visualizar Prévia
  previewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      loginModal.classList.remove('hidden');
    } else {
      const message = document.querySelector('#message').value;
      const recipient = document.querySelector('#recipient').value;
      const file = mediaInput.files[0];

      previewMessage.textContent = message || 'Digite sua mensagem...';
      previewRecipient.textContent = recipient || 'Nome e sala do destinatário';

      previewMedia.innerHTML = '';
      if (file) {
        const fileType = file.type.split('/')[0];
        if (fileType === 'image') {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          previewMedia.appendChild(img);
        } else if (fileType === 'video') {
          const video = document.createElement('video');
          video.src = URL.createObjectURL(file);
          video.controls = true;
          previewMedia.appendChild(video);
        } else if (fileType === 'audio') {
          const audio = document.createElement('audio');
          audio.src = URL.createObjectURL(file);
          audio.controls = true;
          previewMedia.appendChild(audio);
        }
      }

      previewArea.classList.remove('hidden');
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
        loginModal.classList.add('hidden');
        window.location.reload();
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
});