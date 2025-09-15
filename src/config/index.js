/**
 * Central configuration management for AuditVerse
 * Loads and validates environment variables
 */

import { validator } from '../services/validator.js';
import { logger } from '../services/logger.js';

class Config {
    constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }

    loadConfig() {
        return {
            app: {
                name: import.meta.env?.VITE_APP_NAME || 'AuditVerse',
                version: import.meta.env?.VITE_APP_VERSION || '1.0.0',
                env: import.meta.env?.VITE_APP_ENV || 'development',
                isDevelopment: import.meta.env?.DEV || false,
                isProduction: import.meta.env?.PROD || false
            },
            api: {
                url: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',
                timeout: parseInt(import.meta.env?.VITE_API_TIMEOUT || '30000', 10)
            },
            features: {
                analytics: import.meta.env?.VITE_ENABLE_ANALYTICS === 'true',
                monitoring: import.meta.env?.VITE_ENABLE_MONITORING === 'true',
                debug: import.meta.env?.VITE_ENABLE_DEBUG === 'true'
            },
            logging: {
                level: import.meta.env?.VITE_LOG_LEVEL || 'info'
            },
            security: {
                sessionTimeout: parseInt(import.meta.env?.VITE_SESSION_TIMEOUT || '1800000', 10),
                maxLoginAttempts: parseInt(import.meta.env?.VITE_MAX_LOGIN_ATTEMPTS || '5', 10)
            },
            data: {
                source: import.meta.env?.VITE_DATA_SOURCE || 'local',
                refreshInterval: parseInt(import.meta.env?.VITE_DATA_REFRESH_INTERVAL || '300000', 10)
            },
            export: {
                maxRows: parseInt(import.meta.env?.VITE_MAX_EXPORT_ROWS || '10000', 10),
                formats: (import.meta.env?.VITE_EXPORT_FORMATS || 'pdf,csv,json').split(',')
            },
            visualization: {
                defaultTheme: import.meta.env?.VITE_DEFAULT_THEME || 'dark',
                animationSpeed: parseInt(import.meta.env?.VITE_ANIMATION_SPEED || '500', 10),
                maxNodes: parseInt(import.meta.env?.VITE_MAX_NODES || '1000', 10)
            },
            monitoring: {
                sentryDsn: import.meta.env?.VITE_SENTRY_DSN || '',
                sentryEnvironment: import.meta.env?.VITE_SENTRY_ENVIRONMENT || '',
                datadogClientToken: import.meta.env?.VITE_DATADOG_CLIENT_TOKEN || '',
                datadogApplicationId: import.meta.env?.VITE_DATADOG_APPLICATION_ID || ''
            }
        };
    }

    validateConfig() {
        try {
            // Validate API URL
            if (this.config.api.url && !validator.validate(this.config.api.url, 'url')) {
                logger.warn('Invalid API URL in configuration', { url: this.config.api.url });
            }

            // Validate numeric ranges
            const numericValidations = [
                { value: this.config.api.timeout, name: 'API timeout', min: 1000, max: 120000 },
                { value: this.config.security.sessionTimeout, name: 'Session timeout', min: 60000, max: 86400000 },
                { value: this.config.security.maxLoginAttempts, name: 'Max login attempts', min: 1, max: 10 },
                { value: this.config.data.refreshInterval, name: 'Data refresh interval', min: 10000, max: 3600000 },
                { value: this.config.export.maxRows, name: 'Max export rows', min: 100, max: 100000 },
                { value: this.config.visualization.animationSpeed, name: 'Animation speed', min: 0, max: 5000 },
                { value: this.config.visualization.maxNodes, name: 'Max nodes', min: 10, max: 10000 }
            ];

            for (const { value, name, min, max } of numericValidations) {
                if (!validator.validateRange(value, min, max)) {
                    logger.warn(`${name} out of valid range`, { value, min, max });
                }
            }

            // Validate enum values
            const validThemes = ['light', 'dark', 'auto'];
            if (!validThemes.includes(this.config.visualization.defaultTheme)) {
                logger.warn('Invalid default theme', { theme: this.config.visualization.defaultTheme });
                this.config.visualization.defaultTheme = 'dark';
            }

            const validLogLevels = ['debug', 'info', 'warn', 'error', 'critical'];
            if (!validLogLevels.includes(this.config.logging.level)) {
                logger.warn('Invalid log level', { level: this.config.logging.level });
                this.config.logging.level = 'info';
            }

            logger.info('Configuration loaded and validated successfully');
        } catch (error) {
            logger.error('Configuration validation failed', { error: error.message });
        }
    }

    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) {
                logger.warn(`Configuration key not found: ${path}`);
                return undefined;
            }
        }
        
        return value;
    }

    set(path, value) {
        const keys = path.split('.');
        let obj = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!obj[key]) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        const lastKey = keys[keys.length - 1];
        obj[lastKey] = value;
        
        logger.debug(`Configuration updated: ${path}`, { value });
    }

    isProduction() {
        return this.config.app.isProduction;
    }

    isDevelopment() {
        return this.config.app.isDevelopment;
    }

    getApiUrl(endpoint = '') {
        return `${this.config.api.url}${endpoint}`;
    }

    isFeatureEnabled(feature) {
        return this.config.features[feature] === true;
    }
}

// Export singleton instance
export const config = new Config();
export default config;