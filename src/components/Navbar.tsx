import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Search, Plus, Menu, X, Sun, Moon,
  LayoutDashboard, Compass, User, Shield
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isDark, toggleDark, getUnreadCount, activeCommunity } = useAppStore();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}&community=${activeCommunity}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: null },
    { href: '/explore', label: 'Explore', icon: <Compass size={14} /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
  ];

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          background: scrolled
            ? isDark ? 'rgba(10,15,30,0.92)' : 'rgba(248,250,255,0.92)'
            : 'var(--color-bg)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
          transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="container-page" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              marginRight: 8,
              flexShrink: 0,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <circle cx="16" cy="13" r="5" fill="white" />
              <path d="M16 18C11.5 18 8 20.5 8 23.5V25H24V23.5C24 20.5 20.5 18 16 18Z" fill="white" />
              <circle cx="22" cy="9" r="3" fill="var(--color-accent)" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}>
              LocalPulse
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden-mobile">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive(link.href) ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 150ms ease',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {currentUser?.role === 'moderator' || currentUser?.role === 'admin' ? (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive('/admin') ? 600 : 400,
                  color: isActive('/admin') ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  background: isActive('/admin') ? 'var(--color-accent-light)' : 'transparent',
                }}
              >
                <Shield size={14} />
                Admin
              </Link>
            ) : null}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: 13,
                transition: 'all 150ms ease',
              }}
              className="hidden-mobile"
              aria-label="Open search"
            >
              <Search size={14} />
              Search...
              <span style={{
                padding: '1px 6px',
                background: 'var(--color-border)',
                borderRadius: 4,
                fontSize: 11,
                color: 'var(--color-text-muted)',
              }}>
                ⌘K
              </span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              style={{
                padding: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
              className="show-mobile"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              style={{
                padding: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 150ms ease',
              }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                style={{
                  position: 'relative',
                  padding: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  display: 'flex',
                }}
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    background: 'var(--color-error)',
                    borderRadius: '50%',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Create Post CTA */}
            {isAuthenticated && (
              <Link
                to="/create"
                className="btn btn-primary hidden-mobile"
                style={{ gap: 6, padding: '8px 16px', fontSize: 13 }}
              >
                <Plus size={15} />
                Share Update
              </Link>
            )}

            {/* User Avatar */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--color-border)',
                  flexShrink: 0,
                  display: 'flex',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease',
                  textDecoration: 'none',
                }}
                aria-label="Profile"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
            ) : (
              <Link to="/auth" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-surface)',
            zIndex: 'var(--z-overlay)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text)',
                  background: isActive(link.href) ? 'var(--color-primary-light)' : 'transparent',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link
              to="/create"
              className="btn btn-primary"
              style={{ marginTop: 16, justifyContent: 'center' }}
            >
              <Plus size={16} />
              Share Update
            </Link>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 16,
                color: 'var(--color-text)',
              }}
            >
              <User size={16} />
              Profile
            </Link>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '10vh 24px 24px',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '8px',
              width: '100%',
              maxWidth: 560,
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
                <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search posts, events, internships..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--color-border)',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Esc
                </button>
              </div>
            </form>
             <div style={{ padding: '8px 16px 16px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 8 }}>
                  Quick searches
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['internships', 'events', 'lost items', 'road issues', 'emergency'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        navigate(`/explore?q=${encodeURIComponent(term)}&community=${activeCommunity}`);
                        setSearchOpen(false);
                      }}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 100ms ease',
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
