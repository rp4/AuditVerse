import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { logger } from '../../src/services/logger.js';

describe('Logger Service', () => {
    let consoleLogSpy;
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        // Mock console methods
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Clear logger buffer
        logger.clearBuffer();
        
        // Set to development mode
        import.meta.env = { DEV: true, PROD: false };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Log Levels', () => {
        it('should log debug messages when level allows', () => {
            logger.logLevel = 0; // debug level
            logger.debug('Debug message', { test: true });
            
            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[DEBUG]',
                'Debug message',
                { test: true }
            );
        });

        it('should not log debug messages when level is higher', () => {
            logger.logLevel = 2; // warn level
            logger.debug('Debug message');
            
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should log info messages', () => {
            logger.logLevel = 1; // info level
            logger.info('Info message', { data: 'test' });
            
            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[INFO]',
                'Info message',
                { data: 'test' }
            );
        });

        it('should log warning messages', () => {
            logger.warn('Warning message', { warning: true });
            
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[WARN]',
                'Warning message',
                { warning: true }
            );
        });

        it('should log error messages', () => {
            logger.error('Error message', { error: 'details' });
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[ERROR]',
                'Error message',
                { error: 'details' }
            );
        });

        it('should log critical messages', () => {
            logger.critical('Critical error', { critical: true });
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[CRITICAL]',
                'Critical error',
                { critical: true }
            );
        });
    });

    describe('Message Formatting', () => {
        it('should format messages with timestamp', () => {
            const beforeTime = new Date().toISOString();
            logger.info('Test message');
            const afterTime = new Date().toISOString();
            
            const buffer = logger.getRecentLogs();
            expect(buffer.length).toBe(1);
            
            const logEntry = buffer[0];
            expect(logEntry.timestamp).toBeDefined();
            expect(new Date(logEntry.timestamp).toISOString()).toBeGreaterThanOrEqual(beforeTime);
            expect(new Date(logEntry.timestamp).toISOString()).toBeLessThanOrEqual(afterTime);
        });

        it('should include user agent and URL in formatted message', () => {
            logger.info('Test message');
            
            const buffer = logger.getRecentLogs();
            const logEntry = buffer[0];
            
            expect(logEntry.userAgent).toBeDefined();
            expect(logEntry.url).toBeDefined();
        });

        it('should include context in formatted message', () => {
            const context = { userId: 123, action: 'test' };
            logger.info('Test message', context);
            
            const buffer = logger.getRecentLogs();
            const logEntry = buffer[0];
            
            expect(logEntry.context).toEqual(context);
        });
    });

    describe('Buffer Management', () => {
        it('should add messages to buffer', () => {
            logger.info('Message 1');
            logger.info('Message 2');
            logger.info('Message 3');
            
            const buffer = logger.getRecentLogs();
            expect(buffer.length).toBe(3);
            expect(buffer[0].message).toBe('Message 1');
            expect(buffer[1].message).toBe('Message 2');
            expect(buffer[2].message).toBe('Message 3');
        });

        it('should maintain max buffer size', () => {
            const maxSize = logger.maxBufferSize;
            
            // Fill buffer beyond max size
            for (let i = 0; i < maxSize + 10; i++) {
                logger.info(`Message ${i}`);
            }
            
            const buffer = logger.getRecentLogs();
            expect(buffer.length).toBe(maxSize);
            
            // Should have the most recent messages
            expect(buffer[buffer.length - 1].message).toBe(`Message ${maxSize + 9}`);
        });

        it('should clear buffer when requested', () => {
            logger.info('Message 1');
            logger.info('Message 2');
            
            expect(logger.getRecentLogs().length).toBe(2);
            
            logger.clearBuffer();
            
            expect(logger.getRecentLogs().length).toBe(0);
        });
    });

    describe('Production Mode', () => {
        beforeEach(() => {
            import.meta.env = { DEV: false, PROD: true };
        });

        it('should not output to console in production', () => {
            logger.info('Production message');
            
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should still add to buffer in production', () => {
            logger.info('Production message');
            
            const buffer = logger.getRecentLogs();
            expect(buffer.length).toBe(1);
            expect(buffer[0].message).toBe('Production message');
        });

        it('should call monitoring service if available', () => {
            const mockMonitoring = {
                log: jest.fn()
            };
            window.monitoringService = mockMonitoring;
            
            logger.error('Production error', { error: 'details' });
            
            expect(mockMonitoring.log).toHaveBeenCalled();
            const callArg = mockMonitoring.log.mock.calls[0][0];
            expect(callArg.message).toBe('Production error');
            expect(callArg.level).toBe('error');
            
            delete window.monitoringService;
        });
    });

    describe('Log Level Configuration', () => {
        it('should respect log level from environment', () => {
            import.meta.env.VITE_LOG_LEVEL = 'error';
            const newLogger = new (logger.constructor)();
            
            expect(newLogger.getLogLevel()).toBe(3); // error level
        });

        it('should default to info level if not configured', () => {
            delete import.meta.env.VITE_LOG_LEVEL;
            const newLogger = new (logger.constructor)();
            
            expect(newLogger.getLogLevel()).toBe(1); // info level
        });

        it('should handle invalid log levels', () => {
            import.meta.env.VITE_LOG_LEVEL = 'invalid-level';
            const newLogger = new (logger.constructor)();
            
            expect(newLogger.getLogLevel()).toBe(1); // defaults to info
        });
    });
});