// Accordion functionality with error handling
document.addEventListener('DOMContentLoaded', function() {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      try {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel && panel.classList.contains("panel")) {
          panel.classList.toggle("show");
        }
      } catch (error) {
        console.warn('Accordion error:', error);
      }
    });
  }
});
