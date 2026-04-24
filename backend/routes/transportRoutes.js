const createCrudRouter = require('./crudFactory');

module.exports = createCrudRouter(
  'transport_routes',
  'You are a logistics and transportation optimization expert. Analyze routes for efficiency, cost, and environmental impact. Format with clear sections.',
  (item) => `Analyze this transportation route:
Name: ${item.name}
Origin: ${item.origin} → Destination: ${item.destination}
Mode: ${item.transport_mode}
Distance: ${item.distance_km} km
Transit Time: ${item.transit_time_days} days
Cost per Unit: $${item.cost_per_unit}
Carbon Footprint: ${item.carbon_footprint} kg CO2
Reliability: ${item.reliability_score}/10
Carrier: ${item.carrier}

Provide: 1) Route efficiency analysis 2) Cost optimization opportunities 3) Alternative routes/modes 4) Carbon reduction strategies 5) Reliability improvement recommendations`
);
