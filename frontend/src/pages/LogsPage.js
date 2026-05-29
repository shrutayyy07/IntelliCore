import React, { useEffect, useState, useRef, useCallback } from 'react';
import { RefreshCw, Trash2, Download, Settings, Pause, Play } from 'lucide-react';
import { logsApi } from '../lib/api';

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'VISION'];
const LEVEL_COLORS = { INFO: '#3fb950', WARN: '#d29922', ERROR: '#f85149', VISION: '#58a6ff' };

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef();
  const intervalRef = useRef();

  const load = useCallback(async () => {
    try {
      const res = await logsApi.getLogs();
      setLogs([...res.data].reverse()); // oldest first for terminal
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, load]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleClear = async () => {
    await logsApi.clear();
    setLogs([]);
  };

  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.level} — ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `intellicore-logs-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = logs.filter(log => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = LEVELS.slice(1).reduce((acc, l) => {
    acc[l] = logs.filter(x => x.level === l).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Logs</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" onClick={() => setAutoRefresh(r => !r)} title={autoRefresh ? 'Pause auto-refresh' : 'Resume'}>
            {autoRefresh ? <Pause size={14} /> : <Play size={14} />}
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={14} /></button>
          <button className="btn btn-secondary" onClick={handleDownload}><Download size={14} /></button>
          <button className="btn btn-secondary" onClick={handleClear}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Logs</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Live updates from your system. Auto-refreshes every 3 seconds.</p>
        </div>

        {/* Level counters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {LEVELS.map(l => (
            <button key={l} className={`log-tab${levelFilter === l ? ' active' : ''}`} onClick={() => setLevelFilter(l)}>
              {l === 'ALL' ? `All (${logs.length})` : (
                <span>
                  <span style={{ color: LEVEL_COLORS[l], marginRight: 4 }}>●</span>
                  {l} {counts[l] > 0 && `(${counts[l]})`}
                </span>
              )}
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-primary)', fontSize: 12.5, outline: 'none', width: 180 }}
            />
          </div>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
            <span style={{ marginLeft: 8 }}>intellicore — logs</span>
            <span style={{ marginLeft: 'auto', fontSize: 11 }}>
              {autoRefresh && <span style={{ color: '#28c840' }}>● live</span>}
              {' '}{filtered.length} entries
            </span>
          </div>
          <div className="terminal-body" onScroll={e => {
            const el = e.currentTarget;
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
            setAutoScroll(atBottom);
          }}>
            {loading ? (
              <div style={{ color: '#8b949e', fontSize: 12 }}>Loading logs...</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: '#8b949e', fontSize: 12 }}>
                {logs.length === 0 ? 'No logs yet. Upload a file to get started.' : `No ${levelFilter} logs.`}
              </div>
            ) : (
              filtered.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className={`log-level-${log.level}`}>{log.level}</span>
                  <span className="log-msg">— {log.message}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
          {[
            { level: 'INFO', desc: 'File uploads, metadata extraction' },
            { level: 'WARN', desc: 'Low confidence scores, flagged files' },
            { level: 'ERROR', desc: 'Processing failures' },
            { level: 'VISION', desc: 'Python blur detection results' },
          ].map(({ level, desc }) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: LEVEL_COLORS[level], fontWeight: 700, fontFamily: 'monospace' }}>{level}</span>
              <span>— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
