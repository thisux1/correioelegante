// public/js/header.js
document.addEventListener('DOMContentLoaded', () => {
  // Selecionando os elementos do DOM
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownWrapper = document.querySelector('.dropdown-wrapper');
  const dropdownContent = document.querySelector('.dropdown-content');
  const closeButton = document.querySelector('.close-dropdown');
  const overlay = document.querySelector('.overlay');
  const textArea = document.querySelector('.text-area');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  // Verificando se todos os elementos estão presentes
  if (!dropdownTrigger || !dropdownWrapper || !dropdownContent || !closeButton || !overlay || !textArea || !scrollIndicator) {
    console.error('Um ou mais elementos não foram encontrados.');
    return;
  }

  // Função para abrir o dropdown
  const openDropdown = () => {
    dropdownWrapper.classList.add('active');
    dropdownContent.classList.add('active');
    overlay.classList.add('active');
    dropdownTrigger.classList.add('active'); // Feedback visual no trigger
    dropdownTrigger.setAttribute('aria-expanded', 'true'); // Acessibilidade
    closeButton.focus(); // Move o foco para o botão de fechar

    // Verifica se o conteúdo da text-area excede a altura visível para mostrar a seta
    if (textArea.scrollHeight > textArea.clientHeight) {
      scrollIndicator.style.display = 'block';
    } else {
      scrollIndicator.style.display = 'none';
    }
  };

  // Função para fechar o dropdown
  const closeDropdown = () => {
    dropdownWrapper.classList.remove('active');
    dropdownContent.classList.remove('active');
    overlay.classList.remove('active');
    dropdownTrigger.classList.remove('active'); // Remove o feedback visual
    dropdownTrigger.setAttribute('aria-expanded', 'false'); // Acessibilidade
    scrollIndicator.style.display = 'none'; // Esconde a seta
  };

  // Evento: Clique no trigger para abrir/fechar o dropdown
  dropdownTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (dropdownWrapper.classList.contains('active')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Evento: Clique no botão de fechar
  closeButton.addEventListener('click', closeDropdown);

  // Evento: Clique no overlay para fechar
  overlay.addEventListener('click', closeDropdown);

  // Evento: Clique fora do dropdown para fechar
  document.addEventListener('click', (e) => {
    if (!dropdownContent.contains(e.target) && !dropdownTrigger.contains(e.target)) {
      closeDropdown();
    }
  });

  // Evento: Fechar com a tecla "Esc"
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownWrapper.classList.contains('active')) {
      closeDropdown();
    }
  });

  // Evento: Atualizar a seta ao redimensionar a janela
  window.addEventListener('resize', () => {
    if (dropdownWrapper.classList.contains('active')) {
      if (textArea.scrollHeight > textArea.clientHeight) {
        scrollIndicator.style.display = 'block';
      } else {
        scrollIndicator.style.display = 'none';
      }
    }
  });
});