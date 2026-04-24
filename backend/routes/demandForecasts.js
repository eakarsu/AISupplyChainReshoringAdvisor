const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'demand_forecasts',
  'You are a demand forecasting and market analysis expert. Provide data-driven demand predictions and market insights for reshoring decisions. Format with clear sections.',
  (item) => `Analyze this demand forecast:
Product: ${item.product_name}
Category: ${item.category}
Region: ${item.region}
Period: ${item.forecast_period}
Current Demand: ${item.current_demand} units
Forecasted Demand: ${item.forecasted_demand} units
Growth Rate: ${item.growth_rate}%
Confidence: ${item.confidence_level}%
Seasonal Factor: ${item.seasonal_factor}
Market Trend: ${item.market_trend}
External Factors: ${item.external_factors}

Provide: 1) Demand trend analysis 2) Growth driver assessment 3) Risk factors to demand 4) Capacity planning recommendations 5) Market opportunity assessment`
);
