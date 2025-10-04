# Temporal Filter Implementation Plan (Option B: Event-Based)

## Executive Summary

This document outlines the implementation plan for integrating event-based temporal filtering into AuditVerse. The snapshot date will be applied as a composable filter that works seamlessly with all existing filters (business units, risk thresholds, audits, etc.).

---

## Current Filter Architecture Analysis

### Filter Types & Locations

| Filter Type | Current Location | Applied To | State Variable |
|-------------|-----------------|------------|----------------|
| **Entity Layers** | `updateVisualization()` L407-753 | D3 graph only | `activeFilters` Set |
| **Audits** | `getFilteredData()` L1719-1724 | Export, Stats | `selectedAudits` Set |
| **Business Units** | `calculateFilteredCoverage()` L1073-1084 | Stats only | `selectedUnits` Set |
| **Standards** | `calculateFilteredCoverage()` L1087-1098 | Stats only | `selectedStandards` Set |
| **Risk Types** | `calculateFilteredCoverage()` L1068-1070 | Stats only | `selectedRiskTypes` Set |
| **Risk Threshold** | Event listener L1896-1913 | D3 graph (visual opacity) | `currentRiskThreshold` number |
| **Link Strength** | Event listener L1916-1930 | D3 graph (visual display) | `currentLinkStrength` number |
| **Preset Views** | `applyPresetView()` L1426-1489 | Custom filtering | `currentPresetView` string |
| **Timeline** | `handleSnapshotChange()` L2015-2035 | **Mutates `data` directly** ⚠️ | `timelinePlayer` object |

### Current Problems

1. **Inconsistent application**: Some filters affect stats, some affect graph, some both
2. **Timeline mutates data**: Breaks all other filters when timeline changes
3. **No unified pipeline**: Filters scattered across 5+ functions
4. **Preset views bypass filters**: They work independently, not composably
5. **Export inconsistency**: `getFilteredData()` doesn't include all active filters

---

## Proposed Solution: Unified Filter Pipeline

### Filter Application Order (from most fundamental to most specific)

```
1. TEMPORAL FILTER (snapshot date)
   ↓ Creates base dataset for specific point in time
2. DATA FILTERS (audits, units, standards, risk types)
   ↓ Filters entities based on selections
3. PRESET VIEW FILTER
   ↓ Applies specialized business logic
4. ENTITY LAYER FILTER (risks, controls, issues, etc.)
   ↓ Shows/hides entity types
5. VISUAL FILTERS (risk threshold, link strength)
   ↓ Dims/hides elements without removing from data
```

### New Data Structure

**Current format (in uploaded JSON):**
```json
{
  "risks": [...],
  "controls": [...],
  "audits": [...],
  "relationships": [...]
}
```

**Proposed format (single unified JSON):**
```json
{
  "current": {
    "risks": [...],
    "controls": [...],
    "audits": [...],
    "relationships": [...]
  },

  "timeline": {
    "events": [
      {
        "date": "2024-01-15",
        "type": "risk_rating_change",
        "entityType": "risk",
        "id": "RISK-001",
        "changes": { "residual_rating": 9 }
      },
      {
        "date": "2024-02-01",
        "type": "control_added",
        "entityType": "control",
        "id": "CTRL-042",
        "data": {
          "name": "MFA Implementation",
          "status": "active",
          "effectiveness_score": 85
        }
      },
      {
        "date": "2024-02-10",
        "type": "entity_removed",
        "entityType": "issue",
        "id": "ISS-015",
        "reason": "resolved"
      },
      {
        "date": "2024-03-01",
        "type": "relationship_added",
        "relationship": {
          "source": "RISK-001",
          "target": "CTRL-042",
          "type": "mitigated_by"
        }
      }
    ],
    "snapshots": [
      { "date": "2024-01-01", "label": "Q1 2024 Start" },
      { "date": "2024-04-01", "label": "Q2 2024 Start" },
      { "date": "2024-07-01", "label": "Q3 2024 Start" }
    ]
  },

  "metadata": {
    "exportDate": "2025-01-03",
    "version": "1.0",
    "organization": "Acme Corp"
  }
}
```

### Event Types Supported

- `risk_rating_change` - Changes to risk ratings (inherent/residual)
- `control_status_change` - Changes to control status/effectiveness
- `audit_status_change` - Audit completion/status updates
- `issue_status_change` - Issue open/close/severity changes
- `control_added` - New control implemented
- `issue_added` - New issue identified
- `incident_added` - New incident occurred
- `audit_added` - New audit performed
- `entity_removed` - Entity removed (issue resolved, control retired, etc.)
- `relationship_added` - New relationship between entities
- `relationship_removed` - Relationship removed

