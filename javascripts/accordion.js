// Accordion functionality with event delegation
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (event) => {
    const accordion = event.target.closest('.accordion');
    if (!accordion) return;

    // Toggle active class
    accordion.classList.toggle('active');
    
    // Toggle panel visibility
    const panel = accordion.nextElementSibling;
    if (panel && panel.classList.contains('panel')) {
      panel.classList.toggle('show');
    }
  });
});
