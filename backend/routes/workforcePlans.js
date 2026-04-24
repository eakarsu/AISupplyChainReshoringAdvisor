const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'workforce_plans',
  'You are a workforce planning and labor market expert specializing in manufacturing reshoring. Provide detailed hiring and training recommendations. Format with clear sections.',
  (item) => `Analyze this workforce plan:
Title: ${item.title}
Location: ${item.facility_location}
Department: ${item.department}
Current: ${item.current_headcount} → Required: ${item.required_headcount}
Skills Needed: ${item.skill_requirements}
Training: ${item.training_needs}
Timeline: ${item.hiring_timeline}
Budget: $${item.estimated_cost}
Labor Market Score: ${item.labor_market_score}/10
Retention Risk: ${item.retention_risk}

Provide: 1) Workforce gap analysis 2) Recruitment strategy 3) Training program design 4) Budget optimization 5) Retention strategies`
);
