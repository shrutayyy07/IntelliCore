import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Upload, FileText, CheckCircle, XCircle, Gauge, TrendingUp, AlertTriangle } from 'lucide-react';
import { documentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

function FileIcon({ ext }) {
  const e = (ext || '').toLowerCase();
  const cls = ['pdf','png','jpg','jpeg','gif','bmp','webp'].includes(e) ? e : 'default';
  return <div className={`file-icon ${cls}`}>{e.toUpperCase().slice(0,4) || 'FILE'}</div>;
}

function ScoreRing({ score, size = 44 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="score-ring-text" style={{ color, fontSize: size < 40 ? 9 : 11 }}>{Math.round(pct)}</span>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSize(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, averageScore: 0 });
  const [docs, setDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([documentApi.getStats(), documentApi.getAll()]);
      setStats(sRes.data);
      const sorted = [...dRes.data].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setAllDocs(sorted);
      setDocs(sorted.slice(0, 5));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Build last-7-days activity from real doc dates
  const activityData = (() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      counts[d.toDateString()] = 0;
    }
    allDocs.forEach(doc => {
      if (!doc.uploadedAt) return;
      const key = new Date(doc.uploadedAt).toDateString();
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([k, v]) => ({ day: dayNames[new Date(k).getDay()], files: v }));
  })();

  // Pie chart data
  const pieData = [
    { name: 'Approved', value: stats.approved || 0, color: 'var(--green)' },
    { name: 'Rejected', value: stats.rejected || 0, color: 'var(--red)' },
  ].filter(d => d.value > 0);

  // Blurry docs count
  const blurryCount = allDocs.filter(d => d.blurry).length;
  const pdfCount = allDocs.filter(d => d.ext === 'pdf').length;
  const imgCount = allDocs.filter(d => ['png','jpg','jpeg','gif','bmp','webp'].includes(d.ext || '')).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={14} /></button>
          <Link to="/upload" className="btn btn-primary"><Upload size={14} /> Upload file</Link>
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Here's a quick look at your files today.</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Files</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value blue">{stats.total}</div>
              <FileText size={22} color="var(--accent)" opacity={0.5} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              {pdfCount} PDF · {imgCount} Image
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value green">{stats.approved}</div>
              <CheckCircle size={22} color="var(--green)" opacity={0.5} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% pass rate
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value red">{stats.rejected}</div>
              <XCircle size={22} color="var(--red)" opacity={0.5} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              {blurryCount > 0 ? <span style={{ color: 'var(--yellow)' }}>⚠ {blurryCount} blurry image{blurryCount > 1 ? 's' : ''}</span> : 'No blurry images'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Score</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-value" style={{ color: stats.averageScore >= 70 ? 'var(--green)' : stats.averageScore >= 40 ? 'var(--yellow)' : 'var(--red)' }}>{stats.averageScore}</div>
              <Gauge size={22} color="var(--text-muted)" opacity={0.5} />
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: stats.averageScore + '%', background: stats.averageScore >= 70 ? 'var(--green)' : stats.averageScore >= 40 ? 'var(--yellow)' : 'var(--red)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts + Recent */}
        <div className="two-col" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="section-header">
              <span className="section-title">Upload Activity</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activityData} barSize={28}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="custom-tooltip" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                    <strong>{payload[0].payload.day}</strong>: {payload[0].value} file{payload[0].value !== 1 ? 's' : ''}
                  </div>
                ) : null} />
                <Bar dataKey="files" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">File Status</span>
            </div>
            {stats.total === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>No files yet</div>
            ) : (
              <div className="donut-wrap" style={{ justifyContent: 'center' }}>
                <PieChart width={120} height={120}>
                  <Pie data={pieData.length ? pieData : [{ name: 'Empty', value: 1, color: 'var(--border)' }]}
                    cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {(pieData.length ? pieData : [{ color: 'var(--border)' }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="donut-legend">
                  {[
                    { label: 'Approved', val: stats.approved, color: 'var(--green)' },
                    { label: 'Rejected', val: stats.rejected, color: 'var(--red)' },
                    { label: 'Total', val: stats.total, color: 'var(--accent)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="legend-item">
                      <div className="legend-dot" style={{ background: color }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Added */}
        <div className="recent-section">
          <div className="section-header">
            <span className="section-title">Recently Added</span>
            <Link to="/documents" className="view-all">View all →</Link>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : docs.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <FileText size={32} />
              <p>No documents yet. <Link to="/upload" style={{ color: 'var(--accent)' }}>Upload one</Link></p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['File', 'Type', 'Size', 'Score', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileIcon ext={doc.ext} />
                        <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}><span className="badge badge-gray">{(doc.ext || '—').toUpperCase()}</span></td>
                    <td style={{ padding: '10px', fontSize: 12.5, color: 'var(--text-muted)' }}>{formatSize(doc.fileSize)}</td>
                    <td style={{ padding: '10px' }}><ScoreRing score={doc.confidenceScore || 0} size={38} /></td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${doc.status === 'APPROVED' ? 'badge-green' : doc.status === 'REJECTED' ? 'badge-red' : 'badge-blue'}`}>
                        {doc.status === 'APPROVED' ? 'Uploaded' : doc.status === 'REJECTED' ? 'Rejected' : 'Processing'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
