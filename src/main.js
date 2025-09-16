// Main entry point for Vite
import { initApp } from './js/main.js';

// Re-export everything from the actual main file
export * from './js/main.js';

// Ensure app initialization happens
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Use a more robust initialization approach
    const init = () => {
        // Try direct import first
        if (typeof initApp === 'function') {
            console.log('Calling initApp directly from import');
            initApp();
        }
        // Fallback to window.AuditVerse if direct import is minified
        else if (window.AuditVerse && typeof window.AuditVerse.init === 'function') {
            console.log('Calling initApp from window.AuditVerse');
            window.AuditVerse.init();
        } else {
            console.error('Unable to find initApp function');
        }
    };

    // Try multiple initialization strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        // DOM is already ready, initialize with a small delay for safety
        setTimeout(init, 0);
    } else {
        // Fallback: use load event
        window.addEventListener('load', init);
    }

    // Additional fallback: ensure initialization happens
    setTimeout(() => {
        if (document.getElementById('welcome-screen') === null &&
            document.querySelector('.landing-page-wrapper') === null) {
            // App hasn't initialized yet, force it
            init();
        }
    }, 500);
}