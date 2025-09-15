import { describe, it, expect, beforeEach } from '@jest/globals';
import { validator } from '../../src/services/validator.js';

describe('Validator Service', () => {
    describe('validate()', () => {
        it('should validate email format', () => {
            expect(validator.validate('test@example.com', 'email')).toBe(true);
            expect(validator.validate('invalid-email', 'email')).toBe(false);
            expect(validator.validate('test@', 'email')).toBe(false);
            expect(validator.validate('@example.com', 'email')).toBe(false);
        });

        it('should validate ID format', () => {
            expect(validator.validate('R001', 'id')).toBe(true);
            expect(validator.validate('C-123', 'id')).toBe(true);
            expect(validator.validate('A_001', 'id')).toBe(true);
            expect(validator.validate('invalid id', 'id')).toBe(false);
            expect(validator.validate('id@123', 'id')).toBe(false);
        });

        it('should validate date format', () => {
            expect(validator.validate('2024-12-25', 'date')).toBe(true);
            expect(validator.validate('2024-1-1', 'date')).toBe(false);
            expect(validator.validate('12/25/2024', 'date')).toBe(false);
            expect(validator.validate('invalid-date', 'date')).toBe(false);
        });

        it('should validate number ranges', () => {
            expect(validator.validate(5, 'range', { min: 1, max: 10 })).toBe(true);
            expect(validator.validate(1, 'range', { min: 1, max: 10 })).toBe(true);
            expect(validator.validate(10, 'range', { min: 1, max: 10 })).toBe(true);
            expect(validator.validate(0, 'range', { min: 1, max: 10 })).toBe(false);
            expect(validator.validate(11, 'range', { min: 1, max: 10 })).toBe(false);
            expect(validator.validate('not-a-number', 'range', { min: 1, max: 10 })).toBe(false);
        });

        it('should validate string length', () => {
            expect(validator.validate('hello', 'length', { min: 1, max: 10 })).toBe(true);
            expect(validator.validate('', 'length', { min: 1, max: 10 })).toBe(false);
            expect(validator.validate('very long string here', 'length', { min: 1, max: 10 })).toBe(false);
        });

        it('should validate enum values', () => {
            const allowedValues = ['low', 'medium', 'high'];
            expect(validator.validate('low', 'enum', { values: allowedValues })).toBe(true);
            expect(validator.validate('medium', 'enum', { values: allowedValues })).toBe(true);
            expect(validator.validate('critical', 'enum', { values: allowedValues })).toBe(false);
            expect(validator.validate('', 'enum', { values: allowedValues })).toBe(false);
        });

        it('should handle null and undefined values', () => {
            expect(validator.validate(null, 'text')).toBe(true);
            expect(validator.validate(undefined, 'text')).toBe(true);
            expect(validator.validate(null, 'text', { required: true })).toBe(false);
            expect(validator.validate(undefined, 'text', { required: true })).toBe(false);
        });
    });

    describe('sanitize()', () => {
        it('should sanitize HTML content', () => {
            expect(validator.sanitize('<script>alert("xss")</script>', 'html'))
                .toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
            expect(validator.sanitize('<b>bold</b>', 'html'))
                .toBe('&lt;b&gt;bold&lt;/b&gt;');
        });

        it('should sanitize text input', () => {
            expect(validator.sanitize('<script>alert("xss")</script>', 'text'))
                .toBe('script>alert("xss")/script>');
            expect(validator.sanitize('javascript:alert(1)', 'text'))
                .toBe('alert(1)');
            expect(validator.sanitize('onclick="alert(1)"', 'text'))
                .toBe('"alert(1)"');
            expect(validator.sanitize('  trim me  ', 'text'))
                .toBe('trim me');
        });

        it('should sanitize SQL input', () => {
            expect(validator.sanitize("'; DROP TABLE users; --", 'sql'))
                .toBe(' DROP TABLE users ');
            expect(validator.sanitize('SELECT * FROM users WHERE id = 1', 'sql'))
                .toBe('SELECT  FROM users WHERE id = 1');
            expect(validator.sanitize('/* comment */ SELECT', 'sql'))
                .toBe(' comment  SELECT');
        });

        it('should sanitize numbers', () => {
            expect(validator.sanitize('123', 'number')).toBe(123);
            expect(validator.sanitize('123.45', 'number')).toBe(123.45);
            expect(validator.sanitize('not-a-number', 'number')).toBe(0);
            expect(validator.sanitize('12.34.56', 'number')).toBe(12.34);
        });

        it('should sanitize IDs', () => {
            expect(validator.sanitize('R-001', 'id')).toBe('R-001');
            expect(validator.sanitize('C_123', 'id')).toBe('C_123');
            expect(validator.sanitize('ID@#$%123', 'id')).toBe('ID123');
            expect(validator.sanitize('id with spaces', 'id')).toBe('idwithspaces');
        });

        it('should handle null and undefined values', () => {
            expect(validator.sanitize(null, 'text')).toBe(null);
            expect(validator.sanitize(undefined, 'text')).toBe(undefined);
        });
    });

    describe('validateRisk()', () => {
        it('should validate valid risk data', () => {
            const validRisk = {
                id: 'R001',
                name: 'Data Breach',
                entity: 'IT Systems',
                inherent_likelihood: 8,
                inherent_severity: 9,
                residual_likelihood: 5,
                residual_severity: 9,
                owner: 'John Smith',
                category: 'Cyber',
                trend: 'increasing',
                last_assessment: '2024-12-01'
            };

            const result = validator.validateRisk(validRisk);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual({});
            expect(result.sanitized.id).toBe('R001');
        });

        it('should reject invalid risk data', () => {
            const invalidRisk = {
                id: '',
                name: '',
                entity: '',
                inherent_likelihood: 15,
                inherent_severity: -1,
                residual_likelihood: 'high',
                residual_severity: null
            };

            const result = validator.validateRisk(invalidRisk);
            expect(result.valid).toBe(false);
            expect(result.errors.id).toBeDefined();
            expect(result.errors.name).toBeDefined();
            expect(result.errors.entity).toBeDefined();
            expect(result.errors.inherent_likelihood).toBeDefined();
            expect(result.errors.inherent_severity).toBeDefined();
        });

        it('should sanitize risk data', () => {
            const riskyRisk = {
                id: 'R<script>001',
                name: '<b>Data Breach</b>',
                entity: 'IT Systems<script>',
                inherent_likelihood: '8',
                inherent_severity: '9',
                residual_likelihood: '5',
                residual_severity: '9',
                owner: 'John<script>Smith',
                category: 'Cyber',
                trend: 'increasing',
                last_assessment: '2024-12-01'
            };

            const result = validator.validateRisk(riskyRisk);
            expect(result.valid).toBe(true);
            expect(result.sanitized.id).toBe('Rscript001');
            expect(result.sanitized.name).not.toContain('<');
            expect(result.sanitized.entity).not.toContain('<script>');
        });
    });

    describe('validateFilter()', () => {
        it('should validate valid filter parameters', () => {
            const validFilter = {
                type: 'controls',
                threshold: 5,
                strength: 0.7,
                search: 'test search'
            };

            const result = validator.validateFilter(validFilter);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should reject invalid filter types', () => {
            const invalidFilter = {
                type: 'invalid-type',
                threshold: 5
            };

            const result = validator.validateFilter(invalidFilter);
            expect(result.valid).toBe(false);
            expect(result.errors.type).toBeDefined();
        });

        it('should validate filter ranges', () => {
            const invalidRanges = {
                type: 'controls',
                threshold: 15,
                strength: 2
            };

            const result = validator.validateFilter(invalidRanges);
            expect(result.valid).toBe(false);
            expect(result.errors.threshold).toBeDefined();
            expect(result.errors.strength).toBeDefined();
        });
    });

    describe('validateConfig()', () => {
        it('should validate valid configuration', () => {
            const validConfig = {
                mode: 'inherent',
                theme: 'dark',
                animationSpeed: 500,
                nodeSize: 20,
                linkWidth: 3
            };

            const result = validator.validateConfig(validConfig);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should reject invalid configuration values', () => {
            const invalidConfig = {
                mode: 'invalid-mode',
                theme: 'neon',
                animationSpeed: -100,
                nodeSize: 100,
                linkWidth: 20
            };

            const result = validator.validateConfig(invalidConfig);
            expect(result.valid).toBe(false);
            expect(result.errors.mode).toBeDefined();
            expect(result.errors.theme).toBeDefined();
            expect(result.errors.animationSpeed).toBeDefined();
            expect(result.errors.nodeSize).toBeDefined();
            expect(result.errors.linkWidth).toBeDefined();
        });
    });
});