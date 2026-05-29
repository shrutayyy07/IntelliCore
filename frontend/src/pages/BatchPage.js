import React, { useState, useEffect, useRef } from 'react';
import { Play, Layers, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { batchApi, documentApi } from '../lib/api';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function BatchPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ic_batch_history') || '[]'); } catch { return []; }
  });
  const [currentRun, setCurrentRun] = useState(null);
  const pollRef = useRef();

  useEffect(() => {
    documentApi.getStats().then(r => setStats(r.data)).catch(() => {});
    return () => clearInterval(pollRef.current);
  }, []);

  const startBatch = async () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const startTime = new Date();
    setCurrentRun({ startTime, status: 'running' });

    try {
      await batchApi.start();
      pollRef.current = setInterval(async () => {
        try {
          const res = await batchApi.getProgress();
          setProgress(res.data.progress);

          if (!res.data.running || res.data.progress >= 100) {
            clearInterval(pollRef.current);
            setRunning(false);
            setProgress(100);

            // Refresh stats after batch
            const statsRes = await documentApi.getStats();
            setStats(statsRes.data);

            const entry = {
              id: Date.now(),
              startTime: startTime.toISOString(),
              endTime: new Date().toISOString(),
              total: statsRes.data.total,
              approved: statsRes.data.approved,
              rejected: statsRes.data.rejected,
              status: 'completed',
            };
            const newHistory = [entry, ...history].slice(0, 10);
            setHistory(newHistory);
            localStorage.setItem('ic_batch_history', JSON.stringify(newHistory));
            setCurrentRun(null);
          }
        } catch {
          clearInterval(pollRef.current);
          setRunning(false);
          const entry = { id: Date.now(), startTime: startTime.toISOString(), endTime: new Date().toISOString(), status: 'failed' };
          const newHistory = [entry, ...history].slice(0, 10);
          setHistory(newHistory);
          localStorage.setItem('ic_batch_history', JSON.stringify(newHistory));
          setCurrentRun(null);
        }
      }, 1200);
    } catch (err) {
      setRunning(false);
      setCurrentRun(null);
    }
  };

  const progressColor = progress < 40 ? 'var(--accent)' : progress < 80 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Batch</h1>
        <button className="btn btn-secondary" onClick={() => documentApi.getStats().then(r => setStats(r.data))}>
          <RefreshCw size={14} /> Refresh Stats
        </button>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
          {/* Main batch card */}
          <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
            <div style={{ width: 60, height: 60, background: 'var(--accent-glow)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Layers size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Batch Processing</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 24 }}>Run analysis on all your files in one click.</p>

            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span>Batch processing re-analyzes all uploaded files using metadata extraction, Python blur detection, and fuzzy logic scoring.</span>
            </div>

            <button className="btn btn-primary btn-full" style={{ marginBottom: 20, fontSize: 15, padding: '13px' }} onClick={startBatch} disabled={running}>
              {running ? <><span className="spinner" /> Processing...</> : <><Play size={15} /> Process {stats.total} Files</>}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              <span>Progress</span>
              <span style={{ fontWeight: 600, color: running ? progressColor : 'var(--text-muted)' }}>{progress}%</span>
            </div>
            <div className="progress-bar-wrap" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: progress + '%', background: progressColor }} />
            </div>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              {running
                ? `Processing ${stats.total} files — please wait...`
                : progress === 100
                ? '✓ Last batch completed successfully'
                : `${stats.total} files ready to process`}
            </p>
          </div>

          {/* Stats card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: 11 }}>Current Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Total', val: stats.total, color: 'var(--accent)' },
                  { label: 'Approved', val: stats.approved, color: 'var(--green)' },
                  { label: 'Rejected', val: stats.rejected, color: 'var(--red)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--bg-hover)', borderRadius: 10 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 12 }}>Pipeline Steps</div>
              {[
                { step: '1', label: 'Metadata Extraction', desc: 'PDFBox / Tika', color: 'var(--accent)' },
                { step: '2', label: 'Blur Detection', desc: 'Python OpenCV', color: 'var(--yellow)' },
                { step: '3', label: 'Fuzzy Logic Scoring', desc: 'AI 0–100 score', color: 'var(--green)' },
                { step: '4', label: 'Validation Engine', desc: 'Score < 70 → Rejected', color: 'var(--red)' },
              ].map(({ step, label, desc, color }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Batch history */}
        {history.length > 0 && (
          <div className="card" style={{ marginTop: 20, maxWidth: 900 }}>
            <div className="section-header">
              <span className="section-title">Batch History</span>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setHistory([]); localStorage.removeItem('ic_batch_history'); }}>Clear</button>
            </div>
            {history.map(h => (
              <div key={h.id} className="batch-history-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {h.status === 'completed' ? <CheckCircle size={15} color="var(--green)" /> : <XCircle size={15} color="var(--red)" />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {h.status === 'completed' ? `Processed ${h.total || '?'} files` : 'Batch failed'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Started {new Date(h.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {h.endTime && ` · Finished ${formatDate(h.endTime)}`}
                    </div>
                  </div>
                </div>
                {h.status === 'completed' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-green">{h.approved} approved</span>
                    {h.rejected > 0 && <span className="badge badge-red">{h.rejected} rejected</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
