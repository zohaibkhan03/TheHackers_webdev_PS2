import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Edit, Trash2, CheckCircle, Clock, Eye, Bookmark,
  Bell, BarChart2, Plus, AlertTriangle, FileText, RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { formatDistanceToNow } from 'date-fns';

type Tab = 'my-posts' | 'drafts' | 'saved' | 'followed';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('my-posts');
  const navigate = useNavigate();

  const {
    currentUser, getUserPosts, getSavedPosts, getFollowedPosts,
    deletePost, publishPost, resolvePost, unsavePost, unfollowPost,
  } = useAppStore();

  const myPosts = getUserPosts(currentUser!.id).filter(p => p.status !== 'draft');
  const drafts = getUserPosts(currentUser!.id).filter(p => p.status === 'draft');
  const savedPosts = getSavedPosts();
  const followedPosts = getFollowedPosts();

  const TABS = [
    { id: 'my-posts' as Tab, label: 'My Posts', count: myPosts.length, icon: <FileText size={14} /> },
    { id: 'drafts' as Tab, label: 'Drafts', count: drafts.length, icon: <Edit size={14} /> },
    { id: 'saved' as Tab, label: 'Saved', count: savedPosts.length, icon: <Bookmark size={14} /> },
    { id: 'followed' as Tab, label: 'Following', count: followedPosts.length, icon: <Bell size={14} /> },
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
    resolved: { bg: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' },
    expired: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
    'needs-review': { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
    draft: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
    removed: { bg: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' },
  };

  const currentPosts =
    activeTab === 'my-posts' ? myPosts :
    activeTab === 'drafts' ? drafts :
    activeTab === 'saved' ? savedPosts :
    followedPosts;

  return (
    <div style={{ paddingTop: 36, paddingBottom: 80, minHeight: '80dvh' }}>
      <div className="container-page">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
            />
            <div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                marginBottom: 2,
              }}>
                {currentUser?.name}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {currentUser?.community} community
              </p>
            </div>
          </div>
          <Link to="/create" className="btn btn-primary" style={{ gap: 6 }}>
            <Plus size={15} />
            New Post
          </Link>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: 'Total Posts', value: myPosts.length + drafts.length, icon: <FileText size={16} />, color: 'var(--color-primary)' },
            { label: 'Total Views', value: myPosts.reduce((s, p) => s + p.viewCount, 0).toLocaleString(), icon: <Eye size={16} />, color: 'var(--color-info)' },
            { label: 'Helpful Votes', value: myPosts.reduce((s, p) => s + p.helpfulCount, 0), icon: <BarChart2 size={16} />, color: 'var(--color-success)' },
            { label: 'Confirmations', value: myPosts.reduce((s, p) => s + p.validConfirmations, 0), icon: <CheckCircle size={16} />, color: 'var(--color-accent)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 24,
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
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--color-primary)' : 'transparent'}`,
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
              <span style={{
                padding: '1px 7px',
                background: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-border)',
              }}>
                <AlertTriangle size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, color: 'var(--color-text)', marginBottom: 8 }}>
                  {activeTab === 'my-posts' ? 'No published posts yet' :
                   activeTab === 'drafts' ? 'No drafts saved' :
                   activeTab === 'saved' ? 'No saved posts' :
                   'Not following any posts'}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  {activeTab === 'my-posts' || activeTab === 'drafts'
                    ? 'Share something useful with your community.'
                    : 'Browse the feed and save posts you want to revisit.'}
                </p>
                {(activeTab === 'my-posts' || activeTab === 'drafts') && (
                  <Link to="/create" className="btn btn-primary">
                    <Plus size={15} /> Create Post
                  </Link>
                )}
                {(activeTab === 'saved' || activeTab === 'followed') && (
                  <Link to="/explore" className="btn btn-ghost">
                    Browse Feed
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentPosts.map((post, i) => {
                  const st = statusColors[post.status] || statusColors.active;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                        transition: 'box-shadow 200ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {/* Image thumbnail */}
                      {post.images && post.images.length > 0 && (
                        <div style={{
                          width: 72,
                          height: 72,
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'var(--color-surface-muted)',
                        }}>
                          <img src={post.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span className={`badge badge-${post.category}`}>
                            {CATEGORY_LABELS[post.category]}
                          </span>
                          <span className="badge" style={{ background: st.bg, color: st.color }}>
                            {STATUS_LABELS[post.status]}
                          </span>
                        </div>

                        <Link
                          to={`/post/${post.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--color-text)',
                            marginBottom: 6,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {post.title}
                          </h3>
                        </Link>

                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Eye size={11} /> {post.viewCount.toLocaleString()}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle size={11} /> {post.validConfirmations}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={11} /> {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {(activeTab === 'my-posts' || activeTab === 'drafts') && (
                          <>
                            {post.status === 'draft' && (
                              <button
                                onClick={() => publishPost(post.id)}
                                className="btn btn-sm"
                                style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none' }}
                                title="Publish post"
                              >
                                <RefreshCw size={12} /> Publish
                              </button>
                            )}
                            {post.status === 'active' && (
                              <button
                                onClick={() => resolvePost(post.id)}
                                className="btn btn-sm"
                                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none' }}
                                title="Mark resolved"
                              >
                                <CheckCircle size={12} /> Resolve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this post permanently?')) deletePost(post.id);
                              }}
                              className="btn btn-sm"
                              style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none' }}
                              title="Delete post"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                        {activeTab === 'saved' && (
                          <button
                            onClick={() => unsavePost(post.id)}
                            className="btn btn-ghost btn-sm"
                            title="Remove from saved"
                          >
                            <Bookmark size={12} /> Unsave
                          </button>
                        )}
                        {activeTab === 'followed' && (
                          <button
                            onClick={() => unfollowPost(post.id)}
                            className="btn btn-ghost btn-sm"
                            title="Unfollow post"
                          >
                            <Bell size={12} /> Unfollow
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
