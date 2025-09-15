/**
 * Logging service for AuditVerse application
 * Provides centralized logging with different levels and monitoring integration
 */

class Logger {
    constructor() {
        this.logLevel = this.getLogLevel();
        this.buffer = [];
        this.maxBufferSize = 100;
    }

    getLogLevel() {
        const level = import.meta.env?.VITE_LOG_LEVEL || 'info';
        const levels = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 };
        return levels[level] || 1;
    }

    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 };
        return (levels[level] || 0) >= this.logLevel;
    }

    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        return {
            timestamp,
            level,
            message,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }

    log(level, message, context = {}) {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message, context);
        
        // Add to buffer for potential error reporting
        this.buffer.push(formattedMessage);
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }

        // In production, send to monitoring service
        if (import.meta.env?.PROD) {
            this.sendToMonitoring(formattedMessage);
        } else {
            // In development, output to console
            const consoleMethod = level === 'error' || level === 'critical' ? 'error' : 
                                level === 'warn' ? 'warn' : 'log';
            console[consoleMethod](`[${level.toUpperCase()}]`, message, context);
        }
    }

    debug(message, context) {
        this.log('debug', message, context);
    }

    info(message, context) {
        this.log('info', message, context);
    }

    warn(message, context) {
        this.log('warn', message, context);
    }

    error(message, context) {
        this.log('error', message, context);
    }

    critical(message, context) {
        this.log('critical', message, context);
    }

    sendToMonitoring(formattedMessage) {
        // Placeholder for sending to monitoring service (e.g., Sentry, DataDog)
        // This would be implemented based on the chosen monitoring solution
        if (window.monitoringService?.log) {
            window.monitoringService.log(formattedMessage);
        }
    }

    getRecentLogs() {
        return [...this.buffer];
    }

    clearBuffer() {
        this.buffer = [];
    }
}

// Export singleton instance
export const logger = new Logger();