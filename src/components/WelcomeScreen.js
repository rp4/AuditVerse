/**
 * Welcome Screen Component
 * Provides options to upload JSON data or use sample data
 */

import { logger } from '../services/logger.js';
import { validator } from '../services/validator.js';
import { errorHandler } from '../services/errorHandler.js';

export class WelcomeScreen {
    constructor(onDataLoaded) {
        this.onDataLoaded = onDataLoaded;
        this.container = null;
        this.fileInput = null;
        this.isDragging = false;
    }

    render() {
        console.log('[WELCOME] Rendering welcome screen');

        // Create welcome screen HTML
        const welcomeHTML = `
            <div id="welcome-screen" class="landing-page-wrapper" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: url('./assets/Auditverse.png') center/cover no-repeat;
                background-size: cover;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            ">
                <div class="landing-container" id="landing-inner" style="
                    width: 90%;
                    max-width: 42rem;
                    padding: 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 1.5rem;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow:
                        0 8px 32px 0 rgba(31, 38, 135, 0.37),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="text-align: center; width: 100%;">
                        <!-- Title with icon -->
                        <h2 style="font-size: 3rem; font-weight: bold; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                            <span style="font-size: 3.75rem;">🚀</span>
                            AuditVerse
                        </h2>

                        <!-- Subtitle with privacy info -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; position: relative;">
                            <p style="font-size: 1.25rem; color: #e5e7eb; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                                A new, <span style="position: relative; display: inline-flex; align-items: center;">private
                                    <button class="info-button" style="
                                        background: none;
                                        border: none;
                                        cursor: help;
                                        padding: 0;
                                        margin-left: 0.25rem;
                                        display: inline-flex;
                                        align-items: center;
                                        justify-content: center;
                                    ">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #9ca3af; transition: color 0.2s;">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                    </button>
                                </span> way to visualize risk assessment
                            </p>
                            <div class="info-popup" id="privacy-popup" style="display: none; position: absolute;"></div>
                        </div>

                        <!-- File input (hidden) -->
                        <input type="file" id="file-input" accept=".json,application/json" style="display: none;">

                        <!-- Action buttons -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
                            <label for="file-input" style="
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                min-width: 13rem;
                                padding: 1rem 2rem;
                                font-size: 1.125rem;
                                font-weight: 500;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                border-radius: 0.75rem;
                                cursor: pointer;
                                transition: all 0.3s;
                                background: rgba(99, 102, 241, 0.8);
                                color: white;
                                border: 1px solid rgba(255, 255, 255, 0.3);
                                gap: 0.5rem;
                                backdrop-filter: blur(10px);
                                -webkit-backdrop-filter: blur(10px);
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                            "
                            onmouseover="this.style.background='rgba(79, 70, 229, 0.9)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.background='rgba(99, 102, 241, 0.8)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.2)';">
                                Choose JSON File
                            </label>

                            <button id="sample-btn" style="
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                min-width: 13rem;
                                padding: 1rem 2rem;
                                font-size: 1.125rem;
                                font-weight: 500;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                border-radius: 0.75rem;
                                transition: all 0.3s;
                                cursor: pointer;
                                border: 1px solid rgba(255, 255, 255, 0.4);
                                color: white;
                                background: rgba(255, 255, 255, 0.15);
                                gap: 0.5rem;
                                backdrop-filter: blur(10px);
                                -webkit-backdrop-filter: blur(10px);
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                            "
                            onmouseover="this.style.background='rgba(255, 255, 255, 0.25)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.2)';">
                                Try Now with Sample Data
                            </button>
                        </div>

                        <!-- Footer links -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 2rem;">
                            <a href="https://github.com/rp4/SwimLanes" target="_blank" rel="noopener noreferrer" style="
                                color: rgba(255, 255, 255, 0.8);
                                transition: all 0.3s;
                                display: inline-block;
                                text-decoration: none;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                            "
                            title="GitHub Repository"
                            onmouseover="this.style.color='#ffffff'; this.style.transform='scale(1.1)'"
                            onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'; this.style.transform='scale(1)'">
                                ${this.createGithubIcon()}
                            </a>

                            <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" style="
                                color: rgba(255, 255, 255, 0.8);
                                transition: all 0.3s;
                                display: inline-block;
                                text-decoration: none;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                            "
                            title="Run the custom GPT to create your inputs here"
                            onmouseover="this.style.color='#ffffff'; this.style.transform='scale(1.1)'"
                            onmouseout="this.style.color='rgba(255, 255, 255, 0.8)'; this.style.transform='scale(1)'">
                                ${this.createChatGPTIcon()}
                            </a>

                            <a href="https://scoreboard.audittoolbox.com" target="_blank" rel="noopener noreferrer" style="
                                color: rgba(255, 255, 255, 0.8);
                                transition: all 0.3s;
                                display: inline-block;
                                text-decoration: none;
                                font-size: 32px;
                                line-height: 1;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                            "
                            title="See the prompt to create your inputs here"
                            onmouseover="this.style.transform='scale(1.1)'"
                            onmouseout="this.style.transform='scale(1)'">
                                🏆
                            </a>

                            <a href="https://audittoolbox.com" target="_blank" rel="noopener noreferrer" style="
                                color: rgba(255, 255, 255, 0.8);
                                transition: all 0.3s;
                                display: inline-block;
                                text-decoration: none;
                                font-size: 32px;
                                line-height: 1;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                            "
                            title="Find other audit tools here"
                            onmouseover="this.style.transform='scale(1.1)'"
                            onmouseout="this.style.transform='scale(1)'">
                                🧰
                            </a>
                        </div>

                        <div id="upload-progress" class="upload-progress hidden" style="margin-top: 1rem;">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-text">Processing...</span>
                        </div>

                        <div id="error-message" class="error-message hidden" style="margin-top: 1rem;"></div>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('afterbegin', welcomeHTML);
        this.container = document.getElementById('welcome-screen');
        
        // Set up event listeners
        this.setupEventListeners();
        
        logger.info('Welcome screen rendered');
    }

    setupEventListeners() {
        // File upload through file input
        const fileInput = document.getElementById('file-input');

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Sample data button
        const sampleBtn = document.getElementById('sample-btn');
        sampleBtn.addEventListener('click', () => {
            this.loadSampleData();
        });

        // Setup privacy info popup
        this.setupPrivacyPopup();

        // Drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const innerContainer = document.getElementById('landing-inner');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            innerContainer.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            innerContainer.addEventListener(eventName, () => {
                this.isDragging = true;
                innerContainer.style.borderColor = 'rgba(99, 102, 241, 0.8)';
                innerContainer.style.background = 'rgba(99, 102, 241, 0.2)';
                innerContainer.style.boxShadow = '0 8px 32px 0 rgba(99, 102, 241, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2)';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            innerContainer.addEventListener(eventName, () => {
                this.isDragging = false;
                innerContainer.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                innerContainer.style.background = 'rgba(255, 255, 255, 0.1)';
                innerContainer.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
            });
        });

        innerContainer.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    async handleFileUpload(file) {
        if (!file) return;

        // Validate file
        if (!file.name.endsWith('.json')) {
            this.showError('Please upload a JSON file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size exceeds 10MB limit');
            return;
        }

        // Show file info
        const fileInfo = document.getElementById('file-info');
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
        `;
        fileInfo.classList.remove('hidden');

        // Show progress
        this.showProgress();

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data structure
            const validation = this.validateDataStructure(data);
            if (!validation.valid) {
                this.showError(validation.error);
                this.hideProgress();
                return;
            }

            logger.info('File uploaded successfully', { 
                fileName: file.name, 
                size: file.size,
                recordCounts: {
                    risks: data.risks?.length || 0,
                    controls: data.controls?.length || 0,
                    relationships: data.relationships?.length || 0
                }
            });

            // Hide welcome screen and load visualization
            this.hideWelcomeScreen();
            this.onDataLoaded(data);

        } catch (error) {
            logger.error('File upload failed', { error: error.message });
            this.showError('Invalid JSON file: ' + error.message);
            this.hideProgress();
        }
    }

    async loadSampleData() {
        this.showProgress();
        
        try {
            const response = await fetch('/data/comprehensiveSampleData.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load sample data: ${response.status}`);
            }
            
            const data = await response.json();
            
            logger.info('Sample data loaded successfully', {
                recordCounts: {
                    risks: data.risks?.length || 0,
                    controls: data.controls?.length || 0,
                    relationships: data.relationships?.length || 0
                }
            });

            // Hide welcome screen and load visualization
            this.hideWelcomeScreen();
            this.onDataLoaded(data);

        } catch (error) {
            logger.error('Failed to load sample data', { error: error.message });
            this.showError('Failed to load sample data. Please try again.');
            this.hideProgress();
        }
    }

    validateDataStructure(data) {
        // Check required fields
        if (!data.risks || !Array.isArray(data.risks)) {
            return { valid: false, error: 'Missing or invalid "risks" array' };
        }

        if (!data.relationships || !Array.isArray(data.relationships)) {
            return { valid: false, error: 'Missing or invalid "relationships" array' };
        }

        // Validate risk structure
        if (data.risks.length > 0) {
            const requiredRiskFields = ['id', 'name', 'inherent_likelihood', 'inherent_severity', 
                                       'residual_likelihood', 'residual_severity'];
            const sampleRisk = data.risks[0];
            
            for (const field of requiredRiskFields) {
                if (!(field in sampleRisk)) {
                    return { valid: false, error: `Risks missing required field: ${field}` };
                }
            }
        }

        // Validate relationships
        if (data.relationships.length > 0) {
            const requiredRelFields = ['source', 'target', 'type'];
            const sampleRel = data.relationships[0];
            
            for (const field of requiredRelFields) {
                if (!(field in sampleRel)) {
                    return { valid: false, error: `Relationships missing required field: ${field}` };
                }
            }
        }

        return { valid: true };
    }

    downloadTemplate() {
        // Create minimal template
        const template = {
            metadata: {
                version: "1.0",
                generated: new Date().toISOString().split('T')[0],
                organization: "Your Organization Name",
                description: "Risk management data"
            },
            risks: [
                {
                    id: "R001",
                    name: "Example Risk",
                    description: "Risk description",
                    entity: "Department Name",
                    inherent_likelihood: 7,
                    inherent_severity: 8,
                    inherent_rating: 7.5,
                    residual_likelihood: 4,
                    residual_severity: 8,
                    residual_rating: 6,
                    owner: "Risk Owner Name",
                    category: "Risk Category",
                    trend: "stable",
                    last_assessment: "2024-12-01"
                }
            ],
            controls: [
                {
                    id: "C001",
                    name: "Example Control",
                    description: "Control description",
                    type: "Preventive",
                    effectiveness: 85,
                    status: "Active"
                }
            ],
            relationships: [
                {
                    source: "R001",
                    target: "C001",
                    type: "mitigates",
                    strength: 0.8
                }
            ],
            audits: [],
            issues: [],
            incidents: [],
            entities: [],
            standards: []
        };

        // Download file
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auditverse-template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logger.info('Template downloaded');
    }

    showProgress() {
        const progress = document.getElementById('upload-progress');
        progress.classList.remove('hidden');
    }

    hideProgress() {
        const progress = document.getElementById('upload-progress');
        progress.classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    hideWelcomeScreen() {
        this.container.classList.add('fade-out');
        setTimeout(() => {
            this.container.remove();
        }, 300);
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Icon creation methods
    createUploadIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>`;
    }

    createFileTextIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>`;
    }

    createGithubIcon() {
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
        </svg>`;
    }

    createChatGPTIcon() {
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681v6.737zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
        </svg>`;
    }

    setupPrivacyPopup() {
        const infoButton = document.querySelector('.info-button');
        const infoPopup = document.getElementById('privacy-popup');

        if (!infoButton || !infoPopup) return;

        infoButton.addEventListener('mouseenter', () => {
            this.renderPrivacyPopup(infoPopup);
        });

        infoButton.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!infoPopup.matches(':hover')) {
                    infoPopup.style.display = 'none';
                }
            }, 100);
        });

        infoPopup.addEventListener('mouseenter', () => {
            infoPopup.style.display = 'block';
        });

        infoPopup.addEventListener('mouseleave', () => {
            infoPopup.style.display = 'none';
        });
    }

    renderPrivacyPopup(popupElement) {
        // Position and style the popup
        popupElement.style.cssText = `
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            max-width: 90vw;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 1.5rem;
            z-index: 10000;
            display: block;
        `;

        // Render popup content
        popupElement.innerHTML = `
            <!-- Header with shield icon -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                ${this.createShieldIcon()}
                <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0;">
                    Your Privacy Matters
                </h3>
            </div>

            <!-- Sections -->
            <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem;">
                ${this.createLockIcon()}
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 0.25rem 0;">
                        Local Processing Only
                    </h4>
                    <p style="color: #6b7280; margin: 0; font-size: 0.875rem; line-height: 1.4;">
                        All processing happens in your browser. Your data never leaves your device unless you explicitly export it.
                    </p>
                </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                ${this.createDatabaseIcon()}
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 0.25rem 0;">
                        No Data Collection
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="color: #6b7280; margin-bottom: 0.25rem; padding-left: 1rem; position: relative; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0;">•</span>
                            No tracking or analytics
                        </li>
                        <li style="color: #6b7280; margin-bottom: 0.25rem; padding-left: 1rem; position: relative; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0;">•</span>
                            No cookies or local storage
                        </li>
                        <li style="color: #6b7280; margin-bottom: 0.25rem; padding-left: 1rem; position: relative; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0;">•</span>
                            No server uploads
                        </li>
                        <li style="color: #6b7280; padding-left: 1rem; position: relative; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0;">•</span>
                            Complete privacy
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    // Icon creation methods for privacy popup
    createShieldIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    }

    createLockIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>`;
    }

    createDatabaseIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>`;
    }
}