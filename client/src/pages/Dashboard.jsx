import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { documentsAPI, knowledgeAPI, maintenanceAPI, complianceAPI, lessonsAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [graphStats, setGraphStats] = useState(null);
  const [maint, setMaint] = useState(null);
  const [comp, setComp] = useState(null);
  const [lessons, setLessons] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      documentsAPI.getStats(), knowledgeAPI.getStats(),
      maintenanceAPI.getDashboard(), complianceAPI.getDashboard(), lessonsAPI.getDashboard()
    ]).then(([d, g, m, c, l]) => {
      if (d.status === 'fulfilled') setStats(d.value.data);
      if (g.status === 'fulfilled') setGraphStats(g.value.data);
      if (m.status === 'fulfilled') setMaint(m.value.data);
      if (c.status === 'fulfilled') setComp(c.value.data);
      if (l.status === 'fulfilled') setLessons(l.value.data);
    });
  }, []);

  const compScore = comp?.summary?.complianceScore || 0;
  const maintPie = maint?.summary ? [
    { name: 'Open', value: maint.summary.open || 0 },
    { name: 'Completed', value: maint.summary.completed || 0 },
    { name: 'Critical', value: maint.summary.critical || 0 },
  ].filter(d => d.value > 0) : [];

  const compBar = comp?.byRegulation?.map(r => ({
    name: r._id?.replace('OISD-', '').replace(' Standards', '').slice(0, 14),
    compliant: r.compliant, gaps: r.gaps,
  })) || [];

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-desc">Overview of industrial knowledge and operations.</div>
        </div>
        <div className="flex gap-2">
          <Link to="/documents" className="btn btn-primary">Upload Documents</Link>
          <Link to="/copilot" className="btn">Ask Copilot</Link>
        </div>
      </div>

      <div className="kpi-row">
        <div className="card kpi">
          <div className="kpi-label">Documents Ingested</div>
          <div className="kpi-value">{stats?.totalDocuments || 0}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Entities Extracted</div>
          <div className="kpi-value">{stats?.totalEntities || graphStats?.totalEntities || 0}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Knowledge Connections</div>
          <div className="kpi-value">{stats?.totalRelationships || graphStats?.totalRelationships || 0}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Compliance Score</div>
          <div className="kpi-value">{compScore}%</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Active Incidents</div>
          <div className="kpi-value">{lessons?.summary?.total || 0}</div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h3>Maintenance Status</h3>
            <Link to="/maintenance" className="btn btn-sm">View all</Link>
          </div>
          <div className="card-body">
            {maintPie.length > 0 ? (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={maintPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                      {maintPie.map((_, i) => <Cell key={i} fill={['var(--text-secondary)', 'var(--text-primary)', 'var(--text-tertiary)'][i % 3]} />)}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {maintPie.map((d, i) => (
                    <div key={d.name} className="flex justify-between items-center mb-2" style={{ fontSize: '13px' }}>
                      <span className="text-secondary">{d.name}</span>
                      <span className="mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="empty">No maintenance data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Compliance by Regulation</h3>
            <Link to="/compliance" className="btn btn-sm">View all</Link>
          </div>
          <div className="card-body">
            {compBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={compBar} barGap={0}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="compliant" fill="var(--text-primary)" radius={[2, 2, 0, 0]} name="Compliant" />
                  <Bar dataKey="gaps" fill="var(--text-tertiary)" radius={[2, 2, 0, 0]} name="Gaps" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty">No compliance data</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Incidents</h3>
          <Link to="/lessons" className="btn btn-sm">View all</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(lessons?.recentIncidents || []).slice(0, 6).map(inc => (
                <tr key={inc.incidentId}>
                  <td className="mono">{inc.incidentId}</td>
                  <td className="truncate" style={{ maxWidth: '300px' }}>{inc.title}</td>
                  <td>{inc.type?.replace(/_/g, ' ')}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot status-${inc.severity === 'critical' || inc.severity === 'high' ? 'error' : inc.severity === 'medium' ? 'warning' : 'success'}`} />
                      <span style={{ textTransform: 'capitalize' }}>{inc.severity}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{new Date(inc.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {(!lessons?.recentIncidents?.length) && <tr><td colSpan={5} className="empty">No incidents recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
