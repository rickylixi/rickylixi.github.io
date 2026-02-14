document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("theme-toggle");
  const root = document.documentElement;

  function syncPressedState(theme) {
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  syncPressedState(root.getAttribute("data-theme") || "light");

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      root.setAttribute("data-theme", newTheme);
      syncPressedState(newTheme);
      try {
        localStorage.setItem("theme", newTheme);
      } catch (e) {
        // Ignore storage errors (private mode, quota, etc.)
      }

      // Sync Giscus theme
      const iframe = document.querySelector("iframe.giscus-frame");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            giscus: {
              setConfig: {
                theme: newTheme,
              },
            },
          },
          "https://giscus.app",
        );
      }
    });
  }
});
