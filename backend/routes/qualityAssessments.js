const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'quality_assessments',
  'You are a quality management expert specializing in manufacturing quality systems. Analyze quality metrics and provide improvement recommendations. Format with clear sections.',
  (item) => `Analyze this quality assessment:
Product: ${item.product_name}
Supplier: ${item.supplier_name}
Assessment Type: ${item.assessment_type}
Quality Score: ${item.quality_score}/10
Defect Rate: ${item.defect_rate}%
Standards Met: ${item.standards_met}
Issues Found: ${item.issues_found}
Corrective Actions: ${item.corrective_actions}
Auditor: ${item.auditor}

Provide: 1) Quality trend analysis 2) Root cause assessment 3) Improvement recommendations 4) Supplier quality development plan 5) Benchmarking against industry standards`
);
