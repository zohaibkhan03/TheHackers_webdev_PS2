import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, Plus, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import PostCard from '../components/PostCard';
import type { Category, PostStatus } from '../types';
import { CATEGORY_LABELS } from '../types';
import { COMMUNITIES } from '../data/mockData';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Helpful' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'event-date', label: 'Event Date' },
];

const STATUS_FILTERS: { value: PostStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'expired', label: 'Expired' },
];

const CATEGORIES: Category[] = ['internship', 'lost-found', 'events', 'issues', 'emergency', 'general'];

const CAT_ICONS: Record<string, string> = {
  internship: '🎓', 'lost-found': '🔍', events: '📅',
  issues: '⚠️', emergency: '🚨', general: '📢',
};

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: 140 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 99 }} />
          <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const searchRef = useRef<HTMLInputElement>(null);

  const categoryParam = searchParams.get('category') as Category | null;
  const statusParam = (searchParams.get('status') as PostStatus | null) || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const locationParam = searchParams.get('location') || '';
  const queryParam = searchParams.get('q') || '';
  const communityParam = searchParams.get('community') || '';

  const { posts, getPostsByCommunity, setActiveCommunity, activeCommunity } = useAppStore();

  // Sync community param → global store so navbar/homepage stays in sync
  useEffect(() => {
    if (communityParam && communityParam !== activeCommunity) {
      setActiveCommunity(communityParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityParam]);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [categoryParam, statusParam, sortParam, queryParam, locationParam]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput.trim() || null);
  };

  // Filter and sort posts — community filter applied first via store selector
  const communitySourcePosts = communityParam && communityParam !== 'all'
    ? getPostsByCommunity(communityParam)
    : posts.filter(p => p.status !== 'draft' && p.status !== 'removed');

  const filteredPosts = communitySourcePosts
    .filter(p => {
      if (p.status === 'draft' || p.status === 'removed') return false;
      if (categoryParam && p.category !== categoryParam) return false;
      if (statusParam !== 'all' && p.status !== statusParam) return false;
      if (locationParam && !p.location.area.toLowerCase().includes(locationParam.toLowerCase())) return false;
      if (queryParam) {
        const q = queryParam.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some(t => t.includes(q)) ||
          CATEGORY_LABELS[p.category].toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortParam === 'popular') return b.helpfulCount - a.helpfulCount;
      if (sortParam === 'views') return b.viewCount - a.viewCount;
      if (sortParam === 'event-date' && a.eventDate && b.eventDate) {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const hasFilters = !!(categoryParam || (statusParam !== 'all') || queryParam || locationParam || communityParam);

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  return (
    <div style={{ paddingTop: 32, paddingBottom: 80, minHeight: '80dvh' }}>
      <div className="container-page">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}>
            Community Feed
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
            {categoryParam ? ` in ${CATEGORY_LABELS[categoryParam]}` : ''}
            {queryParam ? ` matching "${queryParam}"` : ''}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <div style={{
                flex: 1,
                minWidth: 240,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search posts..."
                  className="input"
                  style={{ paddingLeft: 38 }}
                  aria-label="Search posts"
                />
              </div>

              <select
                value={locationParam}
                onChange={e => updateParam('location', e.target.value)}
                className="input"
                style={{ width: 'auto', minWidth: 140 }}
                aria-label="Filter by location"
              >
                <option value="">All Areas</option>
                {COMMUNITIES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={sortParam}
                onChange={e => updateParam('sort', e.target.value)}
                className="input"
                style={{ width: 'auto', minWidth: 140 }}
                aria-label="Sort posts"
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ flexShrink: 0 }}
              >
                <Search size={15} />
                Search
              </button>

              <button
                type="button"
                className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flexShrink: 0 }}
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
            </div>
          </form>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'flex',
                  gap: 12,
                  paddingTop: 16,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}>
                  {STATUS_FILTERS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateParam('status', s.value)}
                      className="btn btn-sm"
                      style={{
                        background: statusParam === s.value ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                        color: statusParam === s.value ? 'white' : 'var(--color-text-secondary)',
                        border: `1px solid ${statusParam === s.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
          className="hide-scrollbar"
        >
          <button
            onClick={() => updateParam('category', null)}
            className="btn btn-sm"
            style={{
              background: !categoryParam ? 'var(--color-primary)' : 'var(--color-surface)',
              color: !categoryParam ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${!categoryParam ? 'var(--color-primary)' : 'var(--color-border)'}`,
              flexShrink: 0,
            }}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className="btn btn-sm"
              style={{
                background: categoryParam === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: categoryParam === cat ? 'white' : 'var(--color-text-secondary)',
                border: `1px solid ${categoryParam === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                flexShrink: 0,
                gap: 4,
              }}
            >
              {CAT_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Active filters chip */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Filters:</span>
            {categoryParam && (
              <span className="badge badge-internship">
                {CAT_ICONS[categoryParam]} {CATEGORY_LABELS[categoryParam]}
                <button onClick={() => updateParam('category', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}>
                  <X size={10} />
                </button>
              </span>
            )}
            {queryParam && (
              <span className="badge" style={{ background: 'var(--color-surface-muted)', color: 'var(--color-text-secondary)' }}>
                "{queryParam}"
                <button onClick={() => updateParam('q', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}>
                  <X size={10} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-border)',
          }}>
            <AlertTriangle size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--color-text)', marginBottom: 8 }}>
              No posts found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {hasFilters
                ? 'No posts match your current filters. Try adjusting or clearing them.'
                : 'No posts have been shared yet in this community.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {hasFilters && (
                <button onClick={clearFilters} className="btn btn-ghost">
                  Clear Filters
                </button>
              )}
              <Link to="/create" className="btn btn-primary">
                <Plus size={15} />
                Share an Update
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${categoryParam}-${statusParam}-${sortParam}-${queryParam}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              {filteredPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
