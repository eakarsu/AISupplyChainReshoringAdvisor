const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'inventory_items',
  'You are an inventory optimization expert specializing in supply chain reshoring transitions. Provide detailed inventory strategy recommendations. Format with clear sections.',
  (item) => `Analyze this inventory item:
Item: ${item.item_name} (SKU: ${item.sku})
Category: ${item.category}
Current Stock: ${item.current_stock}, Reorder Point: ${item.reorder_point}
Optimal Stock: ${item.optimal_stock}
Lead Time: ${item.lead_time_days} days
Unit Cost: $${item.unit_cost}
Holding Cost: ${item.holding_cost_pct}%
Stockout Risk: ${item.stockout_risk}
Supplier: ${item.supplier_name}
Warehouse: ${item.warehouse_location}

Provide: 1) Inventory optimization recommendations 2) Safety stock calculation 3) Reorder strategy 4) Cost reduction opportunities 5) Supplier diversification plan`
);
