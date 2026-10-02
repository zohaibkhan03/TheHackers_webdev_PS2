import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, AlertTriangle, CheckCircle, X, Eye,
  Clock, Users, Flag, BarChart2, TrendingUp, FileText
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS, STATUS_LABELS, type Category } from '../types';
import { formatDistanceToNow } from 'date-fns';

type AdminTab = 'overview' | 'reports' | 'posts' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { posts, users, approveReport, dismissReport, changePostStatus, currentUser } = useAppStore();

  if (currentUser?.role === 'user') {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <Shield size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--color-text)', marginBottom: 8 }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          This area is for moderators and administrators only.
        </p>
        <Link to="/" className="btn btn-ghost">Go Home</Link>
      </div>
    );
  }

  // Compute stats
  const totalPosts = posts.filter(p => p.status !== 'draft').length;
  const activePosts = posts.filter(p => p.status === 'active').length;
  const postsNeedingReview = posts.filter(p => p.status === 'needs-review').length;
  const pendingReports = posts.flatMap(p => p.reports).filter(r => r.status === 'pending');
  const resolvedToday = posts.filter(p => {
    if (!p.resolvedAt) return false;
    return new Date(p.resolvedAt).toDateString() === new Date().toDateString();
  }).length;

  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'reports', label: 'Reports', count: pendingReports.length },
    { id: 'posts', label: 'All Posts', count: totalPosts },
    { id: 'users', label: 'Users', count: users.length },
  ];

  const postStatusColors: Record<string, string> = {
    active: 'var(--color-success)',
    resolved: 'var(--color-text-muted)',
    expired: 'var(--color-warning)',
    draft: 'var(--color-text-muted)',
    'needs-review': 'var(--color-error)',
    removed: 'var(--color-error)',
  };

  return (
    <div style={{ paddingTop: 36, paddingBottom: 80, minHeight: '80dvh' }}>
      <div className="container-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: 2,
            }}>
              Moderator Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Managing LocalPulse community quality
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 28,
          overflowX: 'auto',
        }}
          className="hide-scrollbar"
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--color-accent)' : 'transparent'}`,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                marginBottom: -1,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  padding: '1px 7px',
                  background: activeTab === tab.id ? 'var(--color-accent-light)' : 'var(--color-surface-muted)',
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview */}
            {activeTab === 'overview' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 14,
                  marginBottom: 32,
                }}>
                  {[
                    { label: 'Total Posts', value: totalPosts, icon: <FileText size={18} />, color: 'var(--color-primary)' },
                    { label: 'Active Now', value: activePosts, icon: <TrendingUp size={18} />, color: 'var(--color-success)' },
                    { label: 'Pending Reports', value: pendingReports.length, icon: <Flag size={18} />, color: 'var(--color-error)' },
                    { label: 'Need Review', value: postsNeedingReview, icon: <AlertTriangle size={18} />, color: 'var(--color-warning)' },
                    { label: 'Total Users', value: users.length, icon: <Users size={18} />, color: 'var(--color-info)' },
                    { label: 'Resolved Today', value: resolvedToday, icon: <CheckCircle size={18} />, color: 'var(--color-success)' },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        background: `${stat.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}>
                        {stat.icon}
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Posts needing review */}
                {postsNeedingReview > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>
                      Posts Needing Review
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {posts.filter(p => p.status === 'needs-review').map(post => (
                        <PostActionRow key={post.id} post={post} onAction={changePostStatus} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reports */}
            {activeTab === 'reports' && (
              <div>
                {pendingReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
                    <CheckCircle size={40} style={{ color: 'var(--color-success)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>
                      No pending reports
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                      All reports have been reviewed. Good work!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {posts.flatMap(post =>
                      post.reports
                        .filter(r => r.status === 'pending')
                        .map(report => {
                          const reporter = users.find(u => u.id === report.reporterId);
                          return (
                            <div key={report.id} style={{
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              borderLeft: '3px solid var(--color-error)',
                              borderRadius: 'var(--radius-lg)',
                              padding: '16px 20px',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <Flag size={13} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                                    <span className="badge" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                                      {report.reason}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                      by {reporter?.name || 'Unknown'} · {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', marginBottom: 4 }}>
                                    "{post.title.substring(0, 70)}..."
                                  </p>
                                  {report.details && (
                                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                      {report.details}
                                    </p>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <Link
                                    to={`/post/${post.id}`}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    <Eye size={12} /> View
                                  </Link>
                                  <button
                                    onClick={() => approveReport(post.id, report.id)}
                                    className="btn btn-sm"
                                    style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', border: 'none' }}
                                  >
                                    <AlertTriangle size={12} /> Flag Post
                                  </button>
                                  <button
                                    onClick={() => dismissReport(post.id, report.id)}
                                    className="btn btn-sm"
                                    style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none' }}
                                  >
                                    <X size={12} /> Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* All Posts */}
            {activeTab === 'posts' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.filter(p => p.status !== 'draft').map(post => (
                    <div key={post.id} style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 18px',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}>
                      <span className={`badge badge-${post.category}`} style={{ flexShrink: 0 }}>
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      <Link
                        to={`/post/${post.id}`}
                        style={{
                          flex: 1,
                          minWidth: 200,
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--color-text)',
                          textDecoration: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {post.title}
                      </Link>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: postStatusColors[post.status], fontWeight: 600 }}>
                          {STATUS_LABELS[post.status]}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                        {post.reports.length > 0 && (
                          <span className="badge" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                            <Flag size={9} /> {post.reports.length}
                          </span>
                        )}
                        <select
                          value={post.status}
                          onChange={e => changePostStatus(post.id, e.target.value as any)}
                          style={{
                            fontSize: 12,
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                          }}
                          aria-label={`Status for ${post.title}`}
                        >
                          <option value="active">Active</option>
                          <option value="needs-review">Needs Review</option>
                          <option value="resolved">Resolved</option>
                          <option value="expired">Expired</option>
                          <option value="removed">Remove</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map(user => (
                  <div key={user.id} style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 18px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge" style={{
                        background: user.role === 'moderator' ? 'var(--color-accent-light)' : user.role === 'admin' ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                        color: user.role === 'moderator' ? 'var(--color-accent)' : user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}>
                        {user.role}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {posts.filter(p => p.authorId === user.id).length} posts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostActionRow({ post, onAction }: { post: any; onAction: (id: string, status: any) => void }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: '3px solid var(--color-warning)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 18px',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <span className={`badge badge-${post.category}`}>{CATEGORY_LABELS[post.category as Category]}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text)', minWidth: 180 }}>
        {post.title.substring(0, 65)}...
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Link to={`/post/${post.id}`} className="btn btn-ghost btn-sm">
          <Eye size={12} /> View
        </Link>
        <button
          onClick={() => onAction(post.id, 'active')}
          className="btn btn-sm"
          style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none' }}
        >
          <CheckCircle size={12} /> Approve
        </button>
        <button
          onClick={() => onAction(post.id, 'removed')}
          className="btn btn-sm"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none' }}
        >
          <X size={12} /> Remove
        </button>
      </div>
    </div>
  );
}
