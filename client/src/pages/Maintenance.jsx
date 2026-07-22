import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { maintenanceAPI } from '../services/api';

const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' };

export default function Maintenance() {
  const [dash, setDash] = useState(null);
  const [preds, setPreds] = useState([]);
  const [rca, setRca] = useState(null);
  const [rcaTag, setRcaTag] = useState('');
  const [rcaLoading, setRcaLoading] = useState(false);

  useEffect(() => {
    maintenanceAPI.getDashboard().then(r => setDash(r.data)).catch(() => {});
    maintenanceAPI.getPredictions().then(r => setPreds(r.data)).catch(() => {});
  }, []);

  const runRCA = async (tag) => {
    setRcaTag(tag); setRcaLoading(true); setRca(null);
    try { const r = await maintenanceAPI.generateRCA(tag); setRca(r.data); } catch {}
    setRcaLoading(false);
  };

  const dtData = dash?.equipmentStats?.slice(0, 8).map(e => ({ name: e.equipmentTag, hours: e.totalDowntime })) || [];

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Maintenance Intelligence</div>
          <div className="page-desc">Predictive insights and automated root cause analysis.</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="card kpi"><div className="kpi-label">Work Orders</div><div className="kpi-value">{dash?.summary?.total || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">Open</div><div className="kpi-value">{dash?.summary?.open || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">Completed</div><div className="kpi-value">{dash?.summary?.completed || 0}</div></div>
        <div className="card kpi"><div className="kpi-label">Critical</div><div className="kpi-value" style={{ color: dash?.summary?.critical > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>{dash?.summary?.critical || 0}</div></div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><h3>Equipment Downtime (hours)</h3></div>
          <div className="card-body">
            {dtData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dtData}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="hours" radius={[2, 2, 0, 0]}>{dtData.map((_, i) => <Cell key={i} fill="var(--text-primary)" />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty">No data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Predictive Risk Assessment</h3></div>
          <div className="card-body" style={{ maxHeight: '240px', overflow: 'auto', padding: '0' }}>
            <table style={{ margin: 0 }}>
              <thead><tr><th>Score</th><th>Equipment</th><th>Risk</th><th></th></tr></thead>
              <tbody>
                {preds.map((p, i) => (
                  <tr key={i}>
                    <td className="mono" style={{ color: p.riskLevel === 'Critical' ? 'var(--status-error)' : 'var(--text-primary)' }}>{p.riskScore}</td>
                    <td style={{ fontWeight: 500 }}>{p.equipmentTag}<br/><span className="text-secondary" style={{ fontSize: '11px', fontWeight: 400 }}>{p.recommendation}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`status-dot status-${p.riskLevel === 'Critical' ? 'error' : p.riskLevel === 'High' ? 'warning' : 'info'}`} />
                        <span style={{ fontSize: '12px' }}>{p.riskLevel}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}><button className="btn btn-sm" onClick={() => runRCA(p.equipmentTag)}>Run RCA</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(rcaLoading || rca) && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Root Cause Analysis — {rcaTag}</h3>
            {rca && (
              <div className="flex gap-2">
                <span className="text-secondary" style={{ fontSize: '12px' }}>{rca.totalDowntime}h downtime · ₹{(rca.totalCost / 1000).toFixed(0)}K cost · {rca.recordCount} records</span>
              </div>
            )}
          </div>
          <div className="card-body">
            {rcaLoading ? (
              <div className="flex items-center gap-2"><span className="text-secondary" style={{ fontSize: '13px' }}>Analyzing historical patterns...</span></div>
            ) : rca ? (
              <div className="md-content">
                <ReactMarkdown>{rca.analysis}</ReactMarkdown>
                {rca.failureModes?.length > 0 && (
                  <div className="mt-4 pt-4 flex gap-2 items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Modes</span>
                    {rca.failureModes.map((f, i) => <span key={i} className="tag">{f}</span>)}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Recent Maintenance Records</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Work Order</th><th>Equipment</th><th>Type</th><th>Priority</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(dash?.recentRecords || []).map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.workOrderId}</td>
                  <td style={{ fontWeight: 500 }}>{r.equipmentTag}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot status-${r.priority === 'critical' ? 'error' : r.priority === 'high' ? 'warning' : 'muted'}`} />
                      <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{r.priority}</span>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{r.status}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-sm" onClick={() => runRCA(r.equipmentTag)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>Analyze</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
