#!/usr/bin/env python3
"""
Convert old format demo data to new format with timeline events
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

def load_old_data(filepath):
    """Load old format data"""
    with open(filepath, 'r') as f:
        return json.load(f)

def generate_timeline_events(data):
    """Generate realistic timeline events from existing data"""
    events = []

    # Generate risk rating changes over time for each risk
    for risk in data.get('risks', []):
        risk_id = risk['id']
        created = risk.get('created_date', '2023-01-01')
        last_reviewed = risk.get('last_reviewed', '2024-12-01')

        # Parse dates
        try:
            created_date = datetime.strptime(created, '%Y-%m-%d')
            review_date = datetime.strptime(last_reviewed, '%Y-%m-%d')
        except:
            continue

        # Initial higher risk rating (3 months after creation)
        initial_date = created_date + timedelta(days=90)
        events.append({
            "date": initial_date.isoformat() + "Z",
            "type": "risk_rating_change",
            "entityType": "risk",
            "id": risk_id,
            "changes": {
                "residual_rating": risk['inherent_rating'] * 0.9,
                "residual_likelihood": min(10, risk['inherent_likelihood'])
            }
        })

        # Mid-point improvement (6 months later)
        mid_date = initial_date + timedelta(days=180)
        if mid_date < review_date:
            events.append({
                "date": mid_date.isoformat() + "Z",
                "type": "risk_rating_change",
                "entityType": "risk",
                "id": risk_id,
                "changes": {
                    "residual_rating": (risk['inherent_rating'] + risk['residual_rating']) / 2,
                    "residual_likelihood": (risk['inherent_likelihood'] + risk['residual_likelihood']) // 2
                }
            })

        # Final current rating
        events.append({
            "date": review_date.isoformat() + "Z",
            "type": "risk_rating_change",
            "entityType": "risk",
            "id": risk_id,
            "changes": {
                "residual_rating": risk['residual_rating'],
                "residual_likelihood": risk['residual_likelihood'],
                "residual_severity": risk['residual_severity']
            }
        })

    # Add control implementation events
    for control in data.get('controls', []):
        control_id = control['id']
        # Controls implemented 60 days after risk creation
        impl_date = datetime(2023, 6, 1) + timedelta(days=hash(control_id) % 180)

        events.append({
            "date": impl_date.isoformat() + "Z",
            "type": "control_added",
            "entityType": "control",
            "id": control_id,
            "data": control
        })

    # Add audit completion events
    for audit in data.get('audits', []):
        if audit.get('date_performed'):
            try:
                audit_date = datetime.strptime(audit['date_performed'], '%Y-%m-%d')
                events.append({
                    "date": audit_date.isoformat() + "Z",
                    "type": "audit_status_change",
                    "entityType": "audit",
                    "id": audit['id'],
                    "changes": {
                        "status": audit.get('status', 'completed')
                    }
                })
            except:
                pass

    # Add some issue lifecycle events
    for issue in data.get('issues', []):
        issue_id = issue['id']
        # Issues discovered between Q2 2023 and Q3 2024
        discovered = datetime(2023, 6, 1) + timedelta(days=hash(issue_id) % 450)

        events.append({
            "date": discovered.isoformat() + "Z",
            "type": "issue_added",
            "entityType": "issue",
            "id": issue_id,
            "data": issue
        })

        # Some issues get resolved
        if issue.get('status') == 'Closed':
            resolved = discovered + timedelta(days=30 + hash(issue_id) % 90)
            events.append({
                "date": resolved.isoformat() + "Z",
                "type": "issue_status_change",
                "entityType": "issue",
                "id": issue_id,
                "changes": {
                    "status": "Closed"
                }
            })

    # Add incident events
    for incident in data.get('incidents', []):
        incident_id = incident['id']
        occurred = datetime(2023, 1, 1) + timedelta(days=hash(incident_id) % 700)

        events.append({
            "date": occurred.isoformat() + "Z",
            "type": "incident_added",
            "entityType": "incident",
            "id": incident_id,
            "data": incident
        })

    # Sort events chronologically
    events.sort(key=lambda x: x['date'])

    return events

def generate_snapshots():
    """Generate quarterly snapshots"""
    snapshots = []

    # Q1 2023 - Q4 2024
    quarters = [
        ("2023-01-01", "Q1 2023", "Beginning of fiscal year 2023"),
        ("2023-04-01", "Q2 2023", "Start of Q2 - Initial control implementations"),
        ("2023-07-01", "Q3 2023", "Mid-year review period"),
        ("2023-10-01", "Q4 2023", "End of year assessment"),
        ("2024-01-01", "Q1 2024", "Beginning of fiscal year 2024"),
        ("2024-04-01", "Q2 2024", "Spring audit season"),
        ("2024-07-01", "Q3 2024", "Mid-year checkpoint"),
        ("2024-10-01", "Q4 2024", "Year-end risk assessment"),
    ]

    for date, label, summary in quarters:
        snapshots.append({
            "date": date + "T00:00:00Z",
            "label": label,
            "summary": summary
        })

    return snapshots

def convert_to_new_format(old_data):
    """Convert old format to new format with timeline"""

    # Extract metadata or create default
    metadata = old_data.get('metadata', {})
    metadata['format_version'] = '2.0'
    metadata['converted_date'] = datetime.now().isoformat() + 'Z'

    # Create current state (remove metadata from main data)
    current = {k: v for k, v in old_data.items() if k != 'metadata'}

    # Ensure relationships exist
    if 'relationships' not in current:
        current['relationships'] = []

    # Generate timeline
    timeline = {
        "events": generate_timeline_events(old_data),
        "snapshots": generate_snapshots()
    }

    # Create new format
    new_data = {
        "current": current,
        "timeline": timeline,
        "metadata": metadata
    }

    return new_data

def main():
    # Paths
    old_file = Path('public/data/comprehensiveSampleData.json')
    new_file = Path('public/data/comprehensiveSampleData.json')
    backup_file = Path('public/data/comprehensiveSampleData.json.backup')

    print(f"Loading old format data from {old_file}...")
    old_data = load_old_data(old_file)

    print(f"Converting to new format...")
    new_data = convert_to_new_format(old_data)

    print(f"Generated {len(new_data['timeline']['events'])} timeline events")
    print(f"Generated {len(new_data['timeline']['snapshots'])} snapshots")

    # Backup old file
    print(f"Backing up old file to {backup_file}...")
    with open(backup_file, 'w') as f:
        json.dump(old_data, f, indent=2)

    # Write new file
    print(f"Writing new format to {new_file}...")
    with open(new_file, 'w') as f:
        json.dump(new_data, f, indent=2)

    print("✅ Conversion complete!")
    print(f"\nSummary:")
    print(f"  - Risks: {len(new_data['current'].get('risks', []))}")
    print(f"  - Controls: {len(new_data['current'].get('controls', []))}")
    print(f"  - Audits: {len(new_data['current'].get('audits', []))}")
    print(f"  - Relationships: {len(new_data['current'].get('relationships', []))}")
    print(f"  - Timeline events: {len(new_data['timeline']['events'])}")
    print(f"  - Snapshots: {len(new_data['timeline']['snapshots'])}")

if __name__ == '__main__':
    main()
