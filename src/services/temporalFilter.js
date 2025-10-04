/**
 * Temporal Filter Service
 * Handles event-based temporal filtering for historical data visualization
 *
 * This service allows the application to reconstruct the state of the data
 * at any point in time by replaying events from a timeline.
 */

export class TemporalFilter {
  constructor(baseData) {
    this.baseData = baseData; // Full dataset with timeline
    this.eventCache = new Map(); // date -> reconstructed state
  }

  /**
   * Apply events up to a specific date to reconstruct historical state
   * @param {Date|null} targetDate - Date to reconstruct state for (null = current)
   * @returns {Object} Reconstructed data state
   */
  applyEventsUpTo(targetDate) {
    // Check cache first
    const cacheKey = targetDate?.toISOString() || 'current';
    if (this.eventCache.has(cacheKey)) {
      return this.eventCache.get(cacheKey);
    }

    // Start with current state
    const state = JSON.parse(JSON.stringify(this.baseData.current));

    if (!targetDate) {
      this.eventCache.set(cacheKey, state);
      return state; // Return current if no date specified
    }

    // Get all events before target date, sorted chronologically
    const relevantEvents = (this.baseData.timeline?.events || [])
      .filter(e => new Date(e.date) <= targetDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Apply each event
    relevantEvents.forEach(event => this.applyEvent(state, event));

    // Cache result
    this.eventCache.set(cacheKey, state);
    return state;
  }

  /**
   * Apply a single event to the state
   * @param {Object} state - Current state to modify
   * @param {Object} event - Event to apply
   */
  applyEvent(state, event) {
    switch (event.type) {
      case 'risk_rating_change':
      case 'control_status_change':
      case 'audit_status_change':
      case 'issue_status_change':
        this.applyEntityChange(state, event);
        break;

      case 'control_added':
      case 'issue_added':
      case 'incident_added':
      case 'audit_added':
      case 'risk_added':
      case 'standard_added':
      case 'business_unit_added':
        this.applyEntityAdd(state, event);
        break;

      case 'entity_removed':
        this.applyEntityRemoval(state, event);
        break;

      case 'relationship_added':
        this.applyRelationshipAdd(state, event);
        break;

      case 'relationship_removed':
        this.applyRelationshipRemoval(state, event);
        break;

      default:
        console.warn(`[TemporalFilter] Unknown event type: ${event.type}`);
    }
  }

  /**
   * Apply changes to an existing entity
   * @param {Object} state - Current state
   * @param {Object} event - Change event
   */
  applyEntityChange(state, event) {
    const entityType = this.getEntityArrayName(event.entityType);
    const entityArray = state[entityType];

    if (!entityArray) {
      console.warn(`[TemporalFilter] Entity type not found: ${entityType}`);
      return;
    }

    const entity = entityArray.find(e => e.id === event.id);
    if (entity && event.changes) {
      Object.assign(entity, event.changes);
    } else if (!entity) {
      console.warn(`[TemporalFilter] Entity not found: ${event.id} in ${entityType}`);
    }
  }

  /**
   * Add a new entity to the state
   * @param {Object} state - Current state
   * @param {Object} event - Add event
   */
  applyEntityAdd(state, event) {
    const entityType = this.getEntityArrayName(event.entityType);

    if (!state[entityType]) {
      state[entityType] = [];
    }

    // Check if already exists
    if (!state[entityType].some(e => e.id === event.id)) {
      state[entityType].push(event.data);
    }
  }

  /**
   * Remove an entity from the state
   * @param {Object} state - Current state
   * @param {Object} event - Removal event
   */
  applyEntityRemoval(state, event) {
    const entityType = this.getEntityArrayName(event.entityType);

    if (!state[entityType]) {
      return;
    }

    // Remove entity
    state[entityType] = state[entityType].filter(e => e.id !== event.id);

    // Also remove related relationships
    if (state.relationships) {
      state.relationships = state.relationships.filter(rel =>
        rel.source !== event.id && rel.target !== event.id
      );
    }
  }

  /**
   * Add a relationship between entities
   * @param {Object} state - Current state
   * @param {Object} event - Relationship add event
   */
  applyRelationshipAdd(state, event) {
    if (!state.relationships) {
      state.relationships = [];
    }

    // Check if relationship already exists
    const exists = state.relationships.some(rel =>
      rel.source === event.relationship.source &&
      rel.target === event.relationship.target &&
      rel.type === event.relationship.type
    );

    if (!exists) {
      state.relationships.push(event.relationship);
    }
  }

  /**
   * Remove a relationship between entities
   * @param {Object} state - Current state
   * @param {Object} event - Relationship removal event
   */
  applyRelationshipRemoval(state, event) {
    if (!state.relationships) {
      return;
    }

    state.relationships = state.relationships.filter(rel =>
      !(rel.source === event.relationship.source &&
        rel.target === event.relationship.target &&
        rel.type === event.relationship.type)
    );
  }

  /**
   * Get the correct property name for entity array
   * Handles singular vs plural forms
   * @param {string} entityType - Entity type (singular)
   * @returns {string} Array property name
   */
  getEntityArrayName(entityType) {
    const mapping = {
      'risk': 'risks',
      'control': 'controls',
      'issue': 'issues',
      'incident': 'incidents',
      'audit': 'audits',
      'standard': 'standards',
      'businessUnit': 'businessUnits',
      'entity': 'entities'
    };

    return mapping[entityType] || entityType + 's';
  }

  /**
   * Get list of available snapshot dates
   * @returns {Array} Array of snapshot objects
   */
  getSnapshotDates() {
    return this.baseData.timeline?.snapshots || [];
  }

  /**
   * Get all events in the timeline
   * @returns {Array} Array of events
   */
  getAllEvents() {
    return this.baseData.timeline?.events || [];
  }

  /**
   * Get events within a date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {Array} Filtered events
   */
  getEventsInRange(startDate, endDate) {
    return this.getAllEvents().filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  /**
   * Clear the cache (call when base data changes)
   */
  clearCache() {
    this.eventCache.clear();
  }

  /**
   * Get cache statistics for debugging
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.eventCache.size,
      keys: Array.from(this.eventCache.keys())
    };
  }

  /**
   * Validate that the timeline data is well-formed
   * @returns {Object} Validation result with any errors/warnings
   */
  validateTimeline() {
    const errors = [];
    const warnings = [];

    if (!this.baseData.timeline) {
      warnings.push('No timeline data present');
      return { valid: true, errors, warnings };
    }

    const events = this.baseData.timeline.events || [];

    // Check for events with missing required fields
    events.forEach((event, index) => {
      if (!event.date) {
        errors.push(`Event ${index}: Missing date`);
      }
      if (!event.type) {
        errors.push(`Event ${index}: Missing type`);
      }
      if (!event.id && !event.relationship) {
        errors.push(`Event ${index}: Missing id or relationship`);
      }
    });

    // Check for chronological order
    for (let i = 1; i < events.length; i++) {
      if (new Date(events[i].date) < new Date(events[i - 1].date)) {
        warnings.push(`Events not in chronological order at index ${i}`);
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      eventCount: events.length
    };
  }
}

/**
 * Validate that data is in correct format
 * @param {Object} data - Data object to check
 * @returns {Object} Validation result with errors
 */
export function validateDataFormat(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { valid: false, errors };
  }

  if (!data.current || typeof data.current !== 'object') {
    errors.push('Data must have a "current" object containing current state');
    return { valid: false, errors };
  }

  if (!data.timeline || typeof data.timeline !== 'object') {
    errors.push('Data must have a "timeline" object');
    return { valid: false, errors };
  }

  if (!Array.isArray(data.timeline.events)) {
    errors.push('Timeline must have an "events" array');
  }

  if (!Array.isArray(data.timeline.snapshots)) {
    errors.push('Timeline must have a "snapshots" array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
