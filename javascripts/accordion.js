// Accordion functionality with event delegation and ARIA state.
document.addEventListener("DOMContentLoaded", () => {
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((accordion, index) => {
    const panel = accordion.nextElementSibling;
    if (!panel || !panel.classList.contains("panel")) return;

    const buttonId = accordion.id || `accordion-${index + 1}`;
    const panelId = panel.id || `${buttonId}-panel`;
    const isExpanded = accordion.classList.contains("active");

    accordion.id = buttonId;
    accordion.type = "button";
    accordion.setAttribute("aria-controls", panelId);
    accordion.setAttribute("aria-expanded", String(isExpanded));

    panel.id = panelId;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", buttonId);
    panel.hidden = !isExpanded;
  });

  document.body.addEventListener("click", (event) => {
    const accordion = event.target.closest(".accordion");
    if (!accordion) return;

    const panel = accordion.nextElementSibling;
    if (panel && panel.classList.contains("panel")) {
      const isExpanded = accordion.classList.toggle("active");
      accordion.setAttribute("aria-expanded", String(isExpanded));
      panel.classList.toggle("show");
      panel.hidden = !isExpanded;
    }
  });
});
