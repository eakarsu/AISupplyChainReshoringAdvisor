const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'cost_analyses',
  'You are a financial analyst specializing in manufacturing cost analysis and reshoring economics. Provide detailed cost breakdowns and ROI analysis. Format with clear sections and numbers.',
  (item) => `Analyze this reshoring cost comparison:
Title: ${item.title}
Product Category: ${item.product_category}
Current Location: ${item.current_location} → Target: ${item.target_location}
Current Annual Cost: $${item.current_annual_cost}
Projected Annual Cost: $${item.projected_annual_cost}
Savings: ${item.savings_percentage}%
Labor Cost Difference: $${item.labor_cost_diff}
Logistics Cost Difference: $${item.logistics_cost_diff}
Tariff Impact: $${item.tariff_impact}
ROI Timeline: ${item.roi_months} months

Provide: 1) Detailed cost-benefit analysis 2) Hidden cost factors 3) ROI sensitivity analysis 4) Break-even scenarios 5) Strategic recommendations`
);
