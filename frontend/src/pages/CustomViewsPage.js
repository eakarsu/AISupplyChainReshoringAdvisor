import React from 'react';
import ScenarioComparisonChart from '../components/customViews/ScenarioComparisonChart';
import CostRiskHeatmap from '../components/customViews/CostRiskHeatmap';
import ReshoringAnalysisPdf from '../components/customViews/ReshoringAnalysisPdf';
import SupplierEvaluationRulesEditor from '../components/customViews/SupplierEvaluationRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>Reshoring Views</h1>
        <p style={{ margin: '6px 0 0', color: '#475569' }}>
          Custom dashboards & tools for reshoring scenario comparison, cost/risk heatmaps,
          PDF analysis export, and supplier-evaluation rule weights.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div><ScenarioComparisonChart /></div>
        <div><CostRiskHeatmap /></div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><ReshoringAnalysisPdf /></div>
        <div><SupplierEvaluationRulesEditor /></div>
      </section>
    </div>
  );
}
