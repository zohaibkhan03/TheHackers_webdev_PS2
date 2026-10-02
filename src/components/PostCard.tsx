import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  MapPin, Clock, ThumbsUp, CheckCircle,
  Bookmark, BookmarkCheck, AlertTriangle, Shield, ArrowRight,
} from 'lucide-react';
import type { Post } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  index?: number;
  compact?: boolean;
}

const CATEGORY_ACCENT: Record<string, { color: string; bg: string }> = {
  internship:   { color: 'var(--color-internship)', bg: 'var(--color-internship-light)' },
  'lost-found': { color: 'var(--color-lost-found)', bg: 'var(--color-lost-found-light)' },
  events:       { color: 'var(--color-events-dark, #EA580C)', bg: 'var(--color-events-light)' },
  issues:       { color: 'var(--color-issues)', bg: 'var(--color-issues-light)' },
  emergency:    { color: 'var(--color-emergency)', bg: 'var(--color-emergency-light)' },
  general:      { color: 'var(--color-general)', bg: 'var(--color-general-light)' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  internship: '💼',
  'lost-found': '🔍',
  events: '📅',
  issues: '⚠️',
  emergency: '🚨',
  general: '📢',
};

export default function PostCard({ post, index = 0, compact = false }: PostCardProps) {
  const { isPostSaved, savePost, unsavePost, getUserById } = useAppStore();
  const saved = isPostSaved(post.id);
  const author = getUserById(post.authorId);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saved ? unsavePost(post.id) : savePost(post.id);
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const accent = CATEGORY_ACCENT[post.category] ?? CATEGORY_ACCENT.general;
  const isEmergency = post.category === 'emergency' && post.status === 'active';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          className="card"
          style={{
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            // Emergency gets a subtle left-border treatment
            borderLeft: isEmergency ? `3px solid var(--color-emergency)` : undefined,
          }}
        >
          {/* Emergency marker */}
          {isEmergency && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              background: 'var(--color-emergency)',
              fontSize: 11,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.06em',
            }}>
              <AlertTriangle size={11} />
              EMERGENCY — ACTIVE
            </div>
          )}

          {/* Image */}
          {!compact && post.images && post.images.length > 0 && (
            <div style={{
              height: 160,
              overflow: 'hidden',
              background: 'var(--color-surface-muted)',
            }}>
              <img
                src={post.images[0]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 450ms ease' }}
                loading="lazy"
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
              />
            </div>
          )}

          <div style={{ padding: compact ? '12px 14px' : '14px 16px' }}>
            {/* Top row: badge + save */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Category badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11,
                  fontWeight: 600,
                  background: accent.bg,
                  color: accent.color,
                  letterSpacing: '0.01em',
                }}>
                  {CATEGORY_EMOJI[post.category]} {CATEGORY_LABELS[post.category]}
                </span>

                {/* Official badge */}
                {post.isOfficial && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 10,
                    fontWeight: 600,
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                  }}>
                    <Shield size={9} /> Official
                  </span>
                )}
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: saved ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  padding: '3px 4px',
                  flexShrink: 0,
                  transition: 'color 150ms ease, transform 150ms ease',
                  display: 'flex',
                }}
                aria-label={saved ? 'Remove from saved' : 'Save post'}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: compact ? 13 : 14,
              fontWeight: 600,
              color: 'var(--color-text)',
              lineHeight: 1.35,
              marginBottom: 5,
              letterSpacing: '-0.01em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {post.title}
            </h3>

            {/* Description preview */}
            {!compact && (
              <p style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                marginBottom: 10,
              }}>
                {post.description}
              </p>
            )}

            {/* Category-specific callout pill */}
            {post.stipend && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-success-light)',
                color: 'var(--color-success)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 10,
              }}>
                ₹ {post.stipend}
              </div>
            )}
            {post.reward && !post.stipend && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-warning-light)',
                color: 'var(--color-warning)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 10,
              }}>
                Reward: ₹{post.reward}
              </div>
            )}
            {post.eventDate && post.status === 'active' && !post.stipend && !post.reward && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-events-light)',
                color: 'var(--color-events-dark, #C2410C)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 10,
              }}>
                <Clock size={10} />
                {new Date(post.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            )}

            {/* Footer: author, location, time, engagement */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              paddingTop: 10,
              borderTop: '1px solid var(--color-border)',
              marginTop: compact ? 4 : 0,
            }}>
              {/* Left: author + location + time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {author?.avatar && (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <span style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <MapPin size={10} style={{ flexShrink: 0 }} />
                  {post.location.area}
                  <span style={{ color: 'var(--color-border-strong)' }}>·</span>
                  {timeAgo}
                </span>
              </div>

              {/* Right: engagement + arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <ThumbsUp size={10} /> {post.helpfulCount}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <CheckCircle size={10} /> {post.validConfirmations}
                </span>
                <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
