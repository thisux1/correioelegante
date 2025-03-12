// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('#authForm');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(authForm);
        try {
          const response = await fetch('/auth', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            window.location.href = '/create';
          } else {
            alert('Erro ao autenticar. Verifique suas credenciais.');
          }
        } catch (err) {
          console.error('Erro na requisição:', err);
          alert('Erro no servidor. Tente novamente.');
        }
      });
    }
  });