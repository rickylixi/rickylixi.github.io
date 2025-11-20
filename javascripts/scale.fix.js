// Mobile viewport scaling fix
(function() {
    // The following code block has been removed to improve accessibility by allowing users to zoom.
    // if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    //     var viewport = document.querySelector('meta[name="viewport"]');
    //     if (viewport) {
    //         var content = viewport.getAttribute('content');
    //         if (content.indexOf('maximum-scale') === -1) {
    //             viewport.setAttribute('content', content + ', maximum-scale=1');
    //         }
    //     }
    // }

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
