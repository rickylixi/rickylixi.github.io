// Accordion functionality
window.addEventListener('load', function() {
  var acc = document.getElementsByClassName("accordion");
  console.log("Found " + acc.length + " accordion elements.");
  
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      console.log("Accordion button clicked.");
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      var panel = this.nextElementSibling;
      if (panel && panel.classList.contains("panel")) {
        console.log("Toggling 'show' class on panel.");
        panel.classList.toggle("show");
      } else {
        console.log("Panel not found or is not a panel.");
      }
    });
  }
});
