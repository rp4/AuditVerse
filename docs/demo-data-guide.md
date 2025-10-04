# Demo Data Guide

## Overview

AuditVerse includes comprehensive demo data based on "The Iron Bank of Braavos" - a fictional global banking institution. The data showcases temporal filtering capabilities with realistic timeline events spanning from Q1 2023 to Q4 2024.

**File**: `public/data/comprehensiveSampleData.json`
**Format**: New event-based format with timeline
**Last Updated**: 2025-01-03

---

## Data Summary

### Current State (as of December 2024)

| Entity Type | Count | Description |
|-------------|-------|-------------|
| **Risks** | 15 | Enterprise risks across Cyber, Compliance, Financial, and Operational categories |
| **Controls** | 13 | Risk mitigation controls with effectiveness scores |
| **Audits** | 10 | Internal and external audits performed |
| **Issues** | 8 | Audit findings and control deficiencies |
| **Incidents** | 5 | Realized risk events |
| **Business Units** | 6 | Banking divisions (Retail, Corporate, Investment, etc.) |
| **Standards** | 5 | Regulatory standards (GDPR, SOX, Basel III, PCI DSS, AML) |
| **Relationships** | 91 | Connections between all entities |

### Timeline Data

| Component | Count | Description |
|-----------|-------|-------------|
| **Events** | 90 | Historical changes from 2021-2024 |
| **Snapshots** | 8 | Quarterly checkpoints (Q1 2023 - Q4 2024) |

---

## Risk Categories

### Cyber Risks (4)
- Digital Banking Platform Breach
- Third-Party Vendor Security
- Insider Data Theft
- Ransomware Attack

### Compliance Risks (3)
- Anti-Money Laundering Compliance
- Data Privacy Violations
- Sanctions Screening Failures

### Financial Risks (4)
- Credit Risk Concentration
- Wire Transfer Fraud
- Market Volatility
- Liquidity Crisis

### Operational Risks (4)
- Core Banking System Availability
- Branch Network Disruption
- Key Person Risk
- Business Continuity

---

## Timeline Events

The demo data includes 90 timeline events showing the evolution of the risk landscape:

### Event Types Included

1. **Risk Rating Changes** (45 events)
   - Initial risk assessments
   - Mid-period updates
   - Final current ratings
   - Shows risk mitigation progress over time

2. **Control Additions** (13 events)
   - Control implementation dates
   - Progressive control rollout from Q2 2023

3. **Audit Status Changes** (10 events)
   - Audit completion dates
   - Status updates

4. **Issue Lifecycle** (16 events)
   - Issue discovery
   - Issue resolution for closed items

5. **Incident Additions** (5 events)
   - Incident occurrence dates
   - Severity classifications

### Timeline Period

```
2021-04-15  First risk assessment (R005 - Core Banking System)
    |
2023-01-01  Q1 2023 - Fiscal year start
    |
2023-06-01  Control implementation begins
    |
2024-01-01  Q1 2024 - New fiscal year
    |
2024-12-10  Latest assessment (current state)
```

---

## Snapshots

The data includes 8 quarterly snapshots for temporal navigation:

| Snapshot | Date | Label | Description |
|----------|------|-------|-------------|
| 1 | 2023-01-01 | Q1 2023 | Beginning of fiscal year 2023 |
| 2 | 2023-04-01 | Q2 2023 | Initial control implementations |
| 3 | 2023-07-01 | Q3 2023 | Mid-year review period |
| 4 | 2023-10-01 | Q4 2023 | End of year assessment |
| 5 | 2024-01-01 | Q1 2024 | Beginning of fiscal year 2024 |
| 6 | 2024-04-01 | Q2 2024 | Spring audit season |
| 7 | 2024-07-01 | Q3 2024 | Mid-year checkpoint |
| 8 | 2024-10-01 | Q4 2024 | Year-end risk assessment |

---

## Example Use Cases

### 1. View Risk Progression Over Time

1. Load demo data
2. Use timeline slider to select Q1 2023
3. Note higher risk ratings
4. Move to Q4 2024
5. See improved ratings after control implementation

**Expected behavior:**
- Early periods show higher residual risk ratings
- Later periods show reduced risk due to controls
- Coverage percentage increases over time

### 2. Track Control Implementation Impact

1. Select Q2 2023 snapshot (before most controls)
2. Note "Uncontrolled Risks" preset view
3. Move to Q4 2024
4. See reduction in uncontrolled risks

### 3. Monitor Audit Coverage Evolution

