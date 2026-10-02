import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, CheckCheck, ArrowRight, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  update: <RefreshCw size={14} />,
  deadline: <Clock size={14} />,
  correction: <AlertCircle size={14} />,
  resolution: <CheckCheck size={14} />,
  confirmation: <Bell size={14} />,
  report: <AlertCircle size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  update: 'var(--color-primary)',
  deadline: 'var(--color-warning)',
  correction: 'var(--color-error)',
  resolution: 'var(--color-success)',
  confirmation: 'var(--color-info)',
  report: 'var(--color-error)',
};

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const userNotifs = notifications
    .filter(n => n.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unread = userNotifs.filter(n => !n.read).length;

  return (
    <div style={{ paddingTop: 36, paddingBottom: 80, minHeight: '80dvh' }}>
      <div className="container-page" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}>
              Notifications
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="btn btn-ghost btn-sm"
              style={{ gap: 6 }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {userNotifs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-border)',
          }}>
            <Bell size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>
              No notifications yet
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Follow posts and communities to receive updates here.
            </p>
            <Link to="/explore" className="btn btn-ghost">Browse Feed</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {userNotifs.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => {
                  markNotificationRead(notif.id);
                }}
                style={{
                  background: notif.read ? 'var(--color-surface)' : 'var(--color-primary-light)',
                  border: `1px solid ${notif.read ? 'var(--color-border)' : 'rgba(37,99,235,0.2)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  cursor: notif.postId ? 'pointer' : 'default',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  transition: 'all 150ms ease',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  background: `${TYPE_COLORS[notif.type]}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: TYPE_COLORS[notif.type],
                  flexShrink: 0,
                }}>
                  {TYPE_ICONS[notif.type]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 14,
                      fontWeight: notif.read ? 500 : 600,
                      color: 'var(--color-text)',
                      lineHeight: 1.3,
                    }}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        flexShrink: 0,
                        marginTop: 4,
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 6,
                  }}>
                    {notif.body}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                    {notif.postId && (
                      <Link
                        to={`/post/${notif.postId}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View post <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
