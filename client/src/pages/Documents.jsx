import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineSearch, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { documentsAPI } from '../services/api';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    const [d, s] = await Promise.all([
      documentsAPI.getAll({ search: search || undefined }).catch(() => ({ data: [] })),
      documentsAPI.getStats().catch(() => ({ data: null }))
    ]);
    setDocs(d.data); setStats(s.data);
  };
  useEffect(() => { fetch(); }, [search]);

  const onDrop = useCallback(async (files) => {
    for (const file of files) {
      setUploading(true); setProgress(0);
      const fd = new FormData(); fd.append('file', file);
      try {
        await documentsAPI.upload(fd, e => setProgress(Math.round((e.loaded * 100) / e.total)));
        toast.success(`${file.name} uploaded`); fetch();
      } catch { toast.error(`Upload failed: ${file.name}`); }
    }
    setUploading(false); setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'], 'text/plain': ['.txt'] } });

  const del = async (id) => { await documentsAPI.delete(id).catch(() => {}); toast.success('Deleted'); fetch(); if (selected?._id === id) setSelected(null); };
  const view = async (id) => { const r = await documentsAPI.getById(id).catch(() => null); if (r) setSelected(r.data); };
  const fmtSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB';

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Document Hub</div>
          <div className="page-desc">Manage and process industrial documents.</div>
        </div>
      </div>

      <div {...getRootProps()} className={`dropzone mb-4 ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <h4>Processing...</h4>
            <div className="progress" style={{ maxWidth: '240px', margin: '12px auto' }}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <p>{progress}%</p>
          </>
        ) : (
          <>
            <h4>{isDragActive ? 'Drop files here' : 'Click or drag files to upload'}</h4>
            <p>PDF, XLSX, CSV, TXT</p>
          </>
        )}
      </div>

      {stats && (
        <div className="kpi-row">
          <div className="card kpi"><div className="kpi-label">Total Documents</div><div className="kpi-value" style={{ fontSize: '24px' }}>{stats.totalDocuments}</div></div>
          <div className="card kpi"><div className="kpi-label">Entities Mapped</div><div className="kpi-value" style={{ fontSize: '24px' }}>{stats.totalEntities}</div></div>
          <div className="card kpi"><div className="kpi-label">Graph Edges</div><div className="kpi-value" style={{ fontSize: '24px' }}>{stats.totalRelationships}</div></div>
          <div className="card kpi"><div className="kpi-label">Vector Embeddings</div><div className="kpi-value" style={{ fontSize: '24px' }}>{stats.totalEmbeddings}</div></div>
        </div>
      )}

      <div style={{ position: 'relative', margin: '24px 0 16px' }}>
        <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', maxWidth: '320px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px' }}>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d._id} style={{ cursor: 'pointer' }} onClick={() => view(d._id)}>
                    <td style={{ fontWeight: 500 }}>{d.originalName}</td>
                    <td style={{ textTransform: 'capitalize' }} className="text-secondary">{d.category?.replace(/_/g, ' ')}</td>
                    <td className="mono text-tertiary">{fmtSize(d.fileSize)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`status-dot status-${d.status === 'ready' ? 'success' : d.status === 'error' ? 'error' : 'warning'}`} />
                        <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{d.status}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm" onClick={e => { e.stopPropagation(); view(d._id); }} style={{ border: 'none', background: 'transparent', padding: '4px' }}><HiOutlineEye /></button>
                      <button className="btn btn-sm" onClick={e => { e.stopPropagation(); del(d._id); }} style={{ border: 'none', background: 'transparent', padding: '4px', color: 'var(--status-error)' }}><HiOutlineTrash /></button>
                    </td>
                  </tr>
                ))}
                {!docs.length && <tr><td colSpan={5} className="empty">No documents found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div className="card-header">
              <h3>Details</h3>
              <button className="btn btn-sm" onClick={() => setSelected(null)} style={{ padding: '2px 6px', border: 'none' }}>✕</button>
            </div>
            <div className="card-body">
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '20px' }}>{selected.originalName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', marginBottom: '24px' }}>
                <div><div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Category</div><div style={{ textTransform: 'capitalize' }}>{selected.category?.replace(/_/g, ' ')}</div></div>
                <div><div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Pages</div><div>{selected.pageCount}</div></div>
                <div><div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Entities</div><div>{selected.entities?.length || 0}</div></div>
                <div><div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Uploaded</div><div>{new Date(selected.uploadDate).toLocaleDateString('en-US')}</div></div>
              </div>

              {selected.entities?.length > 0 && (
                <div className="mb-4">
                  <div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Entities</div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {selected.entities.map((e, i) => <span key={i} className="tag">{e.name}</span>)}
                  </div>
                </div>
              )}

              {selected.extractedText && (
                <div>
                  <div className="text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Text Preview</div>
                  <pre style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)', maxHeight: '300px', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)' }}>
                    {selected.extractedText.slice(0, 1000)}{selected.extractedText.length > 1000 && '...'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
