const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'budget_plans',
  'You are a financial planning expert specializing in reshoring investment analysis. Provide detailed budget analysis and ROI projections. Format with clear sections.',
  (item) => `Analyze this reshoring budget plan:
Title: ${item.title}
Category: ${item.category}
Fiscal Year: ${item.fiscal_year}
Allocated: $${item.allocated_budget}
Spent to Date: $${item.spent_to_date}
Projected Total: $${item.projected_total}
Variance: $${item.variance}
Priority: ${item.priority}
Department: ${item.department}
Description: ${item.description}
Expected ROI: ${item.roi_expected}%

Provide: 1) Budget utilization analysis 2) Variance explanation 3) ROI projection 4) Cost optimization opportunities 5) Funding recommendations`
);