1. Navigate to Q1 2024
2. Check coverage percentage
3. Move to Q4 2024
4. See increased coverage as audits complete

---

## Key Risks in Demo Data

### High Severity Risks

1. **Digital Banking Platform Breach (R001)**
   - Category: Cyber
   - Inherent: 8.5 → Residual: 6.5
   - Mitigated by: Multi-Factor Authentication, Encryption
   - Shows improvement from Q1 2023 (residual 7.6) to current (6.5)

2. **Anti-Money Laundering Compliance (R002)**
   - Category: Compliance
   - Inherent: 8.0 → Residual: 6.0
   - Regulatory: Yes
   - Timeline shows progressive reduction through Q2-Q4 2024

3. **Credit Risk Concentration (R003)**
   - Category: Financial
   - Inherent: 7.0 → Residual: 6.0
   - Trend: Increasing
   - Demonstrates ongoing monitoring

---

## Controls Showcase

### Effective Controls

1. **Multi-Factor Authentication (C001)**
   - Effectiveness: 95%
   - Status: Active
   - Implemented: June 2023
   - Mitigates: R001, R003

2. **Transaction Monitoring System (C002)**
   - Effectiveness: 92%
   - Status: Active
   - Mitigates: R002, R004

3. **Encryption at Rest (C003)**
   - Effectiveness: 98%
   - Status: Active
   - Mitigates: R001, R007

---

## Audit Examples

### Completed Audits

1. **Q1 2024 Cybersecurity Audit (A001)**
   - Date: 2024-03-15
   - Findings: 3 High, 2 Medium
   - Coverage: R001, R003, R007, R012

2. **Anti-Money Laundering Review (A002)**
   - Date: 2024-04-20
   - Findings: 1 Critical, 1 High
   - Coverage: R002

3. **IT General Controls Assessment (A003)**
   - Date: 2024-05-10
   - Findings: 2 Medium
   - Coverage: R005, R008

---

## Business Units

| ID | Name | Risk Ownership |
|----|------|----------------|
| BU001 | Retail Banking | 4 risks |
| BU002 | Corporate Banking | 3 risks |
| BU003 | Investment Banking | 2 risks |
| BU004 | IT Operations | 5 risks |
| BU005 | Compliance | 1 risk |
| BU006 | Treasury | 2 risks |

---

## Regulatory Standards

The demo includes compliance mapping to:

1. **GDPR** - Data privacy and protection
2. **SOX** - Financial reporting controls
3. **Basel III** - Banking capital requirements
4. **PCI DSS** - Payment card security
5. **AML Regulations** - Anti-money laundering

---

## Conversion Details

The demo data was converted from old format to new format using:

**Script**: `scripts/convert-demo-data.py`

**Conversion process:**
1. Wrapped existing data in `current` object
2. Generated 90 timeline events based on:
   - Risk creation dates
   - Last assessment dates
   - Audit performance dates
   - Issue lifecycle
3. Created 8 quarterly snapshots
4. Preserved all original data integrity

**Backup**: `public/data/comprehensiveSampleData.json.backup`

---

## Testing the Demo Data

### Quick Test

1. Build the project:
   ```bash
   npm run build
   ```

2. Verify data copied:
   ```bash
   ls dist/data/
   # Should show: comprehensiveSampleData.json
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Upload the demo data file
5. Verify:
   - ✅ Timeline controls appear
   - ✅ 8 snapshots available
   - ✅ Can navigate through time
   - ✅ Risk ratings change over time
   - ✅ Coverage % changes by quarter

### Expected Results

**At Q1 2023:**
- Higher risk ratings
- Fewer controls active
- Lower coverage percentage

**At Q4 2024:**
- Reduced risk ratings
- All controls active
- Higher coverage percentage

---

## Customizing Demo Data

To create your own demo data:

1. Use the format specification: [data-format-specification.md](data-format-specification.md)

2. Start with the demo as a template:
   ```bash
   cp public/data/comprehensiveSampleData.json my-custom-data.json
   ```

3. Modify entities in `current` object

4. Add/modify events in `timeline.events`

5. Adjust snapshots in `timeline.snapshots`

6. Validate format before uploading

---

## Related Documentation

- [Data Format Specification](data-format-specification.md)
- [Temporal Filter Implementation](temporal-filter-implementation-summary.md)
- [Timeline Playback Guide](timeline-playback-guide.md)

---

**Questions?** The demo data is designed to be self-explanatory. Upload it and explore the temporal filtering features!
