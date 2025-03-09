document.addEventListener('DOMContentLoaded', () => {
    console.log('Evento DOMContentLoaded disparado');

    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownContent = document.querySelector('.dropdown-content');
    const closeDropdownBtn = document.querySelector('.close-dropdown');
    const overlay = document.querySelector('.overlay');

    if (!dropdownTrigger || !dropdownContent || !closeDropdownBtn || !overlay) {
        console.error('Um ou mais elementos não foram encontrados');
        return;
    }

    function openDropdown() {
        console.log('Abrindo dropdown');
        dropdownContent.classList.remove('hidden'); // Remove hidden
        overlay.classList.remove('hidden');         // Remove hidden
        dropdownContent.classList.add('active');
        overlay.classList.add('active');
        console.log('Estado do dropdown:', dropdownContent.classList);
        console.log('Estado do overlay:', overlay.classList);
    }

    function closeDropdown() {
        console.log('Fechando dropdown');
        dropdownContent.classList.remove('active');
        overlay.classList.remove('active');
        dropdownContent.classList.add('hidden');    // Reaplica hidden
        overlay.classList.add('hidden');            // Reaplica hidden
        console.log('Estado do dropdown:', dropdownContent.classList);
        console.log('Estado do overlay:', overlay.classList);
    }

    dropdownTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clicou em "Como Funciona"');
        openDropdown();
    });

    closeDropdownBtn.addEventListener('click', () => {
        closeDropdown();
    });

    overlay.addEventListener('click', () => {
        closeDropdown();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownContent.classList.contains('active')) {
            closeDropdown();
        }
    });

    console.log('Eventos registrados com sucesso');
});