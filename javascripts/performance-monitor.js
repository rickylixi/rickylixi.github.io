// Simple performance monitoring script
(function() {
    'use strict';
    
    // Check if browser supports Performance API
    if ('performance' in window) {
        // Monitor Core Web Vitals
        if ('getEntriesByType' in performance) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                console.log(`${entry.name}: ${entry.startTime}ms`);
            });
        }
        
        // Monitor Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime, lastEntry);
                });
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.log('LCP monitoring not supported');
            }
        }
        
        // Log navigation timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigationTiming = performance.getEntriesByType('navigation')[0];
                if (navigationTiming) {
                    console.log('DOMContentLoaded:', navigationTiming.domContentLoadedEventEnd);
                    console.log('Load:', navigationTiming.loadEventEnd);
                    console.log('TTFB:', navigationTiming.responseStart - navigationTiming.requestStart);
                }
            }, 0);
        });
    }
    
    // Monitor CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
        let clsValue = 0;
        let clsEntries = [];
        
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                        console.log('CLS:', clsValue, entry);
                    }
                }
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            console.log('CLS monitoring not supported');
        }
    }
})();
