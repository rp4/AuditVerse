// Main application entry point
import { logger } from '../services/logger.js';
import { errorHandler } from '../services/errorHandler.js';
import { validator } from '../services/validator.js';
import config from '../config/index.js';
import { WelcomeScreen } from '../components/WelcomeScreen.js';

// Global variables
let data = null;
let svg, g, width, height;
let simulation;
let currentMode = 'residual';
let selectedNode = null;
let activeFilters = new Set(['controls', 'issues', 'incidents', 'entities', 'standards', 'audits', 'risks']);
let riskTypes = [];
let animationInterval = null;
let nodePositions = new Map(); // Store positions between updates
let timelineValue = 0;
let isAnimating = false;

// Global selection states
let selectedAudits = new Set();
let selectedUnits = new Set();
let selectedStandards = new Set();
let selectedRiskTypes = new Set();

// Initialize the application
async function initApp() {
    try {
        logger.info('Initializing AuditVerse application');
        
        // Check if D3 is loaded
        if (typeof d3 === 'undefined') {
            throw new Error('D3.js library not loaded');
        }
        
        // Show welcome screen
        const welcomeScreen = new WelcomeScreen(handleDataLoaded);
        welcomeScreen.render();
        
        logger.info('Welcome screen displayed');
    } catch (error) {
        logger.error('Application initialization failed', { error: error.message });
        showErrorMessage('Failed to initialize application. Please refresh the page.');
    }
}

// Handle data loaded from welcome screen
function handleDataLoaded(loadedData) {
    try {
        logger.info('Data loaded from welcome screen', {
            recordCounts: {
                risks: loadedData.risks?.length || 0,
                controls: loadedData.controls?.length || 0,
                relationships: loadedData.relationships?.length || 0
            }
        });

        // Validate data structure
        if (!loadedData.risks || !loadedData.relationships) {
            throw new Error('Invalid data structure: missing required fields');
        }

        // Set global data
        data = loadedData;

        // Show the main container now that data is loaded
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = '';
        }

        // Initialize the visualization
        init();

        logger.info('Visualization initialized with user data');
    } catch (error) {
        logger.error('Failed to initialize with loaded data', { error: error.message });
        showErrorMessage('Failed to load visualization. Please check your data format.');
    }
}

// Show error message to user
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(255, 0, 102, 0.9) 0%, rgba(255, 0, 102, 0.7) 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Rajdhani', sans-serif;
        animation: slide-in 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 10000);
}

// Initialize the visualization (wrapped with error handler)
const init = errorHandler.wrap(function() {
    if (!data) {
        throw new Error('No data available for visualization');
    }
    
    const container = document.getElementById('knowledge-graph');
    if (!container) {
        throw new Error('Visualization container not found');
    }
    
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    svg = d3.select('#knowledge-graph')
        .attr('width', width)
        .attr('height', height);

    // Add definitions for gradients and filters
    const defs = svg.append('defs');

    // Add glow filter
    const filter = defs.append('filter')
        .attr('id', 'glow');
    
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Create main group
    g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Add click handler to background to clear selection
    svg.on('click', function(event) {
        // Only clear if clicking on the SVG background itself
        if (event.target === this) {
            clearSelection();
        }
    });

    // Draw grid
    drawGrid();

    // Initialize visualization
    updateVisualization();

    // Update stats
    updateStats();
    
    // Initialize dropdowns after D3 is ready
    initializeDropdowns();
    
    // Initialize preset views dropdown
    initializePresetViews();
    
    // Set up event listeners
    setupEventListeners();
    
    logger.info('Visualization initialized', { width, height, nodeCount: data.risks.length });
}, { component: 'visualization' });

// Draw background grid
function drawGrid() {
    // Keeping visualization clean - no background elements
}

