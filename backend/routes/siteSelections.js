const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'site_selections',
  'You are a facility location and site selection expert. Analyze potential manufacturing sites for reshoring suitability. Format with clear sections.',
  (item) => `Analyze this site for reshoring:
Site: ${item.site_name}
Location: ${item.city}, ${item.state}, ${item.country}
Type: ${item.site_type}
Area: ${item.area_sqft} sq ft
Monthly Cost: $${item.monthly_cost}
Labor Availability: ${item.labor_availability_score}/10
Infrastructure: ${item.infrastructure_score}/10
Market Proximity: ${item.proximity_to_market}/10
Tax Incentives: ${item.tax_incentives}
Utilities: $${item.utilities_cost}/month
Overall Score: ${item.overall_score}/10

Provide: 1) Site suitability assessment 2) Cost-benefit analysis 3) Incentive optimization 4) Infrastructure gaps 5) Comparison with alternatives`
);
