const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'trade_agreements',
  'You are an international trade policy expert. Analyze trade agreements and their impact on reshoring strategies. Format with clear sections.',
  (item) => `Analyze this trade agreement:
Agreement: ${item.agreement_name}
Countries: ${item.countries}
Type: ${item.agreement_type}
Effective: ${item.effective_date}
Tariff Reduction: ${item.tariff_reduction}%
Key Provisions: ${item.key_provisions}
Affected Industries: ${item.affected_industries}
Rules of Origin: ${item.rules_of_origin}
Benefits: ${item.benefits}
Limitations: ${item.limitations}

Provide: 1) Agreement impact analysis 2) Reshoring implications 3) Compliance requirements 4) Strategic opportunities 5) Future outlook and recommendations`
);
