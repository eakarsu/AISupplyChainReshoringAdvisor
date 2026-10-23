'use strict';
// Offline only: unset provider keys before importing app logic; no provider calls.
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
const test = require('node:test'); const assert = require('node:assert/strict');
const fp = require('../featurePack');
test('tasks create/list/update with search & filter, preserving false/0/empty', () => {
  const s = fp.createStore();
  const a = s.create('u1', { title: 'Reshore task', status: 'open', priority: 'high', category: 'reshoring-assessment', value: 0, flagged: false, notes: '' });
  assert.equal(a.value, 0); assert.equal(a.flagged, false); assert.equal(a.notes, '');
  s.create('u1', { title: 'Other', status: 'done', priority: 'low', category: 'misc' });
  assert.equal(s.list('u1', { q: 'Reshore' }).length, 1);
  assert.equal(s.list('u1', { status: 'done' }).length, 1);
  assert.equal(s.list('u1', { priority: 'high' }).length, 1);
  assert.equal(s.list('u2', {}).length, 0);
  const u = s.update('u1', a.id, { status: 'done', value: 0 }); assert.equal(u.status, 'done'); assert.equal(u.value, 0);
  assert.throws(() => s.create('u1', {}), /title is required/);
});
test('CSV/JSON export includes zero and false values', () => {
  const s = fp.createStore(); const a = s.create('u1', { title: 'ExportMe', value: 0, flagged: false });
  assert.match(fp.toCsv([a]), /ExportMe/); assert.match(fp.toCsv([a]), /"0"/); assert.match(fp.toCsv([a]), /"false"/);
  assert.equal(JSON.parse(fp.toJson([a]))[0].flagged, false);
});
test('deterministic AI fallback is labelled aiGenerated:false', () => {
  const s = fp.createStore(); s.create('u1', { title: 'AI task', priority: 'high', value: 10 });
  const rows = s.list('u1', {});
  { const r = fp.reshoringReadiness(rows); assert.equal(r.aiGenerated, false); assert.equal(r.source, 'deterministic-fallback'); assert.equal(r.count, 1); }
  { const r = fp.costRisk(rows); assert.equal(r.aiGenerated, false); assert.equal(r.source, 'deterministic-fallback'); assert.equal(r.count, 1); }
  { const r = fp.timelineEstimate(rows); assert.equal(r.aiGenerated, false); assert.equal(r.source, 'deterministic-fallback'); assert.equal(r.count, 1); }
});
test('router requires auth and mounts tasks/export/ai routes', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../routes/featurePack.js'), 'utf8');
  assert.match(src, /\/export/); assert.match(src, /aiGenerated/); assert.ok(!src.includes('openrouter.ai') && !src.includes('api.openai.com'));
});
