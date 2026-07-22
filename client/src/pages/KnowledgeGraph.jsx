import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { HiOutlineSearch } from 'react-icons/hi';
import { knowledgeAPI } from '../services/api';

const typeColor = {
  equipment: 'var(--text-primary)',
  instrument: 'var(--text-secondary)',
  personnel: 'var(--status-info)',
  process: 'var(--status-warning)',
  regulation: 'var(--status-error)',
  document_ref: 'var(--status-success)',
  default: 'var(--text-tertiary)'
};

export default function KnowledgeGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    knowledgeAPI.getGraph({ type: filterType || undefined, search: search || undefined }).then(r => setData(r.data)).catch(() => {});
    knowledgeAPI.getStats().then(r => setStats(r.data)).catch(() => {});
  }, [filterType, search]);

  const onNodeClick = useCallback(async (node) => {
    setSelected(node);
    try { const r = await knowledgeAPI.getEntity(node.id); setDetails(r.data); } catch {}
    graphRef.current?.centerAt(node.x, node.y, 600);
    graphRef.current?.zoom(2.5, 600);
  }, []);

  const paintNode = useCallback((node, ctx, scale) => {
    const r = (node.val || 5) * 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    
    // Attempt to parse CSS var into a hard hex or fallback for canvas
    let fill = typeColor[node.type] || typeColor.default;
    if (fill.includes('var')) fill = getComputedStyle(document.documentElement).getPropertyValue(fill.replace('var(', '').replace(')', '')).trim() || '#888';
    
    ctx.fillStyle = fill;
    ctx.fill();
    
    if (selected?.id === node.id) { 
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#000';
      ctx.lineWidth = 1.5 / scale; 
      ctx.stroke(); 
    }
    
    if (scale > 0.8) {
      ctx.font = `${Math.max(10 / scale, 3)}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666'; 
      ctx.fillText(node.name, node.x, node.y + r + 2);
    }
  }, [selected]);

  const types = Object.keys(typeColor).filter(t => t !== 'default');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
        <div>
          <div className="page-title" style={{ marginBottom: '2px', fontSize: '18px' }}>Knowledge Graph</div>
          <div className="text-secondary" style={{ fontSize: '12px' }}>
            {stats ? `${stats.totalEntities} entities · ${stats.totalRelationships} relationships` : 'Loading network map...'}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input className="input" placeholder="Search entity..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '32px', width: '200px' }} />
          </div>
          <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '150px' }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }} ref={containerRef}>
        <div style={{ flex: 1, background: 'var(--bg-page)' }}>
          {data.nodes.length > 0 ? (
            <ForceGraph2D ref={graphRef} graphData={data} nodeCanvasObject={paintNode} onNodeClick={onNodeClick}
              linkColor={() => getComputedStyle(document.documentElement).getPropertyValue('--border-strong').trim() || '#ccc'} 
              linkWidth={1} linkDirectionalArrowLength={3} linkDirectionalArrowRelPos={1}
              backgroundColor="transparent" enableNodeDrag cooldownTicks={100} linkDirectionalParticles={0}
            />
          ) : <div className="empty" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Knowledge base is empty.</div>}
        </div>

        {details && (
          <div style={{ width: '340px', borderLeft: '1px solid var(--border-subtle)', padding: '24px', overflow: 'auto', background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Entity Details</span>
              <button className="btn btn-sm" onClick={() => { setDetails(null); setSelected(null); }} style={{ padding: '2px 6px', border: 'none', background: 'transparent' }}>✕</button>
            </div>
            
            <div className="mb-4">
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>{details.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-secondary" style={{ textTransform: 'capitalize', fontSize: '13px' }}>{details.type?.replace(/_/g, ' ')}</span>
                {details.subType && <span className="text-tertiary">·</span>}
                {details.subType && <span className="text-tertiary" style={{ textTransform: 'capitalize', fontSize: '13px' }}>{details.subType?.replace(/_/g, ' ')}</span>}
              </div>
            </div>

            {details.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>{details.description}</p>}

            {details.attributes && Object.keys(details.attributes).length > 0 && (
              <div className="mb-4">
                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Attributes</div>
                {Object.entries(details.attributes).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                    <span className="text-secondary" style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                    <span className="mono text-primary">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {details.connections?.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Connections ({details.connections.length})</div>
                <div className="flex flex-col gap-2">
                  {details.connections.map((c, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: c.direction === 'outgoing' ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{c.direction === 'outgoing' ? '→' : '←'}</span>
                        <span className="text-secondary" style={{ textTransform: 'capitalize' }}>{c.relationship?.replace(/_/g, ' ')}</span>
                      </div>
                      <div style={{ fontWeight: 500, paddingLeft: '18px' }}>{c.entity?.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
