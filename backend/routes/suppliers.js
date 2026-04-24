const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'suppliers',
  'You are an expert supply chain analyst specializing in supplier evaluation and reshoring decisions. Provide detailed, professional analysis with actionable recommendations. Format your response with clear sections using headers.',
  (item) => `Analyze this supplier for reshoring suitability:
Name: ${item.name}
Country: ${item.country}, Region: ${item.region}
Industry: ${item.industry}
Capabilities: ${item.capability}
Reliability Score: ${item.reliability_score}/10
Cost Rating: ${item.cost_rating}
Lead Time: ${item.lead_time_days} days
Certifications: ${item.certifications}

Provide: 1) Overall assessment 2) Strengths & weaknesses 3) Reshoring compatibility score 4) Recommendations for engagement 5) Risk factors to monitor`
);
