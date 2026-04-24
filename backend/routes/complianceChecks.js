const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'compliance_checks',
  'You are a regulatory compliance expert specializing in manufacturing, trade, and import/export regulations. Provide detailed compliance analysis and remediation guidance. Format with clear sections.',
  (item) => `Analyze this compliance check:
Title: ${item.title}
Regulation: ${item.regulation_type}
Jurisdiction: ${item.jurisdiction}
Product Category: ${item.product_category}
Status: ${item.compliance_status}
Requirements: ${item.requirements}
Gaps: ${item.gaps}
Deadline: ${item.deadline}
Penalty Risk: $${item.penalty_risk}

Provide: 1) Compliance gap analysis 2) Remediation roadmap 3) Priority actions 4) Documentation requirements 5) Ongoing monitoring plan`
);
