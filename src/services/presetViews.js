/**
 * Preset Views Module
 * Provides pre-configured filter functions for common audit analysis scenarios
 */

export const presetViews = {
  // Phase 1: Critical Views
  'uncontrolled-risks': {
    name: 'Uncontrolled Risks',
    description: 'Risks without any mitigating controls',
    priority: 'CRITICAL',
    category: 'coverage',
    filter: (data) => {
      const { risks, relationships, controls } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      const uncontrolledRisks = risks.filter(risk => {
        const hasControl = relationships.some(rel =>
          rel.source === risk.id &&
          rel.type === 'mitigated_by' &&
          controls.some(control => control.id === rel.target)
        );
        return !hasControl;
      }).sort((a, b) => (b.residual_rating || 0) - (a.residual_rating || 0));

      return {
        nodes: uncontrolledRisks,
        links: [],
        activeFilters: new Set(['risks']),
        message: `${uncontrolledRisks.length} risk(s) without controls`
      };
    }
  },

  'unaudited-risks': {
    name: 'Unaudited Risks',
    description: 'Risks that have never been audited or lack recent audit coverage',
    priority: 'HIGH',
    category: 'coverage',
    filter: (data) => {
      const { risks, relationships, audits } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      const currentDate = new Date();
      const twelveMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 12));

      const unauditedRisks = risks.filter(risk => {
        const auditRelationships = relationships.filter(rel =>
          (rel.source === risk.id || rel.target === risk.id) &&
          rel.type === 'assessed_by' &&
          audits?.some(audit => audit.id === rel.target || audit.id === rel.source)
        );

        if (auditRelationships.length === 0) return true;

        // Check if all audits are older than 12 months
        const hasRecentAudit = auditRelationships.some(rel => {
          const audit = audits.find(a => a.id === rel.target || a.id === rel.source);
          if (!audit?.date_performed) return false;
          return new Date(audit.date_performed) > twelveMonthsAgo;
        });

        return !hasRecentAudit;
      }).sort((a, b) => (b.residual_rating || 0) - (a.residual_rating || 0));

      return {
        nodes: unauditedRisks,
        links: [],
        activeFilters: new Set(['risks']),
        message: `${unauditedRisks.length} risk(s) without recent audits`
      };
    }
  },

  'high-residual-risk': {
    name: 'High Residual Risk',
    description: 'Risks that remain high after controls',
    priority: 'CRITICAL',
    category: 'planning',
    filter: (data) => {
      const { risks, relationships, controls } = data;

      if (!risks) return { nodes: [], links: [] };

      const highResidualRisks = risks
        .filter(risk => (risk.residual_rating || 0) >= 7)
        .map(risk => {
          const effectiveness = risk.inherent_rating && risk.residual_rating
            ? ((risk.inherent_rating - risk.residual_rating) / risk.inherent_rating) * 100
            : 0;
          return { ...risk, controlEffectiveness: effectiveness };
        })
        .sort((a, b) => (b.residual_rating || 0) - (a.residual_rating || 0));

      // Include related controls
      const riskIds = new Set(highResidualRisks.map(r => r.id));
      const relatedControls = relationships
        ?.filter(rel => riskIds.has(rel.source) && rel.type === 'mitigated_by')
        .map(rel => controls?.find(c => c.id === rel.target))
        .filter(Boolean) || [];

      const relevantLinks = relationships?.filter(rel =>
        riskIds.has(rel.source) &&
        rel.type === 'mitigated_by' &&
        relatedControls.some(c => c.id === rel.target)
      ) || [];

      return {
        nodes: [...highResidualRisks, ...relatedControls],
        links: relevantLinks,
        activeFilters: new Set(['risks', 'controls']),
        message: `${highResidualRisks.length} high residual risk(s)`
      };
    }
  },

  'enterprise-risk-profile': {
    name: 'Enterprise Risk Profile',
    description: 'Top risks by residual rating',
    priority: 'HIGH',
    category: 'executive',
    filter: (data) => {
      const { risks, relationships, controls } = data;

      if (!risks) return { nodes: [], links: [] };

      const topRisks = risks
        .sort((a, b) => (b.residual_rating || 0) - (a.residual_rating || 0))
        .slice(0, 10)
        .map(risk => {
          const controlCount = relationships?.filter(rel =>
            rel.source === risk.id && rel.type === 'mitigated_by'
          ).length || 0;

          return { ...risk, controlCount };
        });

      const riskIds = new Set(topRisks.map(r => r.id));
      const relatedControls = relationships
        ?.filter(rel => riskIds.has(rel.source) && rel.type === 'mitigated_by')
        .map(rel => controls?.find(c => c.id === rel.target))
        .filter(Boolean) || [];

      const relevantLinks = relationships?.filter(rel =>
        riskIds.has(rel.source) &&
        rel.type === 'mitigated_by' &&
        relatedControls.some(c => c.id === rel.target)
      ) || [];

      return {
        nodes: [...topRisks, ...relatedControls],
        links: relevantLinks,
        activeFilters: new Set(['risks', 'controls']),
        message: `Top 10 enterprise risks`
      };
    }
  },

  // Phase 2: Standard Views
  'high-issue-risks': {
    name: 'High Issue Risks',
    description: 'Risks with the most associated issues',
    priority: 'HIGH',
    category: 'hotspot',
    filter: (data) => {
      const { risks, relationships, issues } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      const riskIssueCounts = risks.map(risk => {
        const issueCount = relationships.filter(rel =>
          rel.source === risk.id &&
          rel.type === 'causes' &&
          issues?.some(issue => issue.id === rel.target)
        ).length;
        return { ...risk, issueCount };
      })
      .filter(risk => risk.issueCount > 0)
      .sort((a, b) => b.issueCount - a.issueCount)
      .slice(0, 20);

      const riskIds = new Set(riskIssueCounts.map(r => r.id));
      const relatedIssues = relationships
        ?.filter(rel => riskIds.has(rel.source) && rel.type === 'causes')
        .map(rel => issues?.find(i => i.id === rel.target))
        .filter(Boolean) || [];

      const relevantLinks = relationships?.filter(rel =>
        riskIds.has(rel.source) &&
        rel.type === 'causes' &&
        relatedIssues.some(i => i.id === rel.target)
      ) || [];

      return {
        nodes: [...riskIssueCounts, ...relatedIssues],
        links: relevantLinks,
        activeFilters: new Set(['risks', 'issues']),
        message: `Top ${riskIssueCounts.length} risks by issue count`
      };
    }
  },

  'high-incident-risks': {
    name: 'High Incident Risks',
    description: 'Risks with the most incidents (proven problems)',
    priority: 'HIGH',
    category: 'hotspot',
    filter: (data) => {
      const { risks, relationships, incidents } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      const riskIncidentCounts = risks.map(risk => {
        const incidentRels = relationships.filter(rel =>
          rel.source === risk.id &&
          rel.type === 'realized_in' &&
          incidents?.some(incident => incident.id === rel.target)
        );

        const incidentCount = incidentRels.length;
        const criticalCount = incidentRels.filter(rel => {
          const incident = incidents?.find(i => i.id === rel.target);
          return incident?.severity === 'critical';
        }).length;

        return { ...risk, incidentCount, criticalIncidentCount: criticalCount };
      })
      .filter(risk => risk.incidentCount > 0)
      .sort((a, b) => {
        if (b.criticalIncidentCount !== a.criticalIncidentCount) {
          return b.criticalIncidentCount - a.criticalIncidentCount;
        }
        return b.incidentCount - a.incidentCount;
      })
      .slice(0, 20);

      const riskIds = new Set(riskIncidentCounts.map(r => r.id));
      const relatedIncidents = relationships
        ?.filter(rel => riskIds.has(rel.source) && rel.type === 'realized_in')
        .map(rel => incidents?.find(i => i.id === rel.target))
        .filter(Boolean) || [];

      const relevantLinks = relationships?.filter(rel =>
        riskIds.has(rel.source) &&
        rel.type === 'realized_in' &&
        relatedIncidents.some(i => i.id === rel.target)
      ) || [];

      return {
        nodes: [...riskIncidentCounts, ...relatedIncidents],
        links: relevantLinks,
        activeFilters: new Set(['risks', 'incidents']),
        message: `Top ${riskIncidentCounts.length} risks by incident count`
      };
    }
  },

  'audit-universe-coverage': {
    name: 'Audit Universe Coverage',
    description: 'Overall coverage metrics',
    priority: 'HIGH',
    category: 'executive',
    filter: (data) => {
      const { risks, relationships, audits, businessUnits, standards } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      // Calculate coverage percentages
      const auditedRisks = new Set();
      const auditedUnits = new Set();
      const auditedStandards = new Set();

      relationships?.forEach(rel => {
        if (rel.type === 'assessed_by') {
          if (risks.some(r => r.id === rel.source)) {
            auditedRisks.add(rel.source);
          }
        }
        if (rel.type === 'verified_by') {
          if (standards?.some(s => s.id === rel.source)) {
            auditedStandards.add(rel.source);
          }
        }
      });

      // Get units with audit relationships
      businessUnits?.forEach(unit => {
        const hasAudit = relationships?.some(rel =>
          rel.type === 'owned_by' &&
          rel.target === unit.id &&
          auditedRisks.has(rel.source)
        );
        if (hasAudit) auditedUnits.add(unit.id);
      });

      const riskCoverage = risks.length > 0 ? (auditedRisks.size / risks.length * 100).toFixed(1) : 0;
      const unitCoverage = businessUnits?.length > 0 ? (auditedUnits.size / businessUnits.length * 100).toFixed(1) : 0;
      const standardCoverage = standards?.length > 0 ? (auditedStandards.size / standards.length * 100).toFixed(1) : 0;

      // Show all audits and their relationships
      const allAudits = audits || [];
      const auditLinks = relationships?.filter(rel =>
        allAudits.some(a => a.id === rel.target || a.id === rel.source)
      ) || [];

      const relatedRisks = auditLinks
        .filter(rel => rel.type === 'assessed_by')
        .map(rel => risks.find(r => r.id === rel.source))
        .filter(Boolean);

      return {
        nodes: [...allAudits, ...relatedRisks],
        links: auditLinks,
        activeFilters: new Set(['audits', 'risks']),
        message: `Coverage: ${riskCoverage}% risks, ${unitCoverage}% units, ${standardCoverage}% standards audited`,
        metrics: {
          riskCoverage,
          unitCoverage,
          standardCoverage,
          totalRisks: risks.length,
          auditedRisks: auditedRisks.size,
          totalUnits: businessUnits?.length || 0,
          auditedUnits: auditedUnits.size,
          totalStandards: standards?.length || 0,
          auditedStandards: auditedStandards.size
        }
      };
    }
  },

  'standard-violations': {
    name: 'Standard Violations',
    description: 'Standards with most non-compliance issues',
    priority: 'HIGH',
    category: 'compliance',
    filter: (data) => {
      const { standards, relationships, issues, risks } = data;

      if (!standards || !relationships) return { nodes: [], links: [] };

      // Find issues related to standards through risks
      const standardViolations = standards.map(standard => {
        // Get risks that require this standard
        const relatedRisks = relationships
          .filter(rel => rel.type === 'requires' && rel.target === standard.id)
          .map(rel => risks?.find(r => r.id === rel.source))
          .filter(Boolean);

        // Get issues from those risks
        const relatedIssues = relatedRisks.flatMap(risk =>
          relationships
            .filter(rel => rel.type === 'causes' && rel.source === risk.id)
            .map(rel => issues?.find(i => i.id === rel.target))
            .filter(Boolean)
        );

        const criticalIssues = relatedIssues.filter(i => i.severity === 'critical').length;
        const highIssues = relatedIssues.filter(i => i.severity === 'high').length;

        return {
          ...standard,
          issueCount: relatedIssues.length,
          criticalCount: criticalIssues,
          highCount: highIssues,
          relatedRisks
        };
      })
      .filter(s => s.issueCount > 0)
      .sort((a, b) => {
        if (b.criticalCount !== a.criticalCount) return b.criticalCount - a.criticalCount;
        if (b.highCount !== a.highCount) return b.highCount - a.highCount;
        return b.issueCount - a.issueCount;
      });

      // Get all related entities
      const standardIds = new Set(standardViolations.map(s => s.id));
      const relatedRisks = standardViolations.flatMap(s => s.relatedRisks);

      const relevantLinks = relationships?.filter(rel =>
        (standardIds.has(rel.target) && rel.type === 'requires') ||
        (relatedRisks.some(r => r.id === rel.source) && rel.type === 'causes')
      ) || [];

      const relatedIssues = relevantLinks
        .filter(rel => rel.type === 'causes')
        .map(rel => issues?.find(i => i.id === rel.target))
        .filter(Boolean);

      return {
        nodes: [...standardViolations, ...relatedRisks, ...relatedIssues],
        links: relevantLinks,
        activeFilters: new Set(['standards', 'risks', 'issues']),
        message: `${standardViolations.length} standard(s) with violations`
      };
    }
  },

  // Additional useful views
  'unmonitored-standards': {
    name: 'Unmonitored Standards',
    description: 'Compliance standards without audit coverage',
    priority: 'HIGH',
    category: 'coverage',
    filter: (data) => {
      const { standards, relationships, audits } = data;

      if (!standards || !relationships) return { nodes: [], links: [] };

      const unmonitoredStandards = standards.filter(standard => {
        const hasAudit = relationships.some(rel =>
          (rel.source === standard.id || rel.target === standard.id) &&
          rel.type === 'verified_by' &&
          audits?.some(audit => audit.id === rel.target || audit.id === rel.source)
        );
        return !hasAudit;
      }).sort((a, b) => {
        const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (importanceOrder[a.regulatory_importance] || 99) - (importanceOrder[b.regulatory_importance] || 99);
      });

      return {
        nodes: unmonitoredStandards,
        links: [],
        activeFilters: new Set(['standards']),
        message: `${unmonitoredStandards.length} standard(s) without audit coverage`
      };
    }
  },

  'audit-blind-spots': {
    name: 'Audit Blind Spots',
    description: 'Business units without any audit activity',
    priority: 'HIGH',
    category: 'coverage',
    filter: (data) => {
      const { businessUnits, relationships, risks, audits } = data;

      if (!businessUnits || !relationships) return { nodes: [], links: [] };

      const blindSpotUnits = businessUnits.filter(unit => {
        // Check if unit owns any risks
        const unitRisks = relationships
          .filter(rel => rel.type === 'owned_by' && rel.target === unit.id)
          .map(rel => rel.source);

        if (unitRisks.length === 0) return false;

        // Check if any of those risks have been audited
        const hasAudit = unitRisks.some(riskId =>
          relationships.some(rel =>
            (rel.source === riskId || rel.target === riskId) &&
            rel.type === 'assessed_by' &&
            audits?.some(audit => audit.id === rel.target || audit.id === rel.source)
          )
        );

        return !hasAudit;
      }).sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

      // Include risks for these units
      const unitIds = new Set(blindSpotUnits.map(u => u.id));
      const unitRisks = relationships
        .filter(rel => rel.type === 'owned_by' && unitIds.has(rel.target))
        .map(rel => risks?.find(r => r.id === rel.source))
        .filter(Boolean);

      const relevantLinks = relationships?.filter(rel =>
        rel.type === 'owned_by' &&
        unitIds.has(rel.target) &&
        unitRisks.some(r => r.id === rel.source)
      ) || [];

      return {
        nodes: [...blindSpotUnits, ...unitRisks],
        links: relevantLinks,
        activeFilters: new Set(['entities', 'risks']),
        message: `${blindSpotUnits.length} business unit(s) without audits`
      };
    }
  },

  'regulatory-exposure': {
    name: 'Regulatory Exposure',
    description: 'High-severity risks in regulated areas',
    priority: 'HIGH',
    category: 'compliance',
    filter: (data) => {
      const { risks, relationships, standards } = data;

      if (!risks || !relationships) return { nodes: [], links: [] };

      const regulatoryRisks = risks.filter(risk => {
        // Check if risk is marked as regulatory or linked to critical standards
        const isRegulatory = risk.regulatory === true;
        const hasCriticalStandard = relationships.some(rel =>
          rel.source === risk.id &&
          rel.type === 'requires' &&
          standards?.some(s => s.id === rel.target && s.regulatory_importance === 'critical')
        );

        const isHighSeverity = (risk.residual_rating || 0) >= 7 ||
                               (risk.inherent_rating || 0) >= 8;

        return (isRegulatory || hasCriticalStandard) && isHighSeverity;
      }).sort((a, b) => (b.residual_rating || 0) - (a.residual_rating || 0));

      const riskIds = new Set(regulatoryRisks.map(r => r.id));
      const relatedStandards = relationships
        ?.filter(rel => riskIds.has(rel.source) && rel.type === 'requires')
        .map(rel => standards?.find(s => s.id === rel.target))
        .filter(Boolean) || [];

      const relevantLinks = relationships?.filter(rel =>
        riskIds.has(rel.source) &&
        rel.type === 'requires' &&
        relatedStandards.some(s => s.id === rel.target)
      ) || [];

      return {
        nodes: [...regulatoryRisks, ...relatedStandards],
        links: relevantLinks,
        activeFilters: new Set(['risks', 'standards']),
        message: `${regulatoryRisks.length} high-severity regulatory risk(s)`
      };
    }
  },

  'failed-controls': {
    name: 'Failed Controls',
    description: 'Controls with effectiveness issues',
    priority: 'MEDIUM',
    category: 'hotspot',
    filter: (data) => {
      const { controls, relationships, issues, risks } = data;

      if (!controls || !relationships) return { nodes: [], links: [] };

      const failedControls = controls.map(control => {
        // Count issues where control is involved
        const relatedRisks = relationships
          .filter(rel => rel.source && rel.target === control.id && rel.type === 'mitigated_by')
          .map(rel => risks?.find(r => r.id === rel.source))
          .filter(Boolean);

        const relatedIssues = relatedRisks.flatMap(risk =>
          relationships
            .filter(rel => rel.source === risk.id && rel.type === 'causes')
            .map(rel => issues?.find(i => i.id === rel.target))
            .filter(Boolean)
        );

        // Check if residual risk remains high despite control
        const highResidualRisks = relatedRisks.filter(r => (r.residual_rating || 0) >= 7).length;

        const failureScore = relatedIssues.length + highResidualRisks * 2;

        return {
          ...control,
          issueCount: relatedIssues.length,
          highResidualCount: highResidualRisks,
          failureScore,
          relatedRisks
        };
      })
      .filter(c => c.failureScore > 0 || (c.test_result === 'partial' || c.test_result === 'ineffective'))
      .sort((a, b) => b.failureScore - a.failureScore);

      const controlIds = new Set(failedControls.map(c => c.id));
      const relatedRisks = failedControls.flatMap(c => c.relatedRisks);

      const relevantLinks = relationships?.filter(rel =>
        controlIds.has(rel.target) &&
        rel.type === 'mitigated_by' &&
        relatedRisks.some(r => r.id === rel.source)
      ) || [];

      return {
        nodes: [...failedControls, ...relatedRisks],
        links: relevantLinks,
        activeFilters: new Set(['controls', 'risks']),
        message: `${failedControls.length} control(s) with effectiveness issues`
      };
    }
  }
};

/**
 * Get list of all available preset views
 */
export function getPresetViewsList() {
  return Object.entries(presetViews).map(([key, view]) => ({
    id: key,
    name: view.name,
    description: view.description,
    priority: view.priority,
    category: view.category
  }));
}

/**
 * Apply a preset view filter
 */
export function applyPresetView(viewId, data) {
  const view = presetViews[viewId];
  if (!view) {
    console.error(`Preset view '${viewId}' not found`);
    return null;
  }

  try {
    return view.filter(data);
  } catch (error) {
    console.error(`Error applying preset view '${viewId}':`, error);
    return null;
  }
}

/**
 * Get preset views grouped by category
 */
export function getPresetViewsByCategory() {
  const grouped = {};

  Object.entries(presetViews).forEach(([key, view]) => {
    const category = view.category || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      id: key,
      name: view.name,
      description: view.description,
      priority: view.priority
    });
  });

  return grouped;
}
