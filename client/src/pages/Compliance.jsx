import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { complianceAPI } from '../services/api';

const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' };

export default function Compliance() {
  const [dash, setDash] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [rules, setRules] = useState([]);
  const [audit, setAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [filterReg, setFilterReg] = useState('');

  useEffect(() => {
    Promise.all([
      complianceAPI.getDashboard(), complianceAPI.getGaps(), complianceAPI.getRules()
    ]).then(([d, g, r]) => { setDash(d.data); setGaps(g.data); setRules(r.data); }).catch(() => {});
  }, []);

  const genAudit = async () => {
    setAuditLoading(true); setAudit(null);
    try { const r = await complianceAPI.generateAuditPackage(filterReg || undefined); setAudit(r.data); } catch {}
    setAuditLoading(false);
  };

  const score = dash?.summary?.complianceScore || 0;
  const pieData = dash?.summary ? [
    { name: 'Compliant', value: dash.summary.compliant || 0 },
    { name: 'Gaps', value: dash.summary.gaps || 0 },
    { name: 'Pending', value: dash.summary.pending || 0 },
  ].filter(d => d.value > 0) : [];
  const regs = [...new Set(rules.map(r => r.regulation))];
  const filtered = filterReg ? rules.filter(r => r.regulation === filterReg) : rules;

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Compliance & Quality</div>
          <div className="page-desc">Regulatory tracking and gap analysis.</div>
        </div>
        <button className="btn btn-primary" onClick={genAudit} disabled={auditLoading}>
          {auditLoading ? 'Generating...' : 'Generate Audit Report'}
        </button>
      </div>

      <div className="kpi-row">
        <div className="card kpi"><div className="kpi-label">Compliance Score</div><div className="kpi-value">{score}%</div></div>
        <div className="card kpi"><div className="kpi-label">Compliant</div><div className="kpi-value">{dash?.summary?.compliant || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">Identified Gaps</div><div className="kpi-value" style={{ color: dash?.summary?.gaps > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>{dash?.summary?.gaps || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">Pending Review</div><div className="kpi-value">{dash?.summary?.pending || 0}</div></div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><h3>Status Distribution</h3></div>
          <div className="card-body">
            {pieData.length > 0 ? (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width="55%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={['var(--text-primary)', 'var(--status-error)', 'var(--text-tertiary)'][i]} />)}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 500, fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em', marginBottom: '12px' }}>{score}%</div>
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between" style={{ fontSize: '13px', marginBottom: '6px', width: '120px' }}>
                      <span className="text-secondary">{d.name}</span>
                      <span className="mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="empty">No compliance data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Critical & Major Gaps</h3></div>
          <div className="card-body" style={{ maxHeight: '220px', overflow: 'auto', padding: 0 }}>
            <table style={{ margin: 0 }}>
              <tbody>
                {gaps.filter(g => g.severity === 'critical' || g.severity === 'major').map((g, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`status-dot status-${g.severity === 'critical' ? 'error' : 'warning'}`} />
                        <span style={{ fontWeight: 500 }}>{g.regulation} — §{g.section}</span>
                      </div>
                      <p className="text-secondary" style={{ fontSize: '12px', marginTop: '4px' }}>{g.gapDescription}</p>
                    </td>
                  </tr>
                ))}
                {gaps.filter(g => g.severity === 'critical' || g.severity === 'major').length === 0 && <tr><td className="empty">No critical gaps</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(auditLoading || audit) && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>AI Audit Package</h3>
            {audit && <div className="text-secondary" style={{ fontSize: '12px' }}>{audit.compliant} compliant · {audit.gaps} gaps</div>}
          </div>
          <div className="card-body">
            {auditLoading ? <div className="text-secondary" style={{ fontSize: '13px' }}>Generating report based on current matrix...</div>
            : audit ? <div className="md-content"><ReactMarkdown>{audit.package}</ReactMarkdown></div> : null}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Compliance Matrix</h3>
          <select className="input" value={filterReg} onChange={e => setFilterReg(e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}>
            <option value="">All Regulations</option>
            {regs.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Regulation</th><th>Section</th><th>Requirement</th><th>Severity</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.regulation}</td>
                  <td className="mono text-secondary">{r.section}</td>
                  <td style={{ maxWidth: '400px' }} className="text-secondary truncate">{r.requirement}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot status-${r.severity === 'critical' ? 'error' : r.severity === 'major' ? 'warning' : 'muted'}`} />
                      <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{r.severity}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot status-${r.status === 'compliant' ? 'success' : r.status === 'gap' ? 'error' : 'warning'}`} />
                      <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{r.status?.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
