document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.querySelector('#authForm');
  const loginModal = document.querySelector('#loginModal');
  const modalError = document.querySelector('#modalError');

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = authForm.querySelector('[name="identifier"]').value;
      const password = authForm.querySelector('[name="password"]').value;
      const redirect = authForm.querySelector('[name="redirect"]').value || '/create';
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
          if (loginModal) {
            loginModal.classList.add('hidden');
          }
          window.location.href = result.redirect;
        } else {
          if (modalError) {
            modalError.textContent = result.error;
            modalError.classList.remove('hidden');
          } else {
            alert(result.error);
          }
        }
      } catch (err) {
        console.error('Erro ao enviar:', err);
        if (modalError) {
          modalError.textContent = 'Erro ao conectar ao servidor';
          modalError.classList.remove('hidden');
        } else {
          alert('Erro ao conectar ao servidor');
        }
      }
    });
  }

  // Fechar modal ao clicar fora
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.add('hidden');
      }
    });
  }
});