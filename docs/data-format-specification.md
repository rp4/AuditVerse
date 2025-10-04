# AuditVerse Data Format Specification

## Overview

AuditVerse requires data to be in a specific JSON format that supports temporal filtering through event-based history tracking. This document specifies the required structure.

**Version**: 1.0
**Last Updated**: 2025-01-03
**Status**: Required for all data uploads

---

## Data Structure

### Top-Level Structure

```json
{
  "current": { /* Current state */ },
  "timeline": { /* Historical events */ },
  "metadata": { /* Optional metadata */ }
}
```

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current` | Object | ✅ Yes | Current state of all entities and relationships |
| `timeline` | Object | ✅ Yes | Timeline data with events and snapshots |
| `metadata` | Object | ⚪ Optional | Additional metadata about the dataset |

---

## Current State Object

The `current` object contains the latest state of all entities in your audit universe.

### Structure

```json
{
  "current": {
    "risks": [...],
    "controls": [...],
    "issues": [...],
    "incidents": [...],
    "audits": [...],
    "standards": [...],
    "businessUnits": [...],
    "relationships": [...]
  }
}
```

### Entity Arrays

| Array | Type | Required | Description |
|-------|------|----------|-------------|
| `risks` | Array | ✅ Yes | Risk entities |
| `controls` | Array | ⚪ Optional | Control entities |
| `issues` | Array | ⚪ Optional | Issue/finding entities |
| `incidents` | Array | ⚪ Optional | Incident entities |
| `audits` | Array | ⚪ Optional | Audit entities |
| `standards` | Array | ⚪ Optional | Standard/regulation entities |
| `businessUnits` | Array | ⚪ Optional | Business unit/entity entities |
| `relationships` | Array | ✅ Yes | Relationships between entities |

### Risk Entity Schema

```json
{
  "id": "RISK-001",
  "name": "Data Breach Risk",
  "category": "Cybersecurity",
  "inherent_likelihood": 8,
  "inherent_severity": 9,
  "inherent_rating": 72,
  "residual_likelihood": 4,
  "residual_severity": 6,
  "residual_rating": 24,
  "description": "Risk of unauthorized data access"
}
```

### Relationship Schema

```json
{
  "source": "RISK-001",
  "target": "CTRL-042",
  "type": "mitigated_by"
}
```

**Common relationship types:**
- `mitigated_by` - Risk → Control
- `assessed_by` - Risk → Audit
- `owned_by` - Risk → Business Unit
- `requires` - Risk → Standard
- `causes` - Risk → Issue
- `realized_in` - Risk → Incident

---

## Timeline Object

The `timeline` object contains historical events and snapshot definitions.

### Structure

```json
{
  "timeline": {
    "events": [...],
    "snapshots": [...]
  }
}
```

### Required Timeline Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `events` | Array | ✅ Yes | Array of events (can be empty) |
| `snapshots` | Array | ✅ Yes | Array of snapshot definitions (can be empty) |

---

## Events Array

Events describe changes over time using delta encoding.

### Event Schema

```json
{
  "date": "2024-01-15T10:00:00Z",
  "type": "risk_rating_change",
  "entityType": "risk",
  "id": "RISK-001",
  "changes": {
    "residual_rating": 18,
    "residual_likelihood": 3
  }
}
```

### Event Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | String (ISO 8601) | ✅ Yes | When the event occurred |
| `type` | String | ✅ Yes | Type of event (see event types below) |
| `entityType` | String | For most events | Entity type affected |
| `id` | String | For entity events | ID of affected entity |
| `changes` | Object | For change events | Fields that changed |
| `data` | Object | For add events | Complete new entity data |
| `relationship` | Object | For relationship events | Relationship being added/removed |

### Supported Event Types

#### Entity Change Events
- `risk_rating_change` - Changes to risk ratings
- `control_status_change` - Changes to control status/effectiveness
- `audit_status_change` - Audit status updates
- `issue_status_change` - Issue status changes

**Example:**
```json
{
  "date": "2024-02-10T14:30:00Z",
  "type": "control_status_change",
  "entityType": "control",
  "id": "CTRL-042",
  "changes": {
    "status": "effective",
    "effectiveness_score": 92
  }
}
```

#### Entity Addition Events
- `risk_added`
- `control_added`
- `issue_added`
- `incident_added`
- `audit_added`
- `standard_added`
- `business_unit_added`

**Example:**
```json
{
  "date": "2024-03-01T09:00:00Z",
  "type": "control_added",
  "entityType": "control",
  "id": "CTRL-099",
  "data": {
    "id": "CTRL-099",
    "name": "Multi-Factor Authentication",
    "status": "active",
    "effectiveness_score": 85
  }
}
```

#### Entity Removal Events
- `entity_removed` - Generic removal (any entity type)

**Example:**
```json
{
  "date": "2024-04-15T16:00:00Z",
  "type": "entity_removed",
  "entityType": "issue",
  "id": "ISS-042",
  "reason": "resolved"
}
```

#### Relationship Events
- `relationship_added` - New relationship created
- `relationship_removed` - Relationship removed

**Example:**
```json
{
  "date": "2024-05-01T11:00:00Z",
  "type": "relationship_added",
  "relationship": {
    "source": "RISK-001",
    "target": "CTRL-099",
    "type": "mitigated_by"
  }
}
```

---

## Snapshots Array

Snapshots define points in time that can be selected in the timeline UI.

### Snapshot Schema

```json
{
  "date": "2024-01-01T00:00:00Z",
  "label": "Q1 2024 Start",
  "summary": "Beginning of Q1 fiscal period"
}
```

### Snapshot Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | String (ISO 8601) | ✅ Yes | Snapshot date/time |
| `label` | String | ✅ Yes | Human-readable label |
| `summary` | String | ⚪ Optional | Description of this snapshot |

---

## Metadata Object

Optional metadata about the dataset.

### Example

```json
{
  "metadata": {
    "exportDate": "2025-01-03T12:00:00Z",
    "version": "1.0",
    "organization": "Acme Corp",
    "description": "Annual audit universe data"
  }
}
```

---

## Complete Example

```json
{
  "current": {
    "risks": [
      {
        "id": "RISK-001",
        "name": "Data Breach",
        "category": "Cybersecurity",
        "inherent_likelihood": 8,
        "inherent_severity": 9,
        "inherent_rating": 72,
        "residual_likelihood": 4,
        "residual_severity": 6,
        "residual_rating": 24
      }
    ],
    "controls": [
      {
        "id": "CTRL-042",
        "name": "Firewall",
        "status": "active",
        "effectiveness_score": 90
      }
    ],
    "audits": [
      {
        "id": "AUD-2024-01",
        "name": "Q1 Security Audit",
        "status": "completed",
        "date_performed": "2024-03-15"
      }
    ],
    "businessUnits": [
      {
        "id": "BU-IT",
        "name": "Information Technology"
      }
    ],
    "standards": [],
    "issues": [],
    "incidents": [],
    "relationships": [
      {
        "source": "RISK-001",
        "target": "CTRL-042",
        "type": "mitigated_by"
      },
      {
        "source": "RISK-001",
        "target": "AUD-2024-01",
        "type": "assessed_by"
      },
      {
        "source": "RISK-001",
        "target": "BU-IT",
        "type": "owned_by"
      }
    ]
  },
  "timeline": {
    "events": [
      {
        "date": "2024-01-15T10:00:00Z",
        "type": "risk_rating_change",
        "entityType": "risk",
        "id": "RISK-001",
        "changes": {
          "residual_rating": 36,
          "residual_likelihood": 6
        }
      },
      {
        "date": "2024-02-01T09:00:00Z",
        "type": "control_added",
        "entityType": "control",
        "id": "CTRL-042",
        "data": {
          "id": "CTRL-042",
          "name": "Firewall",
          "status": "active",
          "effectiveness_score": 85
        }
      },
      {
        "date": "2024-02-15T14:00:00Z",
        "type": "relationship_added",
        "relationship": {
          "source": "RISK-001",
          "target": "CTRL-042",
          "type": "mitigated_by"
        }
      },
      {
        "date": "2024-03-01T10:00:00Z",
        "type": "risk_rating_change",
        "entityType": "risk",
        "id": "RISK-001",
        "changes": {
          "residual_rating": 24,
          "residual_likelihood": 4
        }
      }
    ],
    "snapshots": [
      {
        "date": "2024-01-01T00:00:00Z",
        "label": "Q1 Start",
        "summary": "Beginning of Q1 2024"
      },
      {
        "date": "2024-04-01T00:00:00Z",
        "label": "Q2 Start",
        "summary": "Beginning of Q2 2024"
      }
    ]
  },
  "metadata": {
    "exportDate": "2025-01-03T12:00:00Z",
    "version": "1.0",
    "organization": "Acme Corp"
  }
}
```

---

## Validation

### Required Validations

The application performs the following validations on upload:

1. **Format validation:**
   - Must have `current` object
   - Must have `timeline` object
   - `timeline` must have `events` array
   - `timeline` must have `snapshots` array

2. **Timeline validation:**
   - Events must have valid dates
   - Events must have valid types
   - Entity events must have `id` or `relationship`

3. **Current state validation:**
   - Must have `risks` array
   - Must have `relationships` array (can be empty)

### Error Messages

If validation fails, you'll see clear error messages:

- `"Data must have a 'current' object containing current state"`
- `"Data must have a 'timeline' object"`
- `"Timeline must have an 'events' array"`
- `"Timeline must have a 'snapshots' array"`
- `"Event X: Missing date"`
- `"Event X: Missing type"`

---

## Best Practices

### 1. Event Ordering
Events should be in chronological order for optimal performance:
```json
"events": [
  { "date": "2024-01-01..." },  // Earlier
  { "date": "2024-02-01..." },  // Later
  { "date": "2024-03-01..." }   // Latest
]
```

### 2. Snapshot Dates
Define snapshots at meaningful points:
- Quarter starts
- Fiscal year boundaries
- Major milestones
- Before/after significant events

### 3. Event Granularity
Include events for:
- All significant risk rating changes
- Control implementations
- Audit completions
- Issue resolutions
- New incidents

### 4. Minimal File Size
Use events (delta encoding) rather than full snapshots to minimize file size:
- ✅ Good: 100 events over 12 months = ~10KB
- ❌ Bad: 12 full monthly snapshots = ~120KB

---

## Migration from Old Format

If you have data in the old format (flat structure without timeline), you'll need to convert it:

**Old format (not supported):**
```json
{
  "risks": [...],
  "controls": [...],
  "relationships": [...]
}
```

**New format (required):**
```json
{
  "current": {
    "risks": [...],
    "controls": [...],
    "relationships": [...]
  },
  "timeline": {
    "events": [],
    "snapshots": []
  }
}
```

You can start with empty events/snapshots arrays and add historical data later.

---

## Additional Resources

- **Implementation Plan**: [temporal-filter-implementation-plan.md](temporal-filter-implementation-plan.md)
- **Implementation Summary**: [temporal-filter-implementation-summary.md](temporal-filter-implementation-summary.md)
- **Preset Views**: [preset-views-specification.md](preset-views-specification.md)

---

**Questions?** Check the console logs for detailed validation messages when uploading data.
