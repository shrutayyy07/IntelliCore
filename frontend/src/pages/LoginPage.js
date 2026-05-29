import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, RotateCcw, Sun, Moon, FileText, Image, Layers } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = useRef([]);
  const { login, decodeUser } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.replace(/\D/g,'').length < 10) { setError('Please enter a valid phone number (min 10 digits)'); return; }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(phone);
      setDevOtp(res.data.otp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Is the backend running?');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKey = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, code, name || undefined);
      const token = res.data.token;
      const userData = decodeUser(token);
      login(token, userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Check the OTP and try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ flexDirection: 'column' }}>
      <button onClick={toggle} style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? 'Light' : 'Dark'}
      </button>

      <div style={{ display: 'flex', gap: 40, alignItems: 'center', maxWidth: 880, width: '100%' }}>
        {/* Left: Feature list */}
        <div style={{ flex: 1, display: 'none' }} className="auth-features">
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="logo-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>IC</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>IntelliCore</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Smart File Analytics</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>Upload, analyze, and validate documents with AI-powered metadata extraction and confidence scoring.</p>
          </div>
          {[
            { icon: FileText, label: 'PDF Metadata', desc: 'Extract pages, author, creation date via PDFBox' },
            { icon: Image, label: 'Image Vision', desc: 'Python OpenCV blur detection via ProcessBuilder' },
            { icon: Layers, label: 'Batch Processing', desc: 'Analyze all files with one click using Java threads' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, background: 'var(--accent-glow)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Auth card */}
        <div className="auth-card" style={{ maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div className="logo-icon" style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>IC</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>IntelliCore</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Smart File Analytics</div>
            </div>
          </div>

          {step === 'phone' && (
            <>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in with your phone number. We'll send you a one-time code.</p>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" className="form-input" style={{ paddingLeft: 36 }} placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} autoFocus />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, for new accounts)</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Shruti Sharma" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> Send OTP</>}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className="auth-title">Enter OTP</h1>
              <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{phone}</strong></p>
              {devOtp && (
                <div className="info-msg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🧪</span>
                  <span>Dev mode — OTP: <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, letterSpacing: '0.2em' }}>{devOtp}</strong></span>
                </div>
              )}
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleVerify}>
                <div className="form-group">
                  <label className="form-label">6-Digit Code</label>
                  <div className="otp-row" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i} ref={el => otpRefs.current[i] = el}
                        type="text" inputMode="numeric" maxLength={1}
                        className="otp-input" value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(e, i)}
                        autoFocus={i === 0} />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginBottom: 10 }}>
                  {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> Verify & Sign In</>}
                </button>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); setDevOtp(''); }}>
                  <RotateCcw size={13} /> Change Number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
