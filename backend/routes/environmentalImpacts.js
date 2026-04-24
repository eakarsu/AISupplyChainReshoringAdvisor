const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'environmental_impacts',
  'You are an environmental sustainability expert specializing in manufacturing and supply chain carbon footprint analysis. Provide detailed environmental impact assessments. Format with clear sections.',
  (item) => `Analyze this environmental impact assessment:
Title: ${item.title}
Category: ${item.category}
Scope: ${item.scope}
Current Emissions: ${item.current_emissions} tons CO2e
Projected Emissions: ${item.projected_emissions} tons CO2e
Reduction Target: ${item.reduction_target}%
Carbon Offset Cost: $${item.carbon_offset_cost}
Water Usage: ${item.water_usage} gallons
Waste Generated: ${item.waste_generated} tons
Sustainability Score: ${item.sustainability_score}/10
Initiatives: ${item.initiatives}

Provide: 1) Environmental impact analysis 2) Emissions reduction roadmap 3) Cost of sustainability 4) Regulatory compliance outlook 5) Best practice recommendations`
);
