// public/js/header.js
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) {
    console.error('Header não encontrado');
    return;
  }

  const dropdownTrigger = header.querySelector('.dropdown-trigger');
  const dropdownWrapper = document.querySelector('.dropdown-wrapper');
  const dropdownContent = document.querySelector('.dropdown-content');
  const closeButton = document.querySelector('.close-dropdown');
  const overlay = document.querySelector('.overlay');

  if (dropdownTrigger && dropdownWrapper && dropdownContent && closeButton && overlay) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = dropdownWrapper.classList.contains('hidden');
      dropdownWrapper.classList.toggle('hidden', !isHidden);
      dropdownWrapper.classList.toggle('active', isHidden);
      dropdownContent.classList.toggle('hidden', !isHidden);
      dropdownContent.classList.toggle('active', isHidden);
      overlay.classList.toggle('hidden', !isHidden);
    });

    closeButton.addEventListener('click', () => {
      dropdownWrapper.classList.add('hidden');
      dropdownWrapper.classList.remove('active');
      dropdownContent.classList.add('hidden');
      dropdownContent.classList.remove('active');
      overlay.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdownContent.contains(e.target) && !dropdownTrigger.contains(e.target)) {
        dropdownWrapper.classList.add('hidden');
        dropdownWrapper.classList.remove('active');
        dropdownContent.classList.add('hidden');
        dropdownContent.classList.remove('active');
        overlay.classList.add('hidden');
      }
    });

    overlay.addEventListener('click', () => {
      dropdownWrapper.classList.add('hidden');
      dropdownWrapper.classList.remove('active');
      dropdownContent.classList.add('hidden');
      dropdownContent.classList.remove('active');
      overlay.classList.add('hidden');
    });
  } else {
    console.error('Elementos do dropdown ou overlay não encontrados');
  }
});