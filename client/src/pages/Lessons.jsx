import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { lessonsAPI } from '../services/api';

const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' };

export default function Lessons() {
  const [dash, setDash] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    lessonsAPI.getDashboard().then(r => setDash(r.data)).catch(() => {});
    lessonsAPI.getAlerts().then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  const runAnalysis = async () => {
    setAnalysisLoading(true); setAnalysis(null);
    try { const r = await lessonsAPI.analyzePatterns(); setAnalysis(r.data); } catch {}
    setAnalysisLoading(false);
  };

  const typeData = dash?.summary?.byType ? Object.entries(dash.summary.byType).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v })) : [];

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Lessons Learned</div>
          <div className="page-desc">Operational intelligence from historical events.</div>
        </div>
        <button className="btn btn-primary" onClick={runAnalysis} disabled={analysisLoading}>
          {analysisLoading ? 'Analyzing...' : 'Run Pattern Analysis'}
        </button>
      </div>

      <div className="kpi-row">
        <div className="card kpi"><div className="kpi-label">Total Events</div><div className="kpi-value">{dash?.summary?.total || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">High / Critical</div><div className="kpi-value" style={{ color: ((dash?.summary?.bySeverity?.critical || 0) + (dash?.summary?.bySeverity?.high || 0)) > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>{(dash?.summary?.bySeverity?.critical || 0) + (dash?.summary?.bySeverity?.high || 0)}</div></div>
        <div className="card kpi"><div className="kpi-label">Active Alerts</div><div className="kpi-value" style={{ color: alerts.length > 0 ? 'var(--status-warning)' : 'var(--text-primary)' }}>{alerts.length}</div></div>
        <div className="card kpi"><div className="kpi-label">Patterns</div><div className="kpi-value">{dash?.topPatterns?.length || 0}</div></div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><h3>Events by Category</h3></div>
          <div className="card-body">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={typeData} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} fill="var(--text-primary)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty">No data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Proactive Alerts</h3></div>
          <div className="card-body" style={{ maxHeight: '220px', overflow: 'auto', padding: 0 }}>
            <table style={{ margin: 0 }}>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`status-dot status-${a.severity === 'critical' ? 'error' : a.severity === 'high' ? 'warning' : 'info'}`} />
                          <span style={{ fontWeight: 500 }}>{a.pattern}</span>
                        </div>
                        <span className="text-tertiary" style={{ fontSize: '11px' }}>{a.occurrences} matches</span>
                      </div>
                      <p className="text-secondary" style={{ fontSize: '12px', marginTop: '4px' }}>{a.warning}</p>
                    </td>
                  </tr>
                ))}
                {!alerts.length && <tr><td className="empty">No active alerts</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(analysisLoading || analysis) && (
        <div className="card mb-4">
          <div className="card-header"><h3>AI Pattern Analysis</h3></div>
          <div className="card-body">
            {analysisLoading ? <div className="text-secondary" style={{ fontSize: '13px' }}>Analyzing {dash?.summary?.total || 0} events for root cause patterns...</div>
            : analysis ? <div className="md-content"><ReactMarkdown>{analysis.analysis}</ReactMarkdown></div> : null}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Event Log</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Severity</th><th>Date</th></tr></thead>
            <tbody>
              {(dash?.recentIncidents || []).map(inc => (
                <tr key={inc.incidentId}>
                  <td className="mono text-secondary">{inc.incidentId}</td>
                  <td style={{ fontWeight: 500, maxWidth: '280px' }} className="truncate">{inc.title}</td>
                  <td style={{ textTransform: 'capitalize' }} className="text-secondary">{inc.type?.replace(/_/g, ' ')}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot status-${inc.severity === 'critical' || inc.severity === 'high' ? 'error' : inc.severity === 'medium' ? 'warning' : 'success'}`} />
                      <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{inc.severity}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{new Date(inc.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {!dash?.recentIncidents?.length && <tr><td colSpan={5} className="empty">No events logged</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
