const express = require('express');

const router = express.Router();

let constraints = [
  { id: 1, port: 'Lazaro Cardenas', lane: 'Port to Bajio site', chassisGap: 18, dwellHours: 42, borderImpact: 'medium', mitigation: 'reserve bonded dray capacity', status: 'watch' },
  { id: 2, port: 'Savannah', lane: 'Port to Carolinas site', chassisGap: 4, dwellHours: 18, borderImpact: 'none', mitigation: 'standard carrier pool', status: 'clear' },
  { id: 3, port: 'Vancouver', lane: 'Port to Alberta site', chassisGap: 12, dwellHours: 36, borderImpact: 'rail congestion', mitigation: 'dual-gate appointment plan', status: 'watch' }
];

router.get('/', (req, res) => {
  const summary = constraints.reduce((acc, row) => {
    acc.total += 1;
    acc.chassisGap += Number(row.chassisGap || 0);
    acc.watch += row.status === 'watch' ? 1 : 0;
    return acc;
  }, { total: 0, chassisGap: 0, watch: 0 });
  res.json({ constraints, summary });
});

router.post('/', (req, res) => {
  const item = {
    id: Date.now(),
    port: req.body.port || 'Port TBD',
    lane: req.body.lane || 'Lane TBD',
    chassisGap: Number(req.body.chassisGap || 0),
    dwellHours: Number(req.body.dwellHours || 0),
    borderImpact: req.body.borderImpact || 'pending',
    mitigation: req.body.mitigation || 'Mitigation pending',
    status: req.body.status || 'watch'
  };
  constraints = [item, ...constraints];
  res.status(201).json(item);
});

module.exports = router;