// Update visualization based on current settings
const updateVisualization = errorHandler.wrap(function() {
    if (!data || !g) {
        logger.warn('Cannot update visualization: missing data or SVG group');
        return;
    }
    
    try {
        // Clear previous elements
        g.selectAll('.links').remove();
        g.selectAll('.nodes').remove();
        g.selectAll('.orbits').remove();

        // Get current risk positions
        let riskNodes = data.risks.map(r => ({
            ...r,
            x: currentMode === 'inherent' ? 
                (r.inherent_likelihood / 10) * width : 
                (r.residual_likelihood / 10) * width,
            y: currentMode === 'inherent' ? 
                height - (r.inherent_severity / 10) * height : 
                height - (r.residual_severity / 10) * height,
            radius: currentMode === 'inherent' ? 
                Math.sqrt(r.inherent_rating) * 8 : 
                Math.sqrt(r.residual_rating) * 8,
            type: 'risk'
        }));

        // Create a link group that will be populated later
        const linkGroup = g.append('g')
            .attr('class', 'links');

        // Draw nodes
        const nodeGroup = g.append('g')
            .attr('class', 'nodes');

        // Draw risk nodes only if risks filter is active
        if (activeFilters.has('risks')) {
            const riskNode = nodeGroup.selectAll('.risk-node')
                .data(riskNodes)
                .enter()
                .append('g')
                .attr('class', 'risk-node')
                .attr('transform', d => `translate(${d.x}, ${d.y})`);

            // Add circles for risk nodes
            riskNode.append('circle')
                .attr('r', d => d.radius)
                .attr('fill', '#ff0066')
                .attr('fill-opacity', 0.8)
                .attr('stroke', '#ff0099')
                .attr('stroke-width', 2)
                .style('filter', 'url(#glow)')
                .on('click', function(event, d) {
                    event.stopPropagation();
                    selectNode(d);
                });

            // Add labels for risk nodes
            riskNode.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '.35em')
                .attr('fill', '#ffffff')
                .attr('font-size', '10px')
                .attr('font-family', 'Orbitron, monospace')
                .text(d => d.name);
        }

        // Get all entities that should be displayed
        const visibleEntities = [];

        // Collect entities based on active filters and preserve positions
        if (activeFilters.has('controls') && data.controls) {
            data.controls.forEach(c => {
                const stored = nodePositions.get(c.id);
                visibleEntities.push({
                    ...c,
                    entityType: 'control',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        if (activeFilters.has('issues') && data.issues) {
            data.issues.forEach(i => {
                const stored = nodePositions.get(i.id);
                visibleEntities.push({
                    ...i,
                    entityType: 'issue',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        if (activeFilters.has('incidents') && data.incidents) {
            data.incidents.forEach(inc => {
                const stored = nodePositions.get(inc.id);
                visibleEntities.push({
                    ...inc,
                    entityType: 'incident',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        if (activeFilters.has('entities') && (data.businessUnits || data.entities)) {
            (data.businessUnits || data.entities).forEach(e => {
                const stored = nodePositions.get(e.id);
                visibleEntities.push({
                    ...e,
                    entityType: 'businessUnit',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        if (activeFilters.has('standards') && data.standards) {
            data.standards.forEach(s => {
                const stored = nodePositions.get(s.id);
                visibleEntities.push({
                    ...s,
                    entityType: 'standard',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        if (activeFilters.has('audits') && data.audits) {
            data.audits.forEach(a => {
                const stored = nodePositions.get(a.id);
                visibleEntities.push({
                    ...a,
                    entityType: 'audit',
                    x: stored?.x,
                    y: stored?.y,
                    fx: null,
                    fy: null
                });
            });
        }

        // Calculate initial positions for entities that don't have them
        visibleEntities.forEach(entity => {
            if (!entity.x || !entity.y) {
                const connectedRisks = [];
                data.relationships.forEach(rel => {
                    if (rel.target === entity.id && activeFilters.has('risks')) {
                        const risk = riskNodes.find(r => r.id === rel.source);
                        if (risk) connectedRisks.push(risk);
                    }
                });

                if (connectedRisks.length > 0) {
                    // Position entity at the average position of connected risks
                    entity.x = connectedRisks.reduce((sum, r) => sum + r.x, 0) / connectedRisks.length;
                    entity.y = connectedRisks.reduce((sum, r) => sum + r.y, 0) / connectedRisks.length;

                    // Add small random offset to prevent exact overlap
                    const offsetAngle = Math.random() * Math.PI * 2;
                    const offsetRadius = 30 + Math.random() * 20;
                    entity.x += Math.cos(offsetAngle) * offsetRadius;
                    entity.y += Math.sin(offsetAngle) * offsetRadius;
                } else {
                    // If no connected risks, position at center with random offset
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * Math.min(width, height) * 0.3;
                    entity.x = width / 2 + Math.cos(angle) * radius;
                    entity.y = height / 2 + Math.sin(angle) * radius;
                }

                // Store the initial position
                nodePositions.set(entity.id, { x: entity.x, y: entity.y });
            }
        });

        // Create links array before drawing nodes
        const links = [];
        data.relationships.forEach(rel => {
            if (activeFilters.has('risks')) {
                const sourceRisk = riskNodes.find(r => r.id === rel.source);
                const targetEntity = visibleEntities.find(e => e.id === rel.target);

                if (sourceRisk && targetEntity) {
                    links.push({
                        ...rel,
                        source: sourceRisk,
                        target: targetEntity
                    });
                }
            }
        });

        // Combine all nodes for force simulation
        const allNodes = [...(activeFilters.has('risks') ? riskNodes : []), ...visibleEntities];

        // Create force simulation
        if (simulation) simulation.stop();

        simulation = d3.forceSimulation(allNodes)
            .force('link', d3.forceLink(links)
                .id(d => d.id)
                .distance(60)
                .strength(0.5))
            .force('charge', d3.forceManyBody()
                .strength(-150)
                .distanceMax(200))
            .force('collision', d3.forceCollide()
                .radius(d => d.radius ? d.radius + 5 : 15))
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05))
            .alpha(0.3) // Start with lower alpha for gentler animation
            .alphaDecay(0.02); // Slower decay for smoother settling

        // Keep risk nodes fixed at their positions
        riskNodes.forEach(r => {
            r.fx = r.x;
            r.fy = r.y;
        });

        // Draw entity nodes with initial positions
        const entityNode = nodeGroup.selectAll('.entity-node')
            .data(visibleEntities)
            .enter()
            .append('g')
            .attr('class', d => `entity-node entity-${d.entityType}`)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        // Add circles for all entity nodes
        entityNode.each(function(d) {
            const group = d3.select(this);

            // Different colors for different entity types
            const colors = {
                control: '#00ccff',
                issue: '#ffff00',
                incident: '#ff0099',
                businessUnit: '#00ff99',
                standard: '#9966ff',
                audit: '#ff00ff'
            };

            const color = colors[d.entityType] || '#ffffff';

            // Circle for all entity types
            group.append('circle')
                .attr('r', 10)
                .attr('fill', color)
                .attr('fill-opacity', 0.7)
                .attr('stroke', color)
                .attr('stroke-width', 1.5)
                .style('filter', 'url(#glow)');

            // Add click handler
            group.on('click', function(event, d) {
                event.stopPropagation();
                selectNode(d);
            });
        });

        // Remove labels - no longer displaying IDs

        // Draw the links
        linkGroup.selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', d => {
                // Color code by entity type
                const colors = {
                    control: '#00ccff',
                    issue: '#ffff00',
                    incident: '#ff0099',
                    businessUnit: '#00ff99',
                    standard: '#9966ff',
                    audit: '#ff00ff'
                };
                return colors[d.target.entityType] || '#00ffcc';
            })
            .attr('stroke-opacity', d => d.strength * 0.6)
            .attr('stroke-width', d => Math.max(1, d.strength * 3));

        // Update positions on simulation tick
        simulation.on('tick', () => {
            // Update entity positions
            entityNode.attr('transform', d => {
                // Store positions for next update
                nodePositions.set(d.id, { x: d.x, y: d.y });
                return `translate(${d.x}, ${d.y})`;
            });

            // Update link positions
            linkGroup.selectAll('.link')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        });

        // Allow dragging of entity nodes
        entityNode.call(d3.drag()
            .on('start', function(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', function(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', function(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }));

        logger.debug('Visualization updated', { 
            nodeCount: riskNodes.length, 
            linkCount: links.length,
            mode: currentMode 
        });
    } catch (error) {
        logger.error('Error updating visualization', { error: error.message });
        throw error;
    }
}, { component: 'visualization' });

// Get entity by ID
function getEntityById(id) {
    // Search across all entity types
    const allEntities = [
        ...(data.controls || []),
        ...(data.issues || []),
        ...(data.incidents || []),
        ...(data.businessUnits || data.entities || []),
        ...(data.standards || []),
        ...(data.audits || [])
    ];

    const entity = allEntities.find(e => e.id === id);
    return entity;
}

// Get entity type
function getEntityType(entity) {
    if (!entity) return null;

    if (data.controls?.some(c => c.id === entity.id)) return 'controls';
    if (data.issues?.some(i => i.id === entity.id)) return 'issues';
    if (data.incidents?.some(i => i.id === entity.id)) return 'incidents';
    if ((data.businessUnits || data.entities)?.some(e => e.id === entity.id)) return 'entities';
    if (data.standards?.some(s => s.id === entity.id)) return 'standards';
    if (data.audits?.some(a => a.id === entity.id)) return 'audits';

    return null;
}

// Clear node selection
function clearSelection() {
    selectedNode = null;

    // Reset all nodes and links to full opacity
    g.selectAll('.risk-node')
        .classed('selected', false)
        .transition()
        .duration(300)
        .style('opacity', 1)
        .style('filter', 'none');

    g.selectAll('.entity-node')
        .transition()
        .duration(300)
        .style('opacity', 1)
        .style('filter', 'none');

    g.selectAll('.orbiting-node-group')
        .transition()
        .duration(300)
        .style('opacity', 1);

    g.selectAll('.link')
        .transition()
        .duration(300)
        .style('stroke-opacity', 0.6)
        .style('stroke-width', 2);

    // Clear details panel
    document.getElementById('details-panel').innerHTML = '<div class="details-placeholder">Select a node to view details</div>';
}

// Select node
function selectNode(node) {
    selectedNode = node;
    updateDetailsPanel(node);

    // Get all connected nodes
    const connectedNodeIds = new Set([node.id]);

    // Find all relationships involving this node
    data.relationships.forEach(rel => {
        if (rel.risk_id === node.id || rel.entity_id === node.id) {
            connectedNodeIds.add(rel.risk_id);
            connectedNodeIds.add(rel.entity_id);
        }
    });

    // Apply highlighting to nodes with smooth transitions
    g.selectAll('.risk-node')
        .classed('selected', d => d.id === node.id)
        .transition()
        .duration(300)
        .style('opacity', d => {
            if (d.id === node.id) return 1; // Selected node fully visible
            if (connectedNodeIds.has(d.id)) return 0.85; // Connected nodes slightly less visible
            return 0.15; // Others very faint
        })
        .style('filter', d => {
            if (d.id === node.id) return 'drop-shadow(0 0 30px currentColor) brightness(1.2)'; // Selected node glows bright
            if (connectedNodeIds.has(d.id)) return 'drop-shadow(0 0 10px currentColor)'; // Connected nodes have subtle glow
            return 'none';
        });

    // Apply highlighting to entity nodes
    g.selectAll('.entity-node')
        .transition()
        .duration(300)
        .style('opacity', d => {
            if (d.id === node.id) return 1; // Selected node fully visible
            if (connectedNodeIds.has(d.id)) return 0.85; // Connected nodes slightly less visible
            return 0.15; // Others very faint
        })
        .style('filter', d => {
            if (d.id === node.id) return 'drop-shadow(0 0 30px currentColor) brightness(1.2)'; // Selected node glows bright
            if (connectedNodeIds.has(d.id)) return 'drop-shadow(0 0 10px currentColor)'; // Connected nodes have subtle glow
            return 'none';
        });

    // Apply highlighting to orbiting nodes
    g.selectAll('.orbiting-node-group')
        .transition()
        .duration(300)
        .style('opacity', function(d) {
            const parentId = d3.select(this).attr('data-parent-id');
            if (d.id === node.id || parentId === node.id) return 1;
            if (connectedNodeIds.has(parentId) || connectedNodeIds.has(d.id)) return 0.85;
            return 0.15;
        });

    // Apply highlighting to links - make connected links prominent
    g.selectAll('.link')
        .transition()
        .duration(300)
        .style('stroke-opacity', d => {
            const isConnected = (d.source?.id === node.id || d.target?.id === node.id) ||
                               (connectedNodeIds.has(d.source?.id || d.source) &&
                                connectedNodeIds.has(d.target?.id || d.target));
            return isConnected ? 0.9 : 0.05;
        })
        .style('stroke-width', d => {
            const isDirectlyConnected = (d.source?.id === node.id || d.target?.id === node.id);
            if (isDirectlyConnected) return 4; // Direct connections are thickest
            const isConnected = connectedNodeIds.has(d.source?.id || d.source) &&
                               connectedNodeIds.has(d.target?.id || d.target);
            return isConnected ? 2.5 : 1;
        })
        .style('filter', d => {
            const isDirectlyConnected = (d.source?.id === node.id || d.target?.id === node.id);
            return isDirectlyConnected ? 'drop-shadow(0 0 8px currentColor)' : 'none';
        });
}

// Update details panel
function updateDetailsPanel(node) {
    const detailsContent = document.getElementById('details-content');
    const detailsEmpty = document.querySelector('.details-empty');

    if (!detailsContent) return;

    // Hide empty state and show content
    if (detailsEmpty) {
        detailsEmpty.style.display = 'none';
    }
    detailsContent.style.display = 'block';

    // Update title and type
    const titleEl = document.getElementById('details-title');
    const typeEl = document.getElementById('details-type');

    if (titleEl) titleEl.textContent = node.name || node.id;
    if (typeEl) typeEl.textContent = node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Risk';

    // For risk nodes, update the 2x2 metrics grid
    const metricsGrid = document.querySelector('.metrics-grid');
    if (node.type === 'risk' && metricsGrid) {
        // Update the four metric values in the existing grid structure
        const likelihoodInherent = document.getElementById('metric-likelihood-inherent');
        const likelihoodResidual = document.getElementById('metric-likelihood-residual');
        const severityInherent = document.getElementById('metric-severity-inherent');
        const severityResidual = document.getElementById('metric-severity-residual');

        if (likelihoodInherent) likelihoodInherent.textContent = node.inherent_likelihood || 0;
        if (likelihoodResidual) likelihoodResidual.textContent = node.residual_likelihood || 0;
        if (severityInherent) severityInherent.textContent = node.inherent_severity || 0;
        if (severityResidual) severityResidual.textContent = node.residual_severity || 0;

        // Ensure metrics grid is visible with proper styling
        metricsGrid.style.display = 'grid';
        metricsGrid.style.gridTemplateColumns = '1fr 1fr';
        metricsGrid.style.gap = '10px';
        metricsGrid.style.marginBottom = '20px';
    } else if (metricsGrid) {
        // Hide metrics grid for non-risk nodes
        metricsGrid.style.display = 'none';
    }

    // Update connections list
    const connections = data.relationships.filter(r =>
        r.source === node.id || r.target === node.id
    );

    const connectionsList = document.getElementById('connections-list');
    if (connectionsList) {
        connectionsList.innerHTML = '';

        connections.forEach(conn => {
            const otherNodeId = conn.source === node.id ? conn.target : conn.source;
            const otherNode = getEntityById(otherNodeId) ||
                data.risks?.find(r => r.id === otherNodeId);

            if (otherNode) {
                const item = document.createElement('div');
                item.className = 'connection-item';
                item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(0,255,204,0.05); border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.3s; border: 1px solid rgba(0,255,204,0.1);';

                // Determine entity color based on type
                let entityColor = '#00ffcc';
                if (otherNode.type === 'control' || data.controls?.some(c => c.id === otherNode.id)) entityColor = '#00ccff';
                else if (otherNode.type === 'issue' || data.issues?.some(i => i.id === otherNode.id)) entityColor = '#ffff00';
                else if (otherNode.type === 'incident' || data.incidents?.some(i => i.id === otherNode.id)) entityColor = '#ff0099';
                else if (otherNode.type === 'audit' || data.audits?.some(a => a.id === otherNode.id)) entityColor = '#ff00ff';
                else if (otherNode.type === 'standard' || data.standards?.some(s => s.id === otherNode.id)) entityColor = '#9966ff';
                else if (otherNode.type === 'risk') entityColor = '#ff0066';

                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <span style="color: ${entityColor}; font-size: 1.2rem;">●</span>
                        <span style="color: #e0e0e0; font-size: 0.9rem;">${otherNode.name || otherNode.title || otherNode.description || otherNode.id}</span>
                    </div>
                    <span style="opacity: 0.6; font-size: 0.75rem; color: #00ffcc; text-transform: uppercase;">${conn.type?.replace('_', ' ') || 'linked'}</span>
                `;

                item.onmouseover = () => {
                    item.style.background = 'rgba(0,255,204,0.15)';
                    item.style.borderColor = 'rgba(0,255,204,0.5)';
                };
                item.onmouseout = () => {
                    item.style.background = 'rgba(0,255,204,0.05)';
                    item.style.borderColor = 'rgba(0,255,204,0.1)';
                };
                item.onclick = () => {
                    selectNode(otherNode);
                };

                connectionsList.appendChild(item);
            }
        });

        if (connections.length === 0) {
            connectionsList.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.9rem; text-align: center; padding: 20px;">No connections</div>';
        }
    }

    logger.debug('Details panel updated', { nodeId: node.id });
}

// Update statistics
function updateStats() {
    try {
        const stats = {
            totalRisks: data.risks?.length || 0,
            highRisks: data.risks?.filter(r => r.residual_rating >= 7).length || 0,
            openIssues: data.issues?.filter(i => i.status === 'Open').length || 0,
            activeControls: data.controls?.length || 0
        };
        
        // Update DOM elements if they exist
        const elements = {
            'total-risks': stats.totalRisks,
            'high-risks': stats.highRisks,
            'open-issues': stats.openIssues,
            'active-controls': stats.activeControls
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
        
        logger.debug('Statistics updated', stats);
    } catch (error) {
        logger.error('Failed to update statistics', { error: error.message });
    }
}

// Initialize dropdowns
function initializeDropdowns() {
    if (!data) return;

    // Initialize audit dropdown
    if (data.audits) {
        populateDropdown('audit', data.audits);
    }

    // Initialize business units dropdown
    if (data.businessUnits || data.entities) {
        populateDropdown('unit', data.businessUnits || data.entities);
    }

    // Initialize standards dropdown
    if (data.standards) {
        populateDropdown('standard', data.standards);
    }

    // Initialize risk types dropdown
    const riskCategories = [...new Set(data.risks?.map(r => r.category).filter(Boolean))];
    if (riskCategories.length > 0) {
        populateDropdown('risk-type', riskCategories.map(cat => ({ id: cat, name: cat })));
    }

    // Setup dropdown event handlers
    setupDropdownHandlers();

    logger.debug('Dropdowns initialized');
}

// Populate dropdown with options
function populateDropdown(type, items) {
    const container = document.getElementById(`${type}-options-container`);
    if (!container) return;

    container.innerHTML = '';

    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.innerHTML = `
            <input type="checkbox" class="filter-checkbox"
                   id="${type}-${item.id}"
                   data-type="${type}"
                   data-value="${item.id}"
                   checked>
            <label for="${type}-${item.id}">${item.name || item.id}</label>
        `;
        container.appendChild(option);

        // Add to selected set
        if (type === 'audit') selectedAudits.add(item.id);
        else if (type === 'unit') selectedUnits.add(item.id);
        else if (type === 'standard') selectedStandards.add(item.id);
        else if (type === 'risk-type') selectedRiskTypes.add(item.id);
    });

    updateDropdownDisplay(type);
}

// Setup dropdown event handlers
function setupDropdownHandlers() {
    // Toggle dropdowns
    document.querySelectorAll('.filter-selected').forEach(selected => {
        selected.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('filter-dropdown')) {
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });

    // Handle checkbox changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('filter-checkbox')) {
            const type = e.target.dataset.type;
            const value = e.target.dataset.value;

            if (type === 'audit') {
                if (e.target.checked) selectedAudits.add(value);
                else selectedAudits.delete(value);
            } else if (type === 'unit') {
                if (e.target.checked) selectedUnits.add(value);
                else selectedUnits.delete(value);
            } else if (type === 'standard') {
                if (e.target.checked) selectedStandards.add(value);
                else selectedStandards.delete(value);
            } else if (type === 'risk-type') {
                if (e.target.checked) selectedRiskTypes.add(value);
                else selectedRiskTypes.delete(value);
            }

            updateDropdownDisplay(type);
            updateVisualization();
        }
    });

    // Select/Deselect all buttons
    document.querySelectorAll('.filter-select-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isSelectAll = this.id.includes('select-all');
            const type = this.id.split('-')[0];

            document.querySelectorAll(`#${type}-options-container .filter-checkbox`).forEach(checkbox => {
                checkbox.checked = isSelectAll;
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            });
        });
    });

    // Search functionality
    document.querySelectorAll('.filter-search-input').forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const type = this.id.split('-')[0];
            const container = document.getElementById(`${type}-options-container`);

            container.querySelectorAll('.filter-option').forEach(option => {
                const label = option.querySelector('label').textContent.toLowerCase();
                option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    });
}

// Update dropdown display text
function updateDropdownDisplay(type) {
    const selected = document.getElementById(`${type}-selected`);
    if (!selected) return;

    let count = 0;
    let total = 0;

    if (type === 'audit') {
        count = selectedAudits.size;
        total = data.audits?.length || 0;
    } else if (type === 'unit') {
        count = selectedUnits.size;
        total = (data.businessUnits || data.entities)?.length || 0;
    } else if (type === 'standard') {
        count = selectedStandards.size;
        total = data.standards?.length || 0;
    } else if (type === 'risk-type') {
        count = selectedRiskTypes.size;
        total = [...new Set(data.risks?.map(r => r.category).filter(Boolean))].length;
    }

    if (count === 0) {
        selected.innerHTML = '<span class="filter-placeholder">None selected</span>';
    } else if (count === total) {
        selected.innerHTML = '<span class="filter-placeholder">All selected</span>';
    } else {
        selected.innerHTML = `<span class="filter-placeholder">${count} of ${total} selected</span>`;
    }
}

// Initialize preset views
function initializePresetViews() {
    // This would initialize preset view functionality
    logger.debug('Preset views initialized');
}

// Set up event listeners
function setupEventListeners() {
    // Risk mode toggle (residual vs inherent)
    const riskModeToggle = document.querySelector('.toggle-item[data-mode="toggle-risk"]');
    if (riskModeToggle) {
        riskModeToggle.addEventListener('click', function() {
            const checkbox = this.querySelector('.toggle-checkbox');
            const label = document.getElementById('risk-mode-label');

            // Toggle the checkbox visual state
            checkbox.classList.toggle('checked');

            // Toggle between residual and inherent mode
            if (checkbox.classList.contains('checked')) {
                currentMode = 'residual';
                if (label) label.textContent = 'Residual Risk (with controls)';
            } else {
                currentMode = 'inherent';
                if (label) label.textContent = 'Inherent Risk (without controls)';
            }

            updateVisualization();
            logger.debug('Risk mode toggled', { mode: currentMode });
        });

        // Set initial state
        const checkbox = riskModeToggle.querySelector('.toggle-checkbox');
        if (checkbox) checkbox.classList.add('checked');
    }

    // Entity filters
    document.querySelectorAll('.entity-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const entity = this.dataset.entity;
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                activeFilters.add(entity);
            } else {
                activeFilters.delete(entity);
            }

            updateVisualization();
        });
    });
    
    // Risk threshold slider
    const thresholdSlider = document.getElementById('risk-threshold');
    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', function() {
            document.getElementById('threshold-value').textContent = this.value;
            // Filter nodes based on threshold
            const threshold = parseFloat(this.value);
            
            g.selectAll('.risk-node')
                .style('opacity', d => {
                    const rating = currentMode === 'inherent' ? d.inherent_rating : d.residual_rating;
                    return rating >= threshold ? 1 : 0.2;
                });
        });
    }
    
    // Window resize
    window.addEventListener('resize', () => {
        const container = document.getElementById('knowledge-graph');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        
        svg.attr('width', width).attr('height', height);
        updateVisualization();
    });
    
    logger.debug('Event listeners set up');
}

// Export functions for external use
window.AuditVerse = {
    init: initApp,
    updateVisualization,
    updateStats,
    selectNode,
    currentMode,
    data
};

// Initialize when DOM is ready (only in browser environment)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // Add a small delay to ensure all resources are loaded
        setTimeout(initApp, 100);
    }
}