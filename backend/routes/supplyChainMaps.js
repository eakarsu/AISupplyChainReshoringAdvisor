const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'supply_chain_maps',
  'You are a supply chain mapping and network optimization expert. Analyze supply chain nodes and recommend reshoring opportunities. Format with clear sections.',
  (item) => `Analyze this supply chain node:
Name: ${item.name}
Product Line: ${item.product_line}
Tier: ${item.tier}, Node Type: ${item.node_type}
Location: ${item.location}, ${item.country}
Supplier: ${item.supplier_name}
Lead Time: ${item.lead_time_days} days
Risk Level: ${item.risk_level}
Dependencies: ${item.dependencies}
Alternatives: ${item.alternatives}

Provide: 1) Node criticality assessment 2) Reshoring feasibility 3) Alternative supplier analysis 4) Lead time optimization 5) Network resilience recommendations`
);
