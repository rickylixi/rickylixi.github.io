document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('theme-toggle');
  
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Sync Giscus theme
      const iframe = document.querySelector('iframe.giscus-frame');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          giscus: {
            setConfig: {
              theme: newTheme
            }
          }
        }, 'https://giscus.app');
      }
    });
  }
});
