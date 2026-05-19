# Audit Note — AISupplyChainReshoringAdvisor

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_08.md` (section 9).

## Original Recommendations

### Missing AI Counterparts (TSV said 0 endpoints — actual aiAdvanced.js has ~7)
- Labor cost prediction
- Site risk scoring
- Tariff impact forecasting

### Missing Non-AI Features
- Public data API integration (BLS, trade DB)
- Scenario modeling/comparison UI
- Feasibility scoring
- Project management for reshoring initiatives

### Custom Feature Suggestions
- Labor arbitrage modeling
- Supply chain resilience scoring
- Regulatory complexity assessment
- Build-vs-partner optimization
- Scenario planning (Monte Carlo)

## Implemented (this round)
1. `POST /api/ai/labor-cost-forecast` — labor cost trajectory by country/industry.
2. `POST /api/ai/site-risk-score` — multi-factor risk scoring for candidate sites.

Pattern reused: `queryOpenRouter` (returns `{content, parsed, model}`) + `parseAIJson` + `persistAI`. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** Tariff impact forecasting endpoint.
2. **MECHANICAL** Supply chain resilience scoring endpoint.
3. **NEEDS-CREDS** BLS / trade DB integrations.
4. **NEEDS-PRODUCT-DECISION** Reshoring project mgmt module.

## Apply pass 3 (frontend)

Frontend already calls both apply-pass-2 endpoints:

- `frontend/src/pages/LaborCostForecast.js` posts to `/ai/labor-cost-forecast`
  via the shared `api` axios helper (which attaches the JWT bearer from
  `localStorage`).
- `frontend/src/pages/SiteRiskScore.js` posts to `/ai/site-risk-score` the same
  way.
- `frontend/src/App.js` registers nav items and `<Route>`s for both at
  `/labor-cost-forecast` and `/site-risk-score`.

503-no-key responses bubble through `api.post`'s `.catch` and are displayed by
the existing error UI on each page. No FE changes required.

Action: **LEFT-AS-IS**.

## Apply pass 4 (mechanical backlog)

Drained both remaining mechanical backlog items. Reuse `queryOpenRouter`,
`parseAIJson`, `persistAI`, and the route-level `aiRateLimiter`:

1. `POST /api/ai/tariff-impact-forecast` — yearly tariff trajectory and
   landed cost between origin/destination, with policy scenarios.
2. `POST /api/ai/supply-chain-resilience-score` — multi-dimensional
   resilience scoring (concentration / geo / logistics / demand-shock)
   with prioritized actions.

Frontend (matches the existing `LaborCostForecast.js` /
`SiteRiskScore.js` pattern: `api.post`, JWT auto-attached, error UI,
`AiAnalysisDisplay`):
- New page `frontend/src/pages/TariffImpactForecast.js`.
- New page `frontend/src/pages/SupplyChainResilienceScore.js`.
- `frontend/src/App.js`: imports + sidebar nav buttons + `<Route>`s for
  `/tariff-impact-forecast` and `/supply-chain-resilience-score`.

503-no-key behaviour comes through `api.post`'s `.catch` and renders in
the existing red error block on each page.

Verification:
- `node --check backend/routes/aiAdvanced.js` → OK.
- `@babel/parser` (jsx) on `App.js`, `TariffImpactForecast.js`,
  `SupplyChainResilienceScore.js` → OK.

No new dependencies, no `npm install`.

### Remaining backlog
- NEEDS-CREDS: BLS / trade DB integrations.
- NEEDS-PRODUCT-DECISION: reshoring project-management module.
