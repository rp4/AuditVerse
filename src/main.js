// Main entry point for Vite - re-export everything from the actual main file
export * from './js/main.js';

// Also import to trigger side effects (initialization)
import './js/main.js';