import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Clock, ThumbsUp, CheckCircle, Eye,
  Bookmark, BookmarkCheck, Bell, BellOff, Share2, Flag,
  AlertTriangle, Shield, ExternalLink, ChevronDown, ChevronUp,
  MessageSquare, Calendar, Phone
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [validClicked, setValidClicked] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const {
    getPostById, getUserById, isPostSaved, isPostFollowed,
    savePost, unsavePost, followPost, unfollowPost,
    markHelpful, confirmValid, incrementView, reportPost,
    addPostUpdate, resolvePost, currentUser,
  } = useAppStore();

  const post = getPostById(id!);
  const author = post ? getUserById(post.authorId) : null;

  useEffect(() => {
    if (post) {
      incrementView(post.id);
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!post) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', marginBottom: 8 }}>Post not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>This post may have been removed or never existed.</p>
        <Link to="/explore" className="btn btn-primary">
          <ArrowLeft size={15} /> Back to Feed
        </Link>
      </div>
    );
  }

  const saved = isPostSaved(post.id);
  const followed = isPostFollowed(post.id);
  const isOwner = currentUser?.id === post.authorId;

  const handleHelpful = () => {
    if (!helpfulClicked) { markHelpful(post.id); setHelpfulClicked(true); }
  };

  const handleValid = () => {
    if (!validClicked) { confirmValid(post.id); setValidClicked(true); }
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || !currentUser) return;
    reportPost(post.id, { reporterId: currentUser.id, reason: reportReason, details: reportDetails });
    setReportSuccess(true);
    setTimeout(() => { setShowReport(false); setReportSuccess(false); setReportReason(''); setReportDetails(''); }, 2000);
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim() || !currentUser) return;
    addPostUpdate(post.id, {
      content: updateText.trim(),
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      type: 'update',
    });
    setUpdateText('');
    setShowUpdate(false);
  };

  const handleResolve = () => {
    if (window.confirm('Mark this post as resolved? This will notify followers.')) {
      resolvePost(post.id);
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
    resolved: { bg: 'var(--color-surface-muted)', text: 'var(--color-text-muted)' },
    expired: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
    draft: { bg: 'var(--color-border)', text: 'var(--color-text-secondary)' },
    'needs-review': { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
    removed: { bg: 'var(--color-surface-muted)', text: 'var(--color-text-muted)' },
  };

  const statusStyle = statusColors[post.status];

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Emergency Banner */}
      {post.category === 'emergency' && post.status === 'active' && (
        <div style={{
          background: 'var(--color-emergency)',
          color: 'white',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
        }}>
          <AlertTriangle size={16} />
          EMERGENCY ALERT - Information may change rapidly. Follow for updates.
        </div>
      )}

      <div className="container-page" style={{ paddingTop: 32, maxWidth: 840 }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            marginBottom: 24,
            padding: 0,
            fontFamily: 'var(--font-body)',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Category & Status */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className={`badge badge-${post.category}`}>
              {CATEGORY_LABELS[post.category]}
            </span>
            <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>
              {STATUS_LABELS[post.status]}
            </span>
            {post.isOfficial && (
              <span className="badge" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Shield size={10} /> Official
              </span>
            )}
            {post.isVerified && (
              <span className="badge" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <CheckCircle size={10} /> Verified
              </span>
            )}
            {post.severity === 'critical' && (
              <span className="badge" style={{ background: 'var(--color-emergency)', color: 'white' }}>
                CRITICAL
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            {post.title}
          </h1>

          {/* Meta Row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: '1px solid var(--color-border)',
          }}>
            {author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={author.avatar} alt={author.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                <span>{author.name}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} />
              {post.location.area}, {post.location.city}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={13} />
              {post.viewCount.toLocaleString()} views
            </div>
          </div>
        </motion.div>

        {/* Main Image */}
        {post.images && post.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: 28,
              background: 'var(--color-surface-muted)',
              maxHeight: 400,
            }}
          >
            <img
              src={post.images[0]}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 400 }}
            />
          </motion.div>
        )}

        {/* Action Row */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleHelpful}
            className="btn btn-ghost btn-sm"
            style={{
              color: helpfulClicked ? 'var(--color-primary)' : undefined,
              background: helpfulClicked ? 'var(--color-primary-light)' : undefined,
            }}
            aria-label={`Mark as helpful (${post.helpfulCount} helpful)`}
          >
            <ThumbsUp size={14} />
            Helpful ({post.helpfulCount})
          </button>

          <button
            onClick={handleValid}
            className="btn btn-ghost btn-sm"
            style={{
              color: validClicked ? 'var(--color-success)' : undefined,
              background: validClicked ? 'var(--color-success-light)' : undefined,
            }}
            aria-label={`Confirm still valid (${post.validConfirmations} confirmations)`}
          >
            <CheckCircle size={14} />
            Still Valid ({post.validConfirmations})
          </button>

          <button
            onClick={() => followed ? unfollowPost(post.id) : followPost(post.id)}
            className="btn btn-ghost btn-sm"
            style={{
              color: followed ? 'var(--color-accent)' : undefined,
            }}
            aria-label={followed ? 'Unfollow post' : 'Follow for updates'}
          >
            {followed ? <BellOff size={14} /> : <Bell size={14} />}
            {followed ? 'Following' : 'Follow Updates'}
          </button>

          <button
            onClick={() => saved ? unsavePost(post.id) : savePost(post.id)}
            className="btn btn-ghost btn-sm"
            style={{
              color: saved ? 'var(--color-primary)' : undefined,
            }}
            aria-label={saved ? 'Remove from saved' : 'Save post'}
          >
            {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {saved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
            className="btn btn-ghost btn-sm"
            aria-label="Share post"
          >
            <Share2 size={14} />
            Share
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', color: 'var(--color-error)' }}
            aria-label="Report post"
          >
            <Flag size={14} />
            Report
          </button>
        </div>

        {/* Accuracy Notice */}
        <div style={{
          background: 'var(--color-info-light)',
          border: '1px solid var(--color-info)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: 12,
          color: 'var(--color-info)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertTriangle size={13} />
          Community-validated information. Confirmations indicate community agreement, not professional verification. Always check official sources for critical decisions.
        </div>

        {/* Description */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          marginBottom: 20,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 14,
          }}>
            Details
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
          }}>
            {post.description}
          </p>
        </div>

        {/* Category-Specific Info */}
        {(post.organization || post.stipend || post.deadline || post.contactInfo ||
          post.reward || post.eventDate || post.eventVenue || post.externalLink) && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            marginBottom: 20,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 16,
            }}>
              Key Information
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {post.organization && (
                <InfoRow icon={<Shield size={15} />} label="Organization" value={post.organization} />
              )}
              {post.stipend && (
                <InfoRow icon={<CheckCircle size={15} />} label="Stipend / Reward" value={`Rs ${post.stipend}`} />
              )}
              {post.reward && (
                <InfoRow icon={<CheckCircle size={15} />} label="Reward" value={`Rs ${post.reward}`} />
              )}
              {post.deadline && (
                <InfoRow
                  icon={<Calendar size={15} />}
                  label="Deadline"
                  value={format(new Date(post.deadline), 'MMMM d, yyyy')}
                />
              )}
              {post.eventDate && (
                <InfoRow
                  icon={<Calendar size={15} />}
                  label="Event Date"
                  value={format(new Date(post.eventDate), 'EEEE, MMMM d, yyyy - h:mm a')}
                />
              )}
              {post.eventVenue && (
                <InfoRow icon={<MapPin size={15} />} label="Venue" value={post.eventVenue} />
              )}
              {post.contactInfo && (
                <InfoRow icon={<Phone size={15} />} label="Contact" value={post.contactInfo} />
              )}
              {post.externalLink && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExternalLink size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, minWidth: 80 }}>Link</span>
                  <a
                    href={post.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', fontSize: 13, textDecoration: 'underline' }}
                  >
                    Open official page
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {post.tags.map(tag => (
              <Link
                key={tag}
                to={`/explore?q=${tag}`}
                style={{
                  padding: '4px 12px',
                  background: 'var(--color-surface-muted)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Update History */}
        {post.updates.length > 0 && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-heading)',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
              aria-expanded={showHistory}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />
                Update History ({post.updates.length})
              </span>
              {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showHistory && (
              <div style={{ borderTop: '1px solid var(--color-border)' }}>
                {post.updates.map((update, i) => {
                  const updateAuthor = getUserById(update.authorId);
                  return (
                    <div
                      key={update.id}
                      style={{
                        padding: '16px 24px',
                        borderBottom: i < post.updates.length - 1 ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {updateAuthor?.avatar && (
                          <img src={updateAuthor.avatar} alt={updateAuthor.name}
                            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                          {updateAuthor?.name}
                        </span>
                        <span className="badge" style={{
                          background: update.type === 'resolution' ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                          color: update.type === 'resolution' ? 'var(--color-success)' : 'var(--color-primary)',
                        }}>
                          {update.type}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                          {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        {update.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Owner Actions */}
        {(isOwner || currentUser?.role === 'moderator') && post.status === 'active' && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 20,
            marginBottom: 20,
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
              Manage Post
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowUpdate(!showUpdate)}
                className="btn btn-ghost btn-sm"
              >
                <MessageSquare size={13} />
                Post Update
              </button>
              <button
                onClick={handleResolve}
                className="btn btn-sm"
                style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none' }}
              >
                <CheckCircle size={13} />
                Mark Resolved
              </button>
              <Link
                to="/dashboard"
                className="btn btn-ghost btn-sm"
              >
                Edit Post
              </Link>
            </div>
          </div>
        )}

        {/* Add Update Form */}
        {showUpdate && (
          <form onSubmit={handleAddUpdate} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 20,
            marginBottom: 20,
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
              Add an Update
            </h3>
            <textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              placeholder="What's changed? Provide a clear, factual update..."
              className="input"
              style={{ minHeight: 100, resize: 'vertical', marginBottom: 12 }}
              required
              aria-label="Update text"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!updateText.trim()}>
                Post Update
              </button>
              <button type="button" onClick={() => setShowUpdate(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Report Modal */}
        {showReport && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 'var(--z-modal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setShowReport(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 28,
                maxWidth: 440,
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {reportSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle size={40} style={{ color: 'var(--color-success)', margin: '0 auto 12px' }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', marginBottom: 6 }}>Report Submitted</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Our moderators will review this post.</p>
                </div>
              ) : (
                <form onSubmit={handleReport}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                    Report this post
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                    Help us maintain accurate, safe information in our community.
                  </p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                      Reason
                    </label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="input"
                      required
                      aria-label="Report reason"
                    >
                      <option value="">Select a reason</option>
                      <option value="inaccurate">Inaccurate information</option>
                      <option value="duplicate">Duplicate post</option>
                      <option value="spam">Spam or irrelevant</option>
                      <option value="inappropriate">Inappropriate content</option>
                      <option value="resolved">Issue already resolved</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                      Additional details (optional)
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Provide any additional context..."
                      className="input"
                      style={{ minHeight: 80, resize: 'vertical' }}
                      aria-label="Report details"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-sm" style={{ background: 'var(--color-error)', color: 'white' }}>
                      Submit Report
                    </button>
                    <button type="button" onClick={() => setShowReport(false)} className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{value}</span>
    </div>
  );
}