---

## Implementation Plan

### Phase 1: Create Temporal Filter Foundation (Low Risk)

**Objective**: Create isolated temporal filtering service without touching existing code

**Files to create/modify:**
- `src/services/temporalFilter.js` (NEW - 200 lines)
- `src/js/main.js` (add state variables L24-25, modify data loading L211-288)

**Key functions:**
- `TemporalFilter.applyEventsUpTo(targetDate)` - Reconstruct state at specific date
- `TemporalFilter.applyEvent(state, event)` - Apply single event to state
- Event handlers for each event type (add, remove, change)
- Event cache for performance optimization

**Testing checkpoints:**
- Load old format data → still works
- Load new format data with timeline → temporal filter initializes
- Call `applyEventsUpTo(date)` → returns correct reconstructed state

---

### Phase 2: Create Unified Filter Pipeline (Medium Risk)

**Objective**: Centralize all filter logic in one place

**Files to modify:**
- `src/js/main.js` - Replace `getFilteredData()` (L1677-1770)
- `src/js/main.js` - Add `applyAllFilters()` helper function
- `src/js/main.js` - Add `getFilteredDataForVisualization()` helper function

**Key changes:**
- Temporal filter applied first (if snapshot date selected)
- All other filters applied to temporally-filtered data
- Single source of truth for filtered data
- Export includes full filter state in metadata

**Testing checkpoints:**
- Export with no filters → full current dataset
- Export with snapshot date → data as of that date
- Export with snapshot + unit filter → both filters applied
- Verify metadata includes all active filter states

---

### Phase 3: Update Visualization & Stats (Medium Risk)

**Objective**: Make D3 graph and stats use unified filtered data

**Files to modify:**
- `src/js/main.js` - `updateVisualization()` (L407-753)
- `src/js/main.js` - `calculateFilteredCoverage()` (L1038-1159)
- `src/js/main.js` - `updateStats()` (L1004-1035)

**Key changes:**
- Replace direct `data` references with `getFilteredDataForVisualization()`
- Stats calculated from filtered data (respects temporal filter)
- Coverage calculation includes temporal state

**Testing checkpoints:**
- Select snapshot date → graph updates to show historical state
- Select unit filter → graph shows only that unit
- Select snapshot + unit → both filters applied to graph
- Stats panel updates correctly with all filter combinations
- Coverage percentage reflects filtered view

---

### Phase 4: Integrate Timeline with Filter System (Low Risk)

**Objective**: Make timeline player set filter state instead of mutating data

**Files to modify:**
- `src/js/main.js` - `handleSnapshotChange()` (L2015-2035)
- `src/js/main.js` - `setupTimelineControls()` (L1951-2013)
- `src/services/timelinePlayer.js` - Simplify (remove data mutation logic)

**Key changes:**
- Timeline sets `currentSnapshotDate` state variable
- Timeline no longer mutates `data` object
- Reset button clears `currentSnapshotDate` (returns to current view)
- Timeline display shows current filter state

**Testing checkpoints:**
- Play timeline → graph updates at each snapshot
- Pause timeline → graph holds at current snapshot
- Reset timeline → returns to current/latest view
- Timeline + other filters work together
- Slider allows manual navigation through snapshots

---

### Phase 5: Update Preset Views Integration (Low Risk)

**Objective**: Make preset views work with temporal filter

**Files to modify:**
- `src/js/main.js` - `applyPresetViewFilter()` (L1426-1489)
- `src/services/presetViews.js` - Update documentation

**Key changes:**
- Preset views receive temporally-filtered data as input
- "Default" preset also resets timeline to current
- Preset view filters compose with temporal filter

**Testing checkpoints:**
- Select "High Residual Risk" preset → shows current data
- Select snapshot then preset → shows preset applied to historical data
- Select preset then snapshot → shows temporal filtering of preset view
- Reset preset → clears all filters including timeline

---

## Benefits of This Approach

1. ✅ **Temporal filter is composable** - Works with all other filters
2. ✅ **Single source of truth** - One function for all filtering
3. ✅ **Export includes timeline state** - Export captures exact view including snapshot date
4. ✅ **Preset views work with timeline** - Can view "Uncontrolled Risks in Q1 2024"
5. ✅ **Performance optimized** - Temporal filter caches reconstructed states
6. ✅ **Clean separation** - Temporal logic isolated from business logic
7. ✅ **Backward compatible** - Old data format still works
8. ✅ **No duplicate data** - Events are deltas, not full snapshots
9. ✅ **Easy to extend** - Add new event types easily
10. ✅ **Audit trail** - Timeline events serve as change log

---

## Testing Strategy

### Unit Tests
1. **TemporalFilter.applyEventsUpTo()** - Verify state reconstruction
2. **Event handlers** - Test each event type individually
3. **applyAllFilters()** - Test filter composition
4. **Cache invalidation** - Verify cache clears appropriately

### Integration Tests
1. **Timeline alone**: Select snapshot → verify graph updates
2. **Timeline + unit filter**: Select Q1 + Manufacturing → verify both apply
3. **Timeline + risk type**: Select Q2 + Operational risks → verify composition
4. **Timeline + preset**: Select Q3 + "High Residual Risk" → verify both work
5. **Export with timeline**: Export with snapshot active → verify metadata
6. **Stats with timeline**: Verify coverage/totals update when timeline changes
7. **Reset functionality**: Click reset → verify returns to current view

### User Acceptance Tests
1. Load old format data → Everything works as before
2. Load new format data → Timeline controls appear and work
3. Play through timeline → Smooth animation, correct data at each step
4. Combine all filters → Graph shows correct filtered view
5. Export filtered view → JSON contains correct metadata
6. Share exported file → Recipient can load and see same view

---

## Migration Path for Users

### Old Format (Still Works)
```json
{
  "risks": [...],
  "controls": [...],
  "relationships": [...]
}
```

**Behavior**: Loads as current-only view, no timeline available

### New Format (With Timeline)
```json
{
  "current": {
    "risks": [...],
    "controls": [...],
    "relationships": [...]
  },
  "timeline": {
    "events": [...]
  }
}
```

**Behavior**: Loads with timeline controls, can navigate through history

### Hybrid Approach
Users can start with old format and gradually add timeline events as they collect historical data. The system gracefully handles both formats.

---

## Performance Considerations

### Caching Strategy
- **Event cache**: Map of `date → reconstructed state`
- **Cache invalidation**: Clear when base data changes
- **Memory usage**: ~50KB per cached snapshot (acceptable for 12-20 snapshots)

### Optimization Opportunities
1. **Lazy reconstruction**: Only reconstruct when snapshot date changes
2. **Incremental updates**: Cache intermediate states at snapshot dates
3. **Event batching**: Group events by date for faster processing
4. **Relationship indexing**: Pre-compute relationship lookups

### Expected Performance
- **Initial load**: <100ms for data with timeline
- **Snapshot navigation**: <50ms (cached) or <200ms (uncached)
- **Filter changes**: <50ms (same as current)
- **Export**: <200ms including metadata generation

---

## File Changes Summary

| File | Changes | Lines Added | Lines Modified | Risk Level |
|------|---------|-------------|----------------|------------|
| `src/services/temporalFilter.js` | **NEW** | ~200 | 0 | Low (isolated) |
| `src/js/main.js` | Modified | ~100 | ~150 | Medium |
| `src/services/timelinePlayer.js` | Simplified | 0 | ~50 | Low |
| Total | | ~300 | ~200 | Medium |

---

## Success Criteria

1. ✅ All existing filters continue to work unchanged
2. ✅ Timeline can be used alone or with any combination of filters
3. ✅ Export includes full filter state (including snapshot date)
4. ✅ Stats and coverage calculations respect all filters
5. ✅ Data format validation provides clear error messages
6. ✅ Performance remains acceptable (<200ms for any operation)
7. ✅ No data corruption or loss during temporal navigation
8. ✅ Reset button returns to clean current state
9. ✅ Preset views work with temporal filter
10. ✅ Code is maintainable and well-documented

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing filters | Medium | High | Implement in phases, test thoroughly |
| Performance degradation | Low | Medium | Cache aggressively, profile performance |
| Data format confusion | Low | Medium | Strict validation, clear error messages |
| Timeline/filter conflicts | Low | High | Clear filter precedence, comprehensive tests |
| Cache memory issues | Low | Low | Implement cache size limits |

---

## Future Enhancements

1. **Event editor**: UI to add/edit timeline events
2. **Comparison view**: Side-by-side comparison of two snapshots
3. **Event annotations**: Add notes/context to timeline events
4. **Auto-snapshot**: Generate snapshots from event stream
5. **Delta visualization**: Highlight what changed between snapshots
6. **Event import**: Import events from audit logs/external systems
7. **Bookmark states**: Save specific filter + timeline combinations

---

## References

- Original discussion: Temporal filtering requirement
- Related docs:
  - [preset-views-specification.md](preset-views-specification.md)
  - [timeline-playback-guide.md](timeline-playback-guide.md)
  - [timeline-fix-summary.md](timeline-fix-summary.md)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-03
**Status**: Ready for Implementation
