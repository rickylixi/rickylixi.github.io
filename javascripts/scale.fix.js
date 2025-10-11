// Mobile viewport scaling fix
(function() {
    // Prevent zoom on focus for iOS devices
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        var viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            var content = viewport.getAttribute('content');
            // Add maximum-scale=1 to prevent zooming
            if (content.indexOf('maximum-scale') === -1) {
                viewport.setAttribute('content', content + ', maximum-scale=1');
            }
        }
    }

    // Fix for Android keyboard issues
    if (navigator.userAgent.match(/Android/i)) {
        window.addEventListener('resize', function() {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                window.setTimeout(function() {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 0);
            }
        });
    }
})();
