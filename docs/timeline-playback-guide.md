# Timeline Playback Guide

## Overview

The AuditVerse timeline playback feature allows you to visualize how The Iron Bank's risk landscape evolved throughout 2024. The timeline plays through **monthly snapshots**, not daily, showing major events, risk changes, and audit activities month by month.

## How It Works

### Data Structure
- **12 Monthly Snapshots**: January 2024 → December 2024
- Each snapshot captures:
  - Risk rating changes
  - New controls implemented
  - Issues identified/resolved
  - Security incidents
  - Completed audits
  - Key events with descriptions

### Playback Controls

#### Play Button (▶)
- **Function**: Starts automatic playback through snapshots
- **Speed**: 2 seconds per snapshot (adjustable)
- **Behavior**:
  - Advances one snapshot at a time (month by month)
  - Shows summary popup for each month
  - Updates visualization to reflect data at that point in time
  - Auto-stops at December 2024

#### Pause Button (⏸)
- **Function**: Pauses playback at current snapshot
- **Use**: Examine a specific month in detail

#### Reset Button (⏮)
- **Function**: Jumps back to January 2024
- **Use**: Restart the timeline from the beginning

#### Timeline Slider
- **Range**: 0-11 (12 snapshots)
- **Function**: Manual navigation through months
- **Behavior**:
  - Drag to any month instantly
  - Auto-pauses playback when moved
  - Shows month name in display

#### Speed Control
- **Options**: 0.5x, 1x, 2x, 5x
- **Default**: 1x (2 seconds per snapshot)
- **Effect**:
  - 0.5x = 4 seconds per snapshot (slower)
  - 2x = 1 second per snapshot (faster)
  - 5x = 0.4 seconds per snapshot (very fast)

### Visual Feedback

#### Timeline Display
- Shows current month (e.g., "January 2024")
- Updates as timeline progresses
- Located in footer timeline area

#### Snapshot Summary Popup
- **Location**: Bottom-left corner
- **Content**:
  - Current month
  - Summary of what happened
  - Key events with icons:
    - 🚨 Critical incidents
    - ✅ Completed audits
    - ⚠️ New risks
    - 📌 Other events
- **Auto-hide**: Disappears after 5 seconds when paused

#### Button States
- **Active**: Full opacity (1.0)
- **Inactive**: Reduced opacity (0.5)
- Shows which control is currently active

## The Iron Bank's 2024 Story

### Q1: Foundation & Planning
**January 2024**
- Climate risk added to register
- Setting baseline for the year

**February 2024**
- Cyber risk improving (7.5 → 7.2)
- MFA phase 1 rollout

**March 2024**
- SOX audit completed successfully
- Underwriting controls strengthened

### Q2: Growth & Challenges
**April 2024**
- Interest rate volatility increasing
- Risk rating rises to 6.8

**May 2024**
- Fintech competition intensifies
- Digital disruption pressure

**June 2024**
- Privacy compliance risk emerges
- ATM security review initiated

### Q3: Expansion & Incidents
**July 2024**
- Security monitoring expanded (90% coverage)
- Vendor risk program launched

**August 2024**
- Key person risk materializes
- Trader departure triggers succession plan

**September 2024**
- Training gaps identified (78% completion)
- Vendor payment outage
- AML audit completed

### Q4: Critical Period
**October 2024**
- Credit concentration breach detected
- Insider threat incident
- DDoS attack
- Credit risk audit finds issues

**November 2024**
- Busiest month: Multiple security incidents
  - ATM skimming (35 cards)
  - Wire fraud prevented ($450k)
  - Ransomware blocked
- Critical audits completed
- Security gaps identified

**December 2024**
- Year-end pressure
- Data breach contained (S3 misconfiguration)
- Mobile banking outage (4.5 hours)
- Executive phishing campaign
- Multiple issues surface
- 9 critical/high issues open

## Technical Implementation

### Snapshot-Based Playback
```javascript
// Timeline advances through discrete snapshots, not continuous time
play() {
    setInterval(() => {
        this.next(); // Moves to NEXT SNAPSHOT (not next day)
        if (!hasNext) this.pause();
    }, this.playbackSpeed); // 2000ms between snapshots
}
```

### Data Application
```javascript
// Each snapshot modifies base data
applySnapshotToData(baseData, snapshot) {
    // Apply risk rating changes
    // Add/remove issues as they occur
    // Update audit statuses
    // Reflect control implementations
}
```

### Visualization Updates
- Data is temporarily modified to reflect snapshot state
- Visualization redraws to show historical view
- Original data preserved for reset

## Usage Tips

1. **First Time**: Click Play to watch the full year unfold
2. **Detailed Analysis**: Use slider to jump to specific months
3. **Speed Up**: Use 2x or 5x for quick overview
4. **Slow Down**: Use 0.5x to catch all details
5. **Investigate**: Pause on months with many events
6. **Compare**: Use slider to compare different time periods

## Key Insights from Timeline

### Risk Evolution
- **Cyber Risk (R001)**: 7.5 → 6.5 (improving)
- **Interest Rate Risk (R013)**: 6.5 → 6.5 (volatile)
- **Climate Risk (R009)**: New in Jan, stable at 7.0

### Issue Accumulation
- Jan-Aug: Relatively quiet (1-2 issues)
- Sep-Oct: Issues start surfacing (5 issues)
- Nov-Dec: Critical period (14 total issues)

### Incident Pattern
- Q1-Q2: Minimal incidents
- Q3: Vendor issues, initial threats
- Q4: Major spike (6 incidents in 2 months)

### Audit Coverage
- Steady throughout year (10 audits)
- External audits: Q1 (SOX), Q3 (AML)
- Internal audits: Distributed across year

## Console Logging

The timeline logs detailed information to the console:
```
[TIMELINE] Historical snapshots loaded: 12
[TIMELINE] Snapshot change: November 2024 Index: 10
[TIMELINE] Display updated: November 2024 Snapshot 11 of 12
```

Monitor the console to understand timeline behavior and troubleshoot issues.

## Future Enhancements

Potential additions:
- Custom date ranges
- Comparison mode (side-by-side months)
- Export timeline video/animation
- Configurable snapshot intervals
- Real-time data integration
