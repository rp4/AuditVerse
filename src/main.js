// Main entry point for Vite
import { initApp } from './js/main.js';

// Re-export everything from the actual main file
export * from './js/main.js';

// CRITICAL: Prevent tree-shaking of initApp by using it
const appInit = initApp;

// Add debug function to check container visibility
window.debugContainer = () => {
    const container = document.querySelector('.container');
    console.log('=== Container Debug Info ===');
    console.log('Container element:', container);
    if (container) {
        const styles = window.getComputedStyle(container);
        console.log('Display:', styles.display);
        console.log('Visibility:', styles.visibility);
        console.log('Opacity:', styles.opacity);
        console.log('Width:', styles.width);
        console.log('Height:', styles.height);
        console.log('Grid Template Columns:', styles.gridTemplateColumns);
        console.log('Grid Template Rows:', styles.gridTemplateRows);
        console.log('innerHTML length:', container.innerHTML.length);
        console.log('childNodes:', container.childNodes.length);
        console.log('Has .header:', !!container.querySelector('.header'));
        console.log('Has #knowledge-graph:', !!container.querySelector('#knowledge-graph'));
        console.log('Has .controls:', !!container.querySelector('.controls'));
        console.log('Has .details:', !!container.querySelector('.details'));

        // Check each grid area
        const controls = container.querySelector('.controls');
        const graph = container.querySelector('.graph');
        const details = container.querySelector('.details');

        if (controls) {
            const cStyles = window.getComputedStyle(controls);
            console.log('Controls - Display:', cStyles.display, 'Width:', cStyles.width);
        }
        if (graph) {
            const gStyles = window.getComputedStyle(graph);
            console.log('Graph - Display:', gStyles.display, 'Width:', gStyles.width);
        }
        if (details) {
            const dStyles = window.getComputedStyle(details);
            console.log('Details - Display:', dStyles.display, 'Width:', dStyles.width);
        }
    }
};

// Debug function to load sample data and bypass welcome screen
window.debugLoadSampleData = async () => {
    console.log('[DEBUG] Loading sample data directly...');
    try {
        // Remove welcome screen if it exists
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        // Fetch sample data - try both possible filenames
        let response = await fetch('./data/comprehensiveSampleData.json');
        if (!response.ok) {
            console.log('[DEBUG] Trying alternate filename...');
            response = await fetch('./data/sample_data.json');
        }
        const sampleData = await response.json();

        console.log('[DEBUG] Sample data loaded:', {
            risks: sampleData.risks?.length,
            controls: sampleData.controls?.length
        });

        // Import and call handleDataLoaded from main.js
        import('./js/main.js').then(module => {
            console.log('[DEBUG] Calling handleDataLoaded with sample data');

            // Find the handleDataLoaded function
            // Since it's not exported, we need to trigger it through window.AuditVerse
            if (window.AuditVerse && window.AuditVerse.handleDataLoaded) {
                window.AuditVerse.handleDataLoaded(sampleData);
            } else {
                console.error('[DEBUG] handleDataLoaded not found on window.AuditVerse');
                console.log('[DEBUG] Available methods:', Object.keys(window.AuditVerse || {}));
            }
        });
    } catch (error) {
        console.error('[DEBUG] Failed to load sample data:', error);
    }
};

// Ensure app initialization happens
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    console.log('[INIT] main.js loaded, starting initialization process');

    // Store initialization flag
    let initialized = false;

    // Use a more robust initialization approach
    const init = () => {
        // Prevent double initialization
        if (initialized) {
            console.log('[INIT] App already initialized, skipping');
            return;
        }

        console.log('[INIT] Attempting to initialize app');
        console.log('[INIT] appInit type:', typeof appInit);
        console.log('[INIT] window.AuditVerse:', window.AuditVerse);

        // Try direct import first
        if (typeof appInit === 'function') {
            console.log('[INIT] Calling initApp directly from import');
            initialized = true;
            appInit();

            // Debug container after init
            setTimeout(() => {
                window.debugContainer();
            }, 100);
        }
        // Fallback to window.AuditVerse if direct import is minified
        else if (window.AuditVerse && typeof window.AuditVerse.init === 'function') {
            console.log('[INIT] Calling initApp from window.AuditVerse');
            initialized = true;
            window.AuditVerse.init();

            // Debug container after init
            setTimeout(() => {
                window.debugContainer();
            }, 100);
        } else {
            console.error('[INIT] Unable to find initApp function - app will not initialize properly');
            console.error('[INIT] Available window properties:', Object.keys(window).filter(k => k.includes('Audit')));
        }
    };

    // Primary initialization strategy
    console.log('[INIT] Document readyState:', document.readyState);
    if (document.readyState === 'loading') {
        console.log('[INIT] Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        // DOM is already ready, initialize immediately
        console.log('[INIT] DOM already ready, initializing immediately');
        init();
    }

    // Backup initialization after a short delay
    setTimeout(() => {
        console.log('[INIT] 500ms check - initialized:', initialized);
        if (!initialized &&
            document.getElementById('welcome-screen') === null &&
            document.querySelector('.landing-page-wrapper') === null) {
            console.warn('[INIT] App not initialized after 500ms, forcing initialization');
            init();
        }
    }, 500);

    // Final fallback after longer delay
    setTimeout(() => {
        console.log('[INIT] 2000ms check - initialized:', initialized);
        if (!initialized &&
            document.getElementById('welcome-screen') === null &&
            document.querySelector('.landing-page-wrapper') === null) {
            console.error('[INIT] App failed to initialize after 2s, final attempt');
            init();
        }
    }, 2000);
}