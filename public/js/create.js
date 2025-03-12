// public/js/create.js
document.addEventListener('DOMContentLoaded', () => {
    const mediaInput = document.querySelector('#media');
    const fileNameSpan = document.querySelector('.file-name');
    const mediaPreview = document.querySelector('.media-preview');
    const previewBtn = document.querySelector('#previewBtn');
    const previewArea = document.querySelector('#previewArea');
    const previewMessage = document.querySelector('#previewMessage');
    const previewRecipient = document.querySelector('#previewRecipient');
    const messageInput = document.querySelector('#message');
    const recipientInput = document.querySelector('#recipient');
    const isLoggedIn = document.body.dataset.loggedIn === 'true';
  
    mediaInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;
        mediaPreview.innerHTML = '';
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
      } else {
        fileNameSpan.textContent = 'Nenhum arquivo selecionado';
        mediaPreview.innerHTML = '';
      }
    });
  
    previewBtn.addEventListener('click', () => {
      if (!isLoggedIn) {
        window.location.href = '/auth';
      } else {
        previewMessage.textContent = messageInput.value || 'Sua mensagem aparecerá aqui...';
        previewRecipient.textContent = recipientInput.value || 'Destinatário';
        previewArea.classList.remove('hidden');
      }
    });
  });