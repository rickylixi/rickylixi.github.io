// Accordion functionality with error handling
document.addEventListener('DOMContentLoaded', function() {
  var acc = document.getElementsByClassName("accordion");
  console.log('Found ' + acc.length + ' accordion buttons');
  
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      try {
        console.log('Accordion clicked');
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        console.log('Panel found:', panel);
        if (panel && panel.classList.contains("panel")) {
          panel.classList.toggle("show");
          console.log('Panel toggled, show class:', panel.classList.contains("show"));
        }
      } catch (error) {
        console.warn('Accordion error:', error);
      }
    });
  }
});
