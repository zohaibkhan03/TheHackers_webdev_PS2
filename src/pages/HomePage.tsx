import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ArrowRight, MapPin, Plus, Briefcase,
  Calendar, AlertTriangle, Megaphone, ChevronDown,
  TrendingUp, Users, Zap, Bell,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import PostCard from '../components/PostCard';
import { COMMUNITIES } from '../data/mockData';
import { BUILT_IN_CATEGORIES } from '../types/categories';
import { useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

// Icon map for category definitions (using Lucide components directly)
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase size={18} />,
  Search: <Search size={18} />,
  Calendar: <Calendar size={18} />,
  AlertTriangle: <AlertTriangle size={18} />,
  Siren: <Zap size={18} />,
  Megaphone: <Megaphone size={18} />,
};

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    activeCommunity,
    setActiveCommunity,
    getPostsByCommunity,
    getCommunityStats,
    posts,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [communityOpen, setCommunityOpen] = useState(false);

  // Community-filtered posts
  const communityPosts = getPostsByCommunity(activeCommunity)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Emergency posts for THIS community
  const emergencyPosts = getPostsByCommunity(activeCommunity).filter(
    p => p.category === 'emergency' && p.status === 'active'
  );

  // Computed real stats from actual data
  const stats = getCommunityStats(activeCommunity);
  const activeCommunityData = COMMUNITIES.find(c => c.id === activeCommunity);

  // Per-category counts for the active community
  const categoryCounts = BUILT_IN_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = getPostsByCommunity(activeCommunity).filter(p => p.category === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  // GSAP Hero entrance — runs once
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-tag', { opacity: 0, y: 16, duration: 0.5 })
        .from('.hero-headline', { opacity: 0, y: 28, duration: 0.65 }, '-=0.25')
        .from('.hero-sub', { opacity: 0, y: 16, duration: 0.5 }, '-=0.35')
        .from('.hero-searchbar', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-ctas', { opacity: 0, y: 12, duration: 0.4 }, '-=0.25');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // GSAP scroll reveal for feed section
  useEffect(() => {
    if (!feedRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.feed-card', {
        opacity: 0,
        y: 20,
        stagger: { each: 0.07, from: 'start' },
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: feedRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, feedRef);
    return () => ctx.revert();
  }, [activeCommunity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}&community=${activeCommunity}`);
    } else {
      navigate(`/explore?community=${activeCommunity}`);
    }
  };

  const handleCommunityChange = (id: string) => {
    setActiveCommunity(id);
    setCommunityOpen(false);
  };

  return (
    <div>
      {/* ── Emergency Banner (community-scoped) ── */}
      <AnimatePresence>
        {emergencyPosts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--color-emergency)',
              color: 'white',
              padding: '9px 20px',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
              <Zap size={14} style={{ flexShrink: 0 }} />
              <span>
                {emergencyPosts.length} active alert{emergencyPosts.length > 1 ? 's' : ''} in{' '}
                <strong>{activeCommunityData?.name ?? 'your area'}</strong>
              </span>
              <Link
                to={`/explore?category=emergency&community=${activeCommunity}`}
                style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline', fontWeight: 500, fontSize: 12 }}
              >
                View →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          paddingTop: 'clamp(56px, 8vw, 96px)',
          paddingBottom: 'clamp(40px, 6vw, 72px)',
          background: 'var(--color-bg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        {/* Blue glow — top right */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="container-page" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>

            {/* Community selector tag */}
            <div className="hero-tag" style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setCommunityOpen(v => !v)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(37,99,235,0.2)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 150ms ease',
                  }}
                  aria-label="Change community"
                  aria-expanded={communityOpen}
                >
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    flexShrink: 0,
                    boxShadow: '0 0 0 2px rgba(22,163,74,0.3)',
                  }} />
                  <MapPin size={12} />
                  {activeCommunityData?.name ?? 'Select community'}
                  <ChevronDown size={12} style={{
                    transition: 'transform 200ms ease',
                    transform: communityOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>

                {/* Community Dropdown */}
                <AnimatePresence>
                  {communityOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 200,
                        minWidth: 220,
                        padding: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {/* "All Bengaluru" option */}
                      <button
                        onClick={() => handleCommunityChange('all')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: 'none',
                          cursor: 'pointer',
                          background: activeCommunity === 'all' ? 'var(--color-primary-light)' : 'transparent',
                          fontFamily: 'var(--font-body)',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'background 100ms ease',
                        }}
                        onMouseEnter={e => { if (activeCommunity !== 'all') e.currentTarget.style.background = 'var(--color-surface-muted)'; }}
                        onMouseLeave={e => { if (activeCommunity !== 'all') e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, color: activeCommunity === 'all' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                          All Bengaluru
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {posts.filter(p => p.status === 'active').length} posts
                        </span>
                      </button>

                      <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 6px' }} />

                      {COMMUNITIES.map(c => {
                        const count = getPostsByCommunity(c.id).length;
                        return (
                          <button
                            key={c.id}
                            onClick={() => handleCommunityChange(c.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              padding: '9px 12px',
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              background: activeCommunity === c.id ? 'var(--color-primary-light)' : 'transparent',
                              fontFamily: 'var(--font-body)',
                              textAlign: 'left',
                              width: '100%',
                              transition: 'background 100ms ease',
                            }}
                            onMouseEnter={e => { if (activeCommunity !== c.id) e.currentTarget.style.background = 'var(--color-surface-muted)'; }}
                            onMouseLeave={e => { if (activeCommunity !== c.id) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 500, color: activeCommunity === c.id ? 'var(--color-primary)' : 'var(--color-text)' }}>
                              {c.name}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              {count} posts
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Headline */}
            <h1
              className="hero-headline"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                marginBottom: 18,
              }}
            >
              Your neighborhood,
              <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                always informed.
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="hero-sub"
              style={{
                fontSize: 16,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                maxWidth: 480,
                marginBottom: 28,
              }}
            >
              Discover events, alerts, internships and civic issues.
              Shared and verified by your neighbors in real time.
            </p>

            {/* Search bar */}
            <form className="hero-searchbar" onSubmit={handleSearch} style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
                onFocusCapture={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'var(--color-primary)';
                  el.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                }}
                onBlurCapture={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'var(--color-border)';
                  el.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 16, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events, internships, issues…"
                  style={{
                    flex: 1,
                    padding: '13px 12px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: 'var(--color-text)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    minWidth: 0,
                  }}
                  aria-label="Search posts"
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 18px',
                    margin: 5,
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    transition: 'background 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTAs */}
            <div className="hero-ctas" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to={`/explore?community=${activeCommunity}`}
                className="btn btn-primary btn-lg"
                style={{ gap: 7, fontSize: 14 }}
              >
                Explore Feed
                <ArrowRight size={15} />
              </Link>
              <Link to="/create" className="btn btn-ghost btn-lg" style={{ gap: 7, fontSize: 14 }}>
                <Plus size={15} />
                Share Update
              </Link>
            </div>

            {/* Computed stats row */}
            <div style={{
              display: 'flex',
              gap: 28,
              marginTop: 36,
              paddingTop: 24,
              borderTop: '1px solid var(--color-border)',
              flexWrap: 'wrap',
            }}>
              <StatItem
                value={stats.activePosts > 0 ? stats.activePosts.toString() : '—'}
                label="Active posts"
                icon={<TrendingUp size={13} />}
              />
              <StatItem
                value={stats.memberCount > 999 ? `${(stats.memberCount / 1000).toFixed(1)}k` : stats.memberCount.toString()}
                label="Members"
                icon={<Users size={13} />}
              />
              <StatItem
                value={COMMUNITIES.length.toString()}
                label="Neighborhoods"
                icon={<MapPin size={13} />}
              />
              {stats.emergencyCount > 0 && (
                <StatItem
                  value={stats.emergencyCount.toString()}
                  label="Active alerts"
                  icon={<Bell size={13} />}
                  highlight
                />
              )}
            </div>
          </div>
        </div>

        {/* Dismiss dropdown on outside click */}
        {communityOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setCommunityOpen(false)}
          />
        )}
      </section>

      {/* ── CATEGORY PILLS ── */}
      <section style={{
        padding: '28px 0',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container-page">
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 2,
          }} className="hide-scrollbar">
            {BUILT_IN_CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.id}&community=${activeCommunity}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: 'var(--color-bg)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 180ms var(--ease-out-expo)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = cat.color;
                    e.currentTarget.style.color = cat.color;
                    e.currentTarget.style.background = cat.colorLight;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text)';
                    e.currentTarget.style.background = 'var(--color-bg)';
                  }}
                >
                  <span style={{ color: cat.color }}>
                    {CATEGORY_ICON_MAP[cat.iconName]}
                  </span>
                  {cat.shortLabel}
                  {count > 0 && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-surface-muted)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY FEED ── */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 0' }}>
        <div className="container-page">
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeCommunity}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.02em',
                    marginBottom: 4,
                  }}
                >
                  {activeCommunity === 'all'
                    ? 'Latest from Bengaluru'
                    : `Latest from ${activeCommunityData?.name ?? activeCommunity}`}
                </motion.h2>
              </AnimatePresence>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {stats.activePosts} active post{stats.activePosts !== 1 ? 's' : ''} in this community
              </p>
            </div>
            <Link
              to={`/explore?community=${activeCommunity}`}
              className="btn btn-ghost btn-sm"
              style={{ gap: 5, fontSize: 13 }}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feed grid */}
          <div ref={feedRef}>
            {communityPosts.length === 0 ? (
              <EmptyFeed communityName={activeCommunityData?.name} activeCommunity={activeCommunity} />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 14,
              }}>
                {communityPosts.map((post, i) => (
                  <div key={post.id} className="feed-card">
                    <PostCard post={post} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (compact) ── */}
      <section style={{
        padding: 'clamp(40px, 5vw, 64px) 0',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div className="container-page">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {[
              { step: '01', title: 'Share', body: 'Post local events, issues, or alerts that matter to your neighborhood.', icon: <Plus size={18} />, color: 'var(--color-primary)' },
              { step: '02', title: 'Validate', body: 'Neighbors confirm, update, or correct—building collective accuracy.', icon: <Users size={18} />, color: 'var(--color-accent)' },
              { step: '03', title: 'Stay informed', body: 'Follow posts and get notified when situations evolve or resolve.', icon: <Bell size={18} />, color: 'var(--color-success)' },
            ].map(step => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: 24,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: `${step.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.color,
                  marginBottom: 14,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  position: 'absolute',
                  top: 18,
                  right: 20,
                  fontFamily: 'var(--font-heading)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--color-border-strong)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {step.step}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: 6,
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{
        padding: 'clamp(48px, 7vw, 80px) 24px',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
            letterSpacing: '-0.025em',
          }}>
            Your neighborhood needs your voice.
          </h2>
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.78)',
            marginBottom: 28,
            maxWidth: 440,
            margin: '0 auto 28px',
          }}>
            Share what you know. Help your community stay informed and safe.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/create"
              className="btn btn-lg"
              style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700, gap: 7 }}
            >
              <Plus size={16} />
              Share an Update
            </Link>
            <Link
              to={`/explore?community=${activeCommunity}`}
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', gap: 7 }}
            >
              Explore Feed
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// ── Sub-components ──

function StatItem({ value, label, icon, highlight }: {
  value: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 22,
        fontWeight: 700,
        color: highlight ? 'var(--color-error)' : 'var(--color-text)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 12,
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {icon} {label}
      </div>
    </div>
  );
}

function EmptyFeed({ communityName, activeCommunity }: { communityName?: string; activeCommunity: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        textAlign: 'center',
        padding: 'clamp(40px, 6vw, 72px) 24px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px dashed var(--color-border)',
      }}
    >
      <MapPin size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 14px' }} />
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 18,
        color: 'var(--color-text)',
        marginBottom: 8,
        fontWeight: 700,
      }}>
        No posts yet in {communityName ?? 'this community'}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
        Be the first to share something. Or browse all neighborhoods to see what's happening citywide.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/create" className="btn btn-primary" style={{ gap: 6 }}>
          <Plus size={14} /> Post an update
        </Link>
        <Link
          to="/explore"
          className="btn btn-ghost"
          style={{ gap: 6 }}
        >
          Browse all posts
        </Link>
      </div>
    </motion.div>
  );
}
