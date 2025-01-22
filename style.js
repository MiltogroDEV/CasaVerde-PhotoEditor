// Seleciona todos os itens clicáveis (item-toggle)
const toggles = document.querySelectorAll('.item-toggle');

toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        // Encontra a próxima div (os itens ocultos) e alterna a classe 'hidden'
        const itemsContainer = toggle.nextElementSibling;
        itemsContainer.classList.toggle('hidden');
    });
});
