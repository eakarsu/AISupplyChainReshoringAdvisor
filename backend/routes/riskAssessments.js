const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'risk_assessments',
  'You are a supply chain risk management expert. Analyze reshoring risks with detailed mitigation strategies. Provide quantified risk assessments where possible. Format with clear sections.',
  (item) => `Analyze this reshoring risk assessment:
Title: ${item.title}
Category: ${item.category}
Current Supplier: ${item.current_supplier} (${item.current_country})
Target Country: ${item.target_country}
Risk Level: ${item.risk_level}, Score: ${item.risk_score}/10
Description: ${item.description}
Current Mitigation: ${item.mitigation_strategy}
Impact Area: ${item.impact_area}
Probability: ${item.probability}

Provide: 1) Detailed risk analysis 2) Probability and impact matrix 3) Enhanced mitigation strategies 4) Timeline for risk reduction 5) Key monitoring indicators`
);
