/**
 * Centralized error handling service for AuditVerse
 * Provides consistent error handling, recovery strategies, and user notifications
 */

import { logger } from './logger.js';

class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxRetries = 3;
        this.retryDelays = [1000, 2000, 4000]; // Progressive backoff
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                type: 'uncaught'
            });
            event.preventDefault();
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new Error(event.reason), {
                type: 'unhandled_promise',
                promise: event.promise
            });
            event.preventDefault();
        });
    }

    async handleError(error, context = {}) {
        this.errorCount++;
        
        // Log the error
        logger.error(error.message, {
            stack: error.stack,
            ...context,
            errorCount: this.errorCount
        });

        // Determine error severity
        const severity = this.determineSeverity(error, context);

        // Apply recovery strategy
        const recovered = await this.attemptRecovery(error, context, severity);

        // Notify user if necessary
        if (!recovered || severity >= 3) {
            this.notifyUser(error, severity);
        }

        return recovered;
    }

    determineSeverity(error, context) {
        // Critical errors (severity 4)
        if (context.type === 'security' || error.message.includes('authentication')) {
            return 4;
        }
        
        // High severity (severity 3)
        if (context.type === 'data_loss' || error.message.includes('data')) {
            return 3;
        }
        
        // Medium severity (severity 2)
        if (context.type === 'network' || error.message.includes('network')) {
            return 2;
        }
        
        // Low severity (severity 1)
        return 1;
    }

    async attemptRecovery(error, context, severity) {
        // Don't attempt recovery for critical errors
        if (severity === 4) {
            return false;
        }

        // Network errors - retry with backoff
        if (context.type === 'network' || error.message.includes('fetch')) {
            return await this.retryWithBackoff(context.operation, context.retryCount || 0);
        }

        // Visualization errors - try to reset
        if (context.component === 'visualization') {
            return this.resetVisualization();
        }

        // Data errors - try to reload
        if (context.type === 'data') {
            return this.reloadData();
        }

        return false;
    }

    async retryWithBackoff(operation, retryCount) {
        if (!operation || retryCount >= this.maxRetries) {
            return false;
        }

        const delay = this.retryDelays[retryCount] || 5000;
        logger.info(`Retrying operation after ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            await operation();
            return true;
        } catch (error) {
            return await this.retryWithBackoff(operation, retryCount + 1);
        }
    }

    resetVisualization() {
        try {
            // Dispatch event to trigger visualization reset
            window.dispatchEvent(new CustomEvent('resetVisualization'));
            logger.info('Visualization reset successful');
            return true;
        } catch (error) {
            logger.error('Failed to reset visualization', { error: error.message });
            return false;
        }
    }

    reloadData() {
        try {
            // Dispatch event to trigger data reload
            window.dispatchEvent(new CustomEvent('reloadData'));
            logger.info('Data reload initiated');
            return true;
        } catch (error) {
            logger.error('Failed to reload data', { error: error.message });
            return false;
        }
    }

    notifyUser(error, severity) {
        const messages = {
            1: 'A minor issue occurred. The application should continue working normally.',
            2: 'An error occurred. Some features may be temporarily unavailable.',
            3: 'A significant error occurred. Please refresh the page if issues persist.',
            4: 'A critical error occurred. Please refresh the page and contact support if the issue persists.'
        };

        const message = messages[severity] || messages[2];
        
        // Create error notification element
        const notification = document.createElement('div');
        notification.className = `error-notification severity-${severity}`;
        notification.innerHTML = `
            <div class="error-message">${message}</div>
            <button class="error-dismiss" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds for non-critical errors
        if (severity < 3) {
            setTimeout(() => {
                notification.remove();
            }, 10000);
        }
    }

    wrap(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                const recovered = await this.handleError(error, {
                    ...context,
                    operation: () => fn(...args),
                    args
                });
                
                if (!recovered) {
                    throw error;
                }
            }
        };
    }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();