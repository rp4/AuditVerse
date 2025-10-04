# AuditVerse Preset Views Specification

## Overview
This document outlines preset views designed to help internal auditors perform comprehensive risk assessments at both enterprise and business unit levels. These views are categorized by audit objectives and provide quick access to critical risk insights.

## 1. Risk Coverage Views
Views focused on identifying gaps in risk coverage and audit activities.

### 1.1 Unaudited Risks
**Purpose**: Identify risks that have never been audited or lack recent audit coverage
**Filter Logic**:
- Show all risks where no audit relationship exists
- Or audits are older than specified timeframe (e.g., 12 months)
**Use Case**: Annual audit planning, identifying coverage gaps
**Priority**: HIGH

### 1.2 Uncontrolled Risks
**Purpose**: Highlight risks without any mitigating controls
**Filter Logic**:
- Show risks with no control relationships
- Sort by residual risk rating (highest first)
**Use Case**: Immediate risk exposure assessment
**Priority**: CRITICAL

### 1.3 Unmonitored Standards
**Purpose**: Identify compliance standards without audit coverage
**Filter Logic**:
- Show standards with no audit relationships
- Group by regulatory importance
**Use Case**: Compliance risk assessment
**Priority**: HIGH

### 1.4 Audit Blind Spots
**Purpose**: Show business units without any audit activity
**Filter Logic**:
- Show business units/entities with no audit relationships
- Include units with risks but no audits
**Use Case**: Audit universe coverage planning
**Priority**: HIGH

## 2. Risk Hotspot Views
Views to identify areas of concentrated risk and issues.

### 2.1 High Issue Risks
**Purpose**: Identify risks with the most associated issues
**Filter Logic**:
- Count issues per risk
- Sort by issue count (descending)
- Show top 10-20 risks
**Use Case**: Problem area identification
**Priority**: HIGH

### 2.2 High Incident Risks
**Purpose**: Show risks with the most incidents (proven problems)
**Filter Logic**:
- Count incidents per risk
- Sort by incident count and severity
- Highlight recurring incidents
**Use Case**: Evidence-based risk prioritization
**Priority**: HIGH

### 2.3 Problem Business Units
**Purpose**: Identify business units with most issues and incidents
**Filter Logic**:
- Aggregate issues + incidents by business unit
- Weight by severity
- Show trend if temporal data available
**Use Case**: Resource allocation, targeted reviews
**Priority**: MEDIUM

### 2.4 Failed Controls
**Purpose**: Identify controls with effectiveness issues
**Filter Logic**:
- Show controls with associated issues
- Controls where residual risk remains high
- Sort by failure frequency
**Use Case**: Control effectiveness assessment
**Priority**: MEDIUM

## 3. Audit Planning Views
Views to support strategic audit planning and resource allocation.

### 3.1 High Residual Risk
**Purpose**: Focus on risks that remain high after controls
**Filter Logic**:
- Filter risks where residual_rating >= 7
- Sort by residual rating
- Show control effectiveness (inherent - residual)
**Use Case**: Priority audit areas
**Priority**: CRITICAL

### 3.2 Coverage Gaps
**Purpose**: Entities with risks but no recent audits
**Filter Logic**:
- Show entities with risk relationships
- Filter where no audit in last 12 months
- Weight by risk severity
**Use Case**: Audit schedule optimization
**Priority**: HIGH

### 3.3 Stale Audits
**Purpose**: Risks/units not audited recently
**Filter Logic**:
- Show items with audits older than threshold
- Default threshold: 12 months
- Configurable by risk level
**Use Case**: Audit refresh planning
**Priority**: MEDIUM

### 3.4 Cross-Unit Risks
**Purpose**: Risks affecting multiple business units
**Filter Logic**:
- Count business unit relationships per risk
- Show risks affecting 2+ units
- Sort by unit count
**Use Case**: Enterprise-wide risk assessment
**Priority**: MEDIUM

## 4. Compliance Views
Views focused on regulatory and compliance requirements.

### 4.1 Standard Violations
**Purpose**: Standards with most non-compliance issues
**Filter Logic**:
- Count issues linked to standards
- Filter by compliance type
- Show remediation status if available
**Use Case**: Compliance monitoring
**Priority**: HIGH

### 4.2 Regulatory Exposure
**Purpose**: High-severity risks in regulated areas
**Filter Logic**:
- Filter risks linked to regulatory standards
- Show only high/critical severity
- Group by regulation type
**Use Case**: Regulatory risk assessment
**Priority**: HIGH

### 4.3 Control Effectiveness
**Purpose**: Compare inherent vs residual ratings
**Filter Logic**:
- Calculate effectiveness: (inherent - residual) / inherent
- Show controls ranked by effectiveness
- Highlight negative effectiveness
**Use Case**: Control performance review
**Priority**: MEDIUM

## 5. Executive Dashboard Views
High-level views for executive reporting and oversight.

### 5.1 Enterprise Risk Profile
**Purpose**: Top risks by residual rating
**Filter Logic**:
- Show top 10 risks by residual rating
- Include trend indicators
- Show control coverage percentage
**Use Case**: Board reporting, executive briefings
**Priority**: HIGH

### 5.2 Audit Universe Coverage
**Purpose**: Overall coverage metrics
**Filter Logic**:
- Calculate % of risks audited
- Calculate % of units audited
- Calculate % of standards audited
- Show as dashboard metrics
**Use Case**: Audit committee reporting
**Priority**: HIGH

### 5.3 Emerging Risks
**Purpose**: New risks without established controls
**Filter Logic**:
- Filter recently added risks (by date if available)
- Show risks with no/few controls
- High inherent rating
**Use Case**: Forward-looking risk assessment
**Priority**: MEDIUM

## 6. Implementation Recommendations

### Quick Implementation (Phase 1)
1. Uncontrolled Risks
2. Unaudited Risks
3. High Residual Risk
4. Enterprise Risk Profile

### Standard Implementation (Phase 2)
1. High Issue Risks
2. High Incident Risks
3. Audit Universe Coverage
4. Standard Violations

### Advanced Implementation (Phase 3)
1. Cross-Unit Risks
2. Control Effectiveness
3. Emerging Risks
4. Problem Business Units

## 7. Technical Implementation Notes

### Data Requirements
- Relationships between risks, controls, audits, standards, and business units
- Temporal data for audit dates (if available)
- Issue and incident counts and severity
- Inherent and residual risk ratings

### Filter Combinations
Each preset view should:
- Be combinable with existing filters
- Allow export of filtered results
- Update visualization in real-time
- Show count of matching entities

### User Interface
- Dropdown menu or button panel for preset selection
- Clear indication of active preset
- Ability to modify preset filters after selection
- Save custom filter combinations as new presets

## 8. Sample Queries for Each View

### Unaudited Risks Query Logic
```javascript
const unauditedRisks = risks.filter(risk => {
  const hasAudit = relationships.some(rel =>
    (rel.source === risk.id || rel.target === risk.id) &&
    audits.some(audit => audit.id === rel.source || audit.id === rel.target)
  );
  return !hasAudit;
});
```

### Uncontrolled Risks Query Logic
```javascript
const uncontrolledRisks = risks.filter(risk => {
  const hasControl = relationships.some(rel =>
    rel.source === risk.id &&
    controls.some(control => control.id === rel.target)
  );
  return !hasControl;
});
```

### High Issue Risks Query Logic
```javascript
const riskIssueCounts = risks.map(risk => {
  const issueCount = relationships.filter(rel =>
    rel.source === risk.id &&
    issues.some(issue => issue.id === rel.target)
  ).length;
  return { ...risk, issueCount };
}).sort((a, b) => b.issueCount - a.issueCount);
```

## 9. Data Structure Requirements

### Current Structure Compatibility

The existing AuditVerse data structure supports approximately 80% of the preset views without modification. The current structure includes:

#### Existing Entities
- **Risks**: id, name, category, inherent_rating, residual_rating, inherent_likelihood, residual_likelihood, inherent_severity, residual_severity
- **Controls**: id, name, description
- **Issues**: id, name, status
- **Incidents**: id, name, description
- **Business Units/Entities**: id, name, type
- **Standards**: id, name, framework
- **Audits**: id, name, scope
- **Relationships**: source, target, type (connecting all entities)

#### Views That Work with Current Structure ✅
1. **Unaudited Risks** - Can identify risks without audit relationships
2. **Uncontrolled Risks** - Can find risks without control relationships
3. **Unmonitored Standards** - Can identify standards without audit coverage
4. **Audit Blind Spots** - Can find business units without audits
5. **High Issue Risks** - Can count issue relationships per risk
6. **High Incident Risks** - Can count incident relationships per risk
7. **Problem Business Units** - Can aggregate issues/incidents by unit
8. **High Residual Risk** - Uses existing residual_rating field
9. **Enterprise Risk Profile** - Uses existing risk ratings
10. **Cross-Unit Risks** - Can identify risks connected to multiple units
11. **Audit Universe Coverage** - Can calculate coverage percentages

### Required Enhancements for Full Functionality

To support all preset views with complete functionality, the following optional fields should be added:

#### 1. Temporal Data Fields
Essential for time-based filtering and stale audit detection:

```javascript
// Audits - for time-based views
"audits": [{
  "id": "A1",
  "name": "Q3 Security Audit",
  "date_performed": "2024-03-15",      // NEW: ISO date format
  "next_review": "2025-03-15",         // NEW: Planned next audit
  "frequency": "quarterly"             // NEW: annual|quarterly|monthly|adhoc
}]

// Issues - for trending
"issues": [{
  "id": "I1",
  "name": "Weak Password Policy",
  "date_identified": "2024-01-10",     // NEW: When issue was found
  "date_resolved": "2024-02-15",       // NEW: When issue was closed
  "status": "closed"
}]

// Incidents - for pattern analysis
"incidents": [{
  "id": "INC1",
  "name": "Data Breach Attempt",
  "date_occurred": "2024-01-05",       // NEW: Incident date
  "date_detected": "2024-01-06"        // NEW: Detection date
}]
```

#### 2. Severity and Priority Fields
Essential for weighted analysis and prioritization:

```javascript
// Issues - for severity-based filtering
"issues": [{
  "id": "I1",
  "name": "Weak Password Policy",
  "severity": "high",                  // NEW: critical|high|medium|low
  "priority": 1                        // NEW: numeric priority
}]

// Incidents - for impact assessment
"incidents": [{
  "id": "INC1",
  "name": "Data Breach Attempt",
  "severity": "critical",              // NEW: critical|high|medium|low
  "impact": "high",                    // NEW: actual business impact
  "recovery_time": 4.5                 // NEW: hours to recover
}]
```

#### 3. Control Effectiveness Metrics
Essential for control performance views:

```javascript
"controls": [{
  "id": "C1",
  "name": "Access Control Policy",
  "effectiveness_score": 0.75,         // NEW: 0-1 scale
  "implementation_status": "full",     // NEW: full|partial|planned|none
  "last_tested": "2024-01-15",        // NEW: Last test date
  "test_result": "effective",         // NEW: effective|partial|ineffective
  "automation_level": "manual"        // NEW: automated|semi-automated|manual
}]
```

#### 4. Enhanced Relationship Attributes
For more sophisticated filtering and analysis:

```javascript
"relationships": [{
  "source": "R1",
  "target": "C1",
  "type": "mitigated_by",
  "strength": 0.8,                    // NEW: Relationship strength (0-1)
  "confidence": 0.9,                  // NEW: Confidence level (0-1)
  "created_date": "2023-01-01",       // NEW: When relationship established
  "validated_date": "2024-01-01",     // NEW: Last validation
  "notes": "Primary control"          // NEW: Additional context
}]
```

#### 5. Risk Metadata
For emerging risk and trend analysis:

```javascript
"risks": [{
  "id": "R1",
  "name": "Data Breach Risk",
  "created_date": "2023-01-01",       // NEW: For emerging risk detection
  "last_reviewed": "2024-01-01",      // NEW: Last risk assessment date
  "trend": "increasing",               // NEW: increasing|stable|decreasing
  "velocity": "fast",                  // NEW: fast|medium|slow
  "owner": "IT Security Team",         // NEW: Risk owner
  "regulatory": true                   // NEW: Subject to regulations
}]
```

### Implementation Strategy

#### Phase 1: Data Migration
For existing installations, provide:
- Data enrichment tools
- Bulk update capabilities

#### Phase 2: Import/Export Updates
- Update denormalized export to include new fields
- Update import to handle optional fields
- Maintain backward compatibility

### Data Structure Validation

```javascript
// Validation function for enhanced data
function validateEnhancedData(data) {
  const warnings = [];

  // Check for temporal data
  if (data.audits?.some(a => !a.date_performed)) {
    warnings.push("Audits missing dates - time-based views limited");
  }

  // Check for severity data
  if (data.issues?.some(i => !i.severity)) {
    warnings.push("Issues missing severity - weighted analysis limited");
  }

  // Check for control effectiveness
  if (data.controls?.some(c => !c.effectiveness_score)) {
    warnings.push("Controls missing effectiveness - performance views limited");
  }

  return warnings;
}
```

### Benefits of Enhanced Structure

1. **Time-based Analysis**: Track audit cycles, issue aging, incident patterns
2. **Prioritization**: Focus on high-severity items first
3. **Effectiveness Measurement**: Quantify control performance
4. **Trend Analysis**: Identify improving/deteriorating areas
5. **Compliance Tracking**: Monitor regulatory requirements
6. **Resource Optimization**: Data-driven audit planning

### Minimal Viable Enhancement

If only one enhancement can be made, prioritize adding **date fields** to audits:

```javascript
"audits": [{
  "date_performed": "2024-03-15"  // Minimum required for time-based views
}]
```

This single addition enables:
- Stale audit detection
- Coverage gap analysis
- Audit frequency tracking
- Compliance monitoring

## 10. Success Metrics

### Coverage Metrics
- % reduction in unaudited risks
- % reduction in uncontrolled risks
- Audit cycle time improvement

### Risk Metrics
- Average residual risk reduction
- Issue resolution time
- Incident frequency reduction

### Efficiency Metrics
- Time to identify risk hotspots
- Audit planning time reduction
- Report generation time savings

## 10. Future Enhancements

### Advanced Analytics
- Predictive risk scoring based on patterns
- Automated risk correlation analysis
- Control effectiveness trending

### Integration Capabilities
- Real-time data feeds from GRC systems
- Automated audit scheduling based on risk scores
- Integration with issue tracking systems

### Machine Learning Applications
- Anomaly detection in risk patterns
- Predictive control failure analysis
- Optimal audit resource allocation

---

*Document Version: 1.1*
*Last Updated: 2024*
*Target Users: Internal Auditors, Risk Managers, Audit Committees*
*Change Log: v1.1 - Added comprehensive Data Structure Requirements section detailing current compatibility and required enhancements*