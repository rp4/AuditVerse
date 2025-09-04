# Auditverse — Questions by Data Readiness (MVP vs Future)

Below are questions your tool can answer immediately with a minimal schema, versus ones that need richer data later. Use this as your product scope guardrail.

---

## ✅ Answerable with MVP tables
**Available tables:** `risks`, `controls`, `audits`, `entities`, `issues`, `incidents`

### Strategy & Risk Intelligence
- Top risks by inherent/residual rating per entity/business unit.
- Risks with open high‑severity issues (and owners).
- Risks without mapped controls (control gaps at risk level).
- Risks linked to the most incidents (count/severity) in the last *N* days.
- Heatmap: risk severity × entity (current snapshot).
- Risks without recent audit coverage (e.g., > 18 months since last audit touching that risk/entity).

### Control Coverage & Effectiveness (using audits/issues as proxies)
- Controls not mapped to any risk (orphan controls) by entity.
- Controls mapped to high risks but never audited.
- Controls associated with the most/most‑severe issues.
- Control coverage ratio per entity: (# risks with ≥1 mapped control) / (total risks).
- Controls with repeated related incidents (by tag or linkage) over last *N* months.

### Audit Planning & Coverage
- Audit coverage of top *N* risks in the last 12–24 months.
- Entities not audited in > *X* months.
- Backlog: risks/controls scheduled in audits next quarter vs not scheduled.
- Audits yielding the highest number of high‑severity issues per audit hour (if audit effort captured) or per audit.

### Issues & Incidents
- Overdue high‑severity issues by owner and entity.
- Median/mean time‑to‑close issues by entity/risk.
- Incident counts and severity trend by entity (time‑series on `incidents.occurred_at`).
- Incidents mapped to risks without any open remediation issue (potential blind spots).

### Entities & Ownership
- Entity scorecards: risks, mapped controls, last audit date, open issues, incidents YTD.
- Entities with highest residual risk exposure (sum/weighted).
- RACI basics: risk/control owners and their open workload (# open issues by owner).

> **Optional (still MVP if you store dates or history):**
> - Risk rating trend over time if `risks` includes historical snapshots or effective dates.
> - Audit cadence adherence if `audits` includes planned vs actual dates.

---

## 🔜 Requires additional data to answer well
**Future tables/fields:** `frameworks`, `requirements`, `policies`, `evidence`, `tests/results`, `KRIs`, `users/roles`, `assets/systems`, `vendors/TPRM`, `risk appetite`, `change log`, `costs/budget`, `telemetry`

### Framework & Policy Alignment
- Where do we fail specific framework requirements (e.g., NIST/ISO/PCI) and what’s the delta?
- % of clauses/requirements fully/partially/not met; crosswalks (e.g., NIST ⇄ CIS).
- Policies without mapped controls, policies past review date, policy ↔ control traceability.
- Alerts on framework version changes that impact mapped controls.

### Control Testing, Evidence & Assurance
- Evidence freshness/staleness by control (last collected date, source type).
- Automated test pass/fail rates, flakiness, mean time to detect/respond.
- Controls lacking sufficient evidence types (e.g., only screenshots vs logs/APIs).
- Tamper‑evidence/provenance checks on artifacts.

### KRIs, Metrics & Thresholds
- KRIs breaching thresholds by entity/process; variance to risk appetite.
- Leading indicators predicting control failure or incident likelihood.

### Access, SoD & Data Protection
- Segregation‑of‑Duties conflicts and aging; toxic combinations.
- Privileged access recertification gaps; account lifecycle anomalies.
- Data classification vs protection controls (DLP, encryption) coverage by asset.

### Third‑Party / TPRM
- Vendors touching regulated data without current assessment/evidence.
- Residual risk by vendor tier; expiring contracts with open issues.
- Incidents tied to vendors and affected controls/data flows.

### What‑If, Optimization & ROI
- Simulate risk reduction from automating specific controls (requires control efficacy, cost, and risk models).
- Minimum control set to satisfy overlapping frameworks (deduped requirement set).
- Audit plan optimization: risk reduction per audit hour/cost.

### Data Quality & Governance
- Conflicting risk ratings across sources; lineage from requirement → control → test → evidence.
- Duplicate/ambiguous control identifiers; stewardship gaps.

### Change, Incidents & Root Cause
- Link org/tech changes (deploys, architecture shifts) to changes in risk profile.
- Root‑cause analysis across incidents and failed controls (taxonomy needed).

---

## Notes on keeping MVP minimal (but extensible)
- **Keys & links now:** ensure many‑to‑many bridges exist today (risk↔control, control↔audit, risk/control↔entity, risk/control/incident↔issue).
- **Dates everywhere:** `created_at`, `updated_at`, `effective_date` fields unlock trends without extra tables.
- **Tags/taxonomy:** simple, free‑text tags now → later formalized taxonomies (process, domain, framework keyword).
- **Identifiers:** stable `control_id`, `risk_id`, etc., to backfill future evidence/policy mappings.

Use this list to stage your roadmap: ship the ✅ set first; add the 🔜 questions as you introduce frameworks/policies/evidence and testing telemetry.

