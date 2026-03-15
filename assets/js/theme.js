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

      // Track theme change in GA4
      if (typeof trackThemeChange === 'function') {
        trackThemeChange(newTheme);
      }
    });
  }
  
  // Track navigation clicks
  document.addEventListener('click', function(e) {
    const navLink = e.target.closest('nav a[href]');
    if (navLink) {
      const linkText = navLink.textContent.trim();
      const linkUrl = navLink.getAttribute('href');
      if (typeof trackNavigationClick === 'function') {
        trackNavigationClick(linkText, linkUrl);
      }
    }
    
    // Track social link clicks
    const socialLink = e.target.closest('a.social-link[href]');
    if (socialLink) {
      const platform = socialLink.getAttribute('title') || socialLink.getAttribute('aria-label');
      if (typeof trackSocialClick === 'function' && platform) {
        trackSocialClick(platform);
      }
    }
  });
});
