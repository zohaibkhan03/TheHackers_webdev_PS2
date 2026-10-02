import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_USERS } from '../data/mockData';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('aditya@example.com');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'login') {
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user || password.length < 4) {
        setError('Invalid email or password. Try: aditya@example.com / demo1234');
        setLoading(false);
        return;
      }
      login(user.id);
      navigate('/');
    } else {
      if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
      if (!email.includes('@')) { setError('Enter a valid email.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      // For demo, log in as demo user after register
      login('user-demo');
      navigate('/explore');
    }
    setLoading(false);
  };

  const loginAsModerator = () => {
    login('user-mod');
    navigate('/admin');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      background: 'var(--color-bg)',
    }}>
      {/* Left Panel - Visual */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="hidden-mobile"
      >
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
              <circle cx="16" cy="13" r="5" fill="white" />
              <path d="M16 18C11.5 18 8 20.5 8 23.5V25H24V23.5C24 20.5 20.5 18 16 18Z" fill="white" />
              <circle cx="22" cy="9" r="3" fill="var(--color-accent)" />
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'white' }}>
              LocalPulse
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            marginBottom: 20,
          }}>
            Your neighborhood,
            <br />always informed.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: 380, marginBottom: 48 }}>
            Join thousands of residents sharing and discovering local news, events, emergencies, and opportunities.
          </p>

          {/* Testimonial */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
          }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
              "Found out about the gas leak near my apartment 20 minutes before the official announcement. LocalPulse literally kept my family safe."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src="https://picsum.photos/seed/testimonial-resident/40/40"
                alt="Meera K."
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Meera K.</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Whitefield resident</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--color-surface)',
      }}>
        {/* Mobile Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }} className="show-mobile">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <circle cx="16" cy="13" r="5" fill="white" />
            <path d="M16 18C11.5 18 8 20.5 8 23.5V25H24V23.5C24 20.5 20.5 18 16 18Z" fill="white" />
            <circle cx="22" cy="9" r="3" fill="var(--color-accent)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--color-text)' }}>LocalPulse</span>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 6,
            letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
            {mode === 'login' ? "Sign in to your LocalPulse account." : "Join your community on LocalPulse."}
          </p>

          {error && (
            <div style={{
              background: 'var(--color-error-light)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--color-error)',
              marginBottom: 20,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input"
                    style={{ paddingLeft: 38 }}
                    autoComplete="name"
                    aria-label="Full name"
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                  style={{ paddingLeft: 38 }}
                  autoComplete="email"
                  aria-label="Email address"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Your password' : 'Min 6 characters'}
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 16, padding: '12px', fontSize: 15 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                padding: '8px 0',
              }}
            >
              {mode === 'login' ? (
                <>New to LocalPulse? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create account</span></>
              ) : (
                <>Already have an account? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</span></>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: '1px solid var(--color-border)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, fontWeight: 500 }}>
              DEMO ACCOUNTS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setEmail('aditya@example.com'); setPassword('demo1234'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Community Member</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>aditya@example.com</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
              <button
                onClick={loginAsModerator}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--color-accent-light)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Moderator Account</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>priya.mod@localpulse.app</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
