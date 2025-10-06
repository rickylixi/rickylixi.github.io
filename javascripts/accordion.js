// Accordion functionality
window.addEventListener('load', function() {
  const acc = document.getElementsByClassName("accordion");

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      const panel = this.parentElement.getElementsByClassName('panel')[0];
      if (panel) {
        panel.classList.toggle("show");
      }
    });
  }
});
