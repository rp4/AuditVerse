/**
 * Input validation service for AuditVerse
 * Provides comprehensive validation and sanitization for all user inputs
 */

import { logger } from './logger.js';

class Validator {
    constructor() {
        this.rules = {
            id: /^[A-Z0-9\-_]+$/i,
            name: /^[a-zA-Z0-9\s\-_&.,']+$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            number: /^\d+(\.\d+)?$/,
            alphanumeric: /^[a-zA-Z0-9]+$/,
            url: /^https?:\/\/.+/,
            severity: /^(low|medium|high|critical)$/i,
            status: /^(open|closed|in_progress|planned|completed)$/i
        };
    }

    /**
     * Validate a single value against a rule
     */
    validate(value, rule, options = {}) {
        if (value === null || value === undefined) {
            return options.required ? false : true;
        }

        const stringValue = String(value);

        // Check pattern if provided
        if (rule instanceof RegExp) {
            return rule.test(stringValue);
        }

        // Check predefined rules
        if (this.rules[rule]) {
            return this.rules[rule].test(stringValue);
        }

        // Check specific validation types
        switch (rule) {
            case 'range':
                return this.validateRange(value, options.min, options.max);
            case 'length':
                return this.validateLength(stringValue, options.min, options.max);
            case 'enum':
                return this.validateEnum(stringValue, options.values);
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                logger.warn(`Unknown validation rule: ${rule}`);
                return true;
        }
    }

    validateRange(value, min, max) {
        const num = Number(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    }

    validateLength(value, min, max) {
        const len = value.length;
        if (min !== undefined && len < min) return false;
        if (max !== undefined && len > max) return false;
        return true;
    }

    validateEnum(value, allowedValues) {
        if (!Array.isArray(allowedValues)) return false;
        return allowedValues.includes(value);
    }

    /**
     * Sanitize input to prevent XSS and injection attacks
     */
    sanitize(value, type = 'text') {
        if (value === null || value === undefined) return value;

        const stringValue = String(value);

        switch (type) {
            case 'html':
                return this.sanitizeHtml(stringValue);
            case 'sql':
                return this.sanitizeSql(stringValue);
            case 'number':
                return this.sanitizeNumber(stringValue);
            case 'id':
                return this.sanitizeId(stringValue);
            case 'text':
            default:
                return this.sanitizeText(stringValue);
        }
    }

    sanitizeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    sanitizeText(value) {
        return value
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    sanitizeSql(value) {
        return value
            .replace(/['";\\]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            .replace(/xp_/gi, '')
            .replace(/sp_/gi, '');
    }

    sanitizeNumber(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    sanitizeId(value) {
        return value.replace(/[^a-zA-Z0-9\-_]/g, '');
    }

    /**
     * Validate a complete form or data object
     */
    validateForm(data, schema) {
        const errors = {};
        const sanitized = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldErrors = [];

            // Check required
            if (rules.required && (value === null || value === undefined || value === '')) {
                fieldErrors.push(`${field} is required`);
            }

            // Validate against rules
            if (value !== null && value !== undefined) {
                if (rules.type && !this.validate(value, rules.type, rules)) {
                    fieldErrors.push(`${field} has invalid format`);
                }

                if (rules.pattern && !this.validate(value, rules.pattern)) {
                    fieldErrors.push(`${field} does not match required pattern`);
                }

                if (rules.min !== undefined || rules.max !== undefined) {
                    if (!this.validateRange(value, rules.min, rules.max)) {
                        fieldErrors.push(`${field} must be between ${rules.min} and ${rules.max}`);
                    }
                }

                if (rules.minLength !== undefined || rules.maxLength !== undefined) {
                    if (!this.validateLength(String(value), rules.minLength, rules.maxLength)) {
                        fieldErrors.push(`${field} length must be between ${rules.minLength} and ${rules.maxLength}`);
                    }
                }

                if (rules.enum && !this.validateEnum(value, rules.enum)) {
                    fieldErrors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }

                // Sanitize if no errors
                if (fieldErrors.length === 0) {
                    sanitized[field] = rules.sanitize ? 
                        this.sanitize(value, rules.sanitize) : value;
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
            sanitized
        };
    }

    /**
     * Validate risk data
     */
    validateRisk(risk) {
        const schema = {
            id: { required: true, type: 'id', sanitize: 'id' },
            name: { required: true, type: 'name', minLength: 1, maxLength: 100, sanitize: 'text' },
            entity: { required: true, type: 'name', sanitize: 'text' },
            inherent_likelihood: { required: true, type: 'range', min: 1, max: 10, sanitize: 'number' },
            inherent_severity: { required: true, type: 'range', min: 1, max: 10, sanitize: 'number' },
            residual_likelihood: { required: true, type: 'range', min: 1, max: 10, sanitize: 'number' },
            residual_severity: { required: true, type: 'range', min: 1, max: 10, sanitize: 'number' },
            owner: { required: false, type: 'name', sanitize: 'text' },
            category: { required: false, type: 'name', sanitize: 'text' },
            trend: { required: false, enum: ['increasing', 'stable', 'decreasing'], sanitize: 'text' },
            last_assessment: { required: false, type: 'date', sanitize: 'text' }
        };

        return this.validateForm(risk, schema);
    }

    /**
     * Validate filter parameters
     */
    validateFilter(filter) {
        const schema = {
            type: { required: true, enum: ['controls', 'issues', 'incidents', 'entities', 'standards', 'audits'], sanitize: 'text' },
            threshold: { required: false, type: 'range', min: 0, max: 10, sanitize: 'number' },
            strength: { required: false, type: 'range', min: 0, max: 1, sanitize: 'number' },
            search: { required: false, type: 'text', maxLength: 100, sanitize: 'text' }
        };

        return this.validateForm(filter, schema);
    }

    /**
     * Validate configuration settings
     */
    validateConfig(config) {
        const schema = {
            mode: { required: false, enum: ['inherent', 'residual', 'delta'], sanitize: 'text' },
            theme: { required: false, enum: ['light', 'dark', 'auto'], sanitize: 'text' },
            animationSpeed: { required: false, type: 'range', min: 0, max: 2000, sanitize: 'number' },
            nodeSize: { required: false, type: 'range', min: 5, max: 50, sanitize: 'number' },
            linkWidth: { required: false, type: 'range', min: 1, max: 10, sanitize: 'number' }
        };

        return this.validateForm(config, schema);
    }
}

// Export singleton instance
export const validator = new Validator();