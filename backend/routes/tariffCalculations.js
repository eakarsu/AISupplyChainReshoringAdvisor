const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'tariff_calculations',
  'You are an international trade and tariff expert. Analyze tariff impacts on reshoring decisions with knowledge of current trade policies, HS codes, and trade agreements. Format with clear sections.',
  (item) => `Analyze this tariff calculation for reshoring impact:
Product: ${item.product_name}
HS Code: ${item.hs_code}
Origin: ${item.origin_country} → Destination: ${item.destination_country}
Product Value: $${item.product_value}
Tariff Rate: ${item.tariff_rate}%
Tariff Amount: $${item.tariff_amount}
Trade Agreement: ${item.trade_agreement}
Exemptions: ${item.exemptions}
Total Landed Cost: $${item.total_landed_cost}

Provide: 1) Tariff impact analysis 2) Alternative sourcing to reduce tariffs 3) Trade agreement opportunities 4) Exemption/exclusion possibilities 5) Total cost of ownership comparison`
);
