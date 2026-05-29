import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Trash2, Eye, X, FileText, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import { documentApi } from '../lib/api';

function FileIcon({ ext }) {
  const e = (ext || '').toLowerCase();
  const cls = ['pdf','png','jpg','jpeg','gif','bmp','webp'].includes(e) ? e : 'default';
  return <div className={`file-icon ${cls}`}>{e.toUpperCase().slice(0,4) || 'FILE'}</div>;
}

function ScoreRing({ score, size = 38 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score || 0));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="score-ring-text" style={{ color, fontSize: 10 }}>{Math.round(pct)}</span>
    </div>
  );
}

function formatSize(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MetaModal({ doc, onClose }) {
  if (!doc) return null;
  const meta = doc.metadata || {};
  const isPdf = doc.ext === 'pdf';
  const isImg = ['png','jpg','jpeg','gif','bmp','webp'].includes(doc.ext || '');

  const fields = [
    { key: 'File Name', val: doc.fileName },
    { key: 'Extension', val: (doc.ext || '—').toUpperCase() },
    { key: 'MIME Type', val: doc.fileType || '—' },
    { key: 'File Size', val: formatSize(doc.fileSize) },
    { key: 'Confidence Score', val: Math.round(doc.confidenceScore || 0) + ' / 100' },
    { key: 'Status', val: doc.status },
    { key: 'Blur Detected', val: doc.blurry ? 'Yes ⚠' : 'No ✓' },
    { key: 'Uploaded At', val: formatDate(doc.uploadedAt) },
    isPdf && { key: 'Page Count', val: doc.pages || '—' },
    isPdf && { key: 'PDF Title', val: meta.title || '—' },
    isPdf && { key: 'Author', val: meta.author || '—' },
    isPdf && { key: 'Creator', val: meta.creator || '—' },
    isPdf && { key: 'Producer', val: meta.producer || '—' },
    isPdf && { key: 'Created', val: meta.creationDate || '—' },
    isImg && { key: 'Width', val: meta.width ? meta.width + 'px' : '—' },
    isImg && { key: 'Height', val: meta.height ? meta.height + 'px' : '—' },
    isImg && { key: 'Color Space', val: meta.colorSpace || '—' },
  ].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileIcon ext={doc.ext} />
            <div>
              <div className="modal-title" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(doc.uploadedAt)}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {/* Score + Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: 10 }}>
            <ScoreRing score={doc.confidenceScore} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Confidence Score: {Math.round(doc.confidenceScore || 0)}/100</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: (doc.confidenceScore || 0) + '%', background: (doc.confidenceScore || 0) >= 70 ? 'var(--green)' : 'var(--yellow)' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {(doc.confidenceScore || 0) >= 70 ? 'Passed validation threshold (≥ 70)' : 'Below threshold (< 70) — flagged for review'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span className={`badge ${doc.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                {doc.status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
              </span>
              {doc.blurry && <span className="blur-badge blur-yes">⚠ Blurry</span>}
              {!doc.blurry && isImg && <span className="blur-badge blur-no">✓ Clear</span>}
            </div>
          </div>

          {/* Meta fields */}
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
            {isPdf ? 'PDF Metadata (PDFBox)' : isImg ? 'Image Metadata (Vision)' : 'File Metadata (Tika)'}
          </div>
          <div className="meta-grid">
            {fields.map(({ key, val }) => (
              <div key={key} className="meta-item">
                <div className="meta-key">{key}</div>
                <div className="meta-val">{val}</div>
              </div>
            ))}
          </div>

          {/* Fuzzy Logic explanation */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-glow)', borderRadius: 10, border: '1px solid rgba(91,111,255,0.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>🧠 AI Score Breakdown (Fuzzy Logic)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Score computed from: File Type (0–25pts) + File Size (0–25pts) + Metadata Completeness (0–25pts) + {isImg ? 'Image Clarity (0–25pts)' : 'Page Count (0–25pts)'}. Total ≥ 70 → Approved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  const load = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getAll();
      setDocs(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...docs];
    if (search) result = result.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'Approved') result = result.filter(d => d.status === 'APPROVED');
    if (filter === 'Rejected') result = result.filter(d => d.status === 'REJECTED');
    if (filter === 'Blurry') result = result.filter(d => d.blurry);
    if (typeFilter === 'PDF') result = result.filter(d => d.ext === 'pdf');
    if (typeFilter === 'Image') result = result.filter(d => ['png','jpg','jpeg','gif','bmp','webp'].includes(d.ext || ''));
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      if (sortBy === 'score') return (b.confidenceScore || 0) - (a.confidenceScore || 0);
      if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
      if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
      return 0;
    });
    setFiltered(result);
  }, [docs, search, filter, typeFilter, sortBy]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    await documentApi.delete(id);
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div>
      {selected && <MetaModal doc={selected} onClose={() => setSelected(null)} />}

      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={14} /></button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} of {docs.length} files</span>
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Documents</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Search, filter, and manage every file.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} className="search-icon" />
            <input className="search-input" style={{ width: '100%' }} placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
            <option value="All">All status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Blurry">Blurry</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
            <option value="All">All types</option>
            <option value="PDF">PDF</option>
            <option value="Image">Image</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
            <option value="date">Sort: Date</option>
            <option value="score">Sort: Score</option>
            <option value="name">Sort: Name</option>
            <option value="size">Sort: Size</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Pages</th>
                <th>Score</th>
                <th>Blur</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="loading"><div className="spinner" /> Loading documents...</div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <FileText size={36} />
                    <h3>No documents found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id} onClick={() => setSelected(doc)} title="Click to view metadata">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileIcon ext={doc.ext} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(doc.fileSize)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{(doc.ext || '—').toUpperCase()}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{doc.pages || '—'}</td>
                  <td><ScoreRing score={doc.confidenceScore} /></td>
                  <td>
                    {['png','jpg','jpeg','gif','bmp','webp'].includes(doc.ext || '') ? (
                      <span className={`blur-badge ${doc.blurry ? 'blur-yes' : 'blur-no'}`}>{doc.blurry ? '⚠ Yes' : '✓ No'}</span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>N/A</span>}
                  </td>
                  <td>
                    <span className={`badge ${doc.status === 'APPROVED' ? 'badge-green' : doc.status === 'REJECTED' ? 'badge-red' : 'badge-blue'}`}>
                      {doc.status === 'APPROVED' ? 'Uploaded' : doc.status === 'REJECTED' ? 'Rejected' : 'Processing'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 8px' }} onClick={e => { e.stopPropagation(); setSelected(doc); }} title="View metadata">
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '5px 8px' }} onClick={e => handleDelete(e, doc.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
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
