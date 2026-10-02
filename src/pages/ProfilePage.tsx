import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Save, LogOut, Bell, MapPin, Tag, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../types';
import { CATEGORY_LABELS } from '../types';
import { COMMUNITIES } from '../data/mockData';
import { format } from 'date-fns';

const ALL_CATEGORIES: Category[] = ['internship', 'lost-found', 'events', 'issues', 'emergency', 'general'];

export default function ProfilePage() {
  const { currentUser, updateUser, logout, isDark } = useAppStore();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [community, setCommunity] = useState(currentUser?.community || '');
  const [notifEmail, setNotifEmail] = useState(currentUser?.notificationSettings.email ?? true);
  const [notifPush, setNotifPush] = useState(currentUser?.notificationSettings.push ?? true);
  const [notifFollowed, setNotifFollowed] = useState(currentUser?.notificationSettings.followed ?? true);
  const [notifNearby, setNotifNearby] = useState(currentUser?.notificationSettings.nearby ?? true);
  const [preferredCats, setPreferredCats] = useState<Category[]>(currentUser?.preferredCategories || []);

  const toggleCat = (cat: Category) => {
    setPreferredCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    updateUser({
      name,
      bio,
      community,
      preferredCategories: preferredCats,
      notificationSettings: {
        email: notifEmail,
        push: notifPush,
        followed: notifFollowed,
        nearby: notifNearby,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!currentUser) return null;

  return (
    <div style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div className="container-page" style={{ maxWidth: 600 }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--color-text)',
          letterSpacing: '-0.02em',
          marginBottom: 32,
        }}>
          Profile & Settings
        </h1>

        {/* Avatar Section */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--color-border)',
              }}
            />
            <button
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                background: 'var(--color-primary)',
                border: '2px solid var(--color-surface)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
              title="Change avatar"
              aria-label="Change profile picture"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
              {currentUser.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              {currentUser.email}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Member since {format(new Date(currentUser.joinedAt), 'MMMM yyyy')} · {currentUser.role}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information">
          <FormRow label="Display Name">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              aria-label="Display name"
            />
          </FormRow>
          <FormRow label="Bio">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="input"
              style={{ minHeight: 80, resize: 'vertical' }}
              placeholder="Tell your community a bit about yourself..."
              aria-label="Bio"
            />
          </FormRow>
          <FormRow label="Primary Community" icon={<MapPin size={14} />}>
            <select
              value={community}
              onChange={e => setCommunity(e.target.value)}
              className="input"
              aria-label="Primary community"
            >
              {COMMUNITIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormRow>
        </Section>

        {/* Preferred Categories */}
        <Section title="Preferred Categories" icon={<Tag size={16} />}>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            Personalize your feed. Selected categories appear first.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className="btn btn-sm"
                style={{
                  background: preferredCats.includes(cat) ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                  color: preferredCats.includes(cat) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${preferredCats.includes(cat) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  gap: 4,
                }}
                aria-pressed={preferredCats.includes(cat)}
              >
                {preferredCats.includes(cat) && <CheckCircle size={11} />}
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notification Preferences" icon={<Bell size={16} />}>
          {[
            { label: 'Email Notifications', desc: 'Receive updates via email', value: notifEmail, set: setNotifEmail },
            { label: 'Push Notifications', desc: 'Browser push notifications', value: notifPush, set: setNotifPush },
            { label: 'Followed Posts', desc: 'Updates on posts you follow', value: notifFollowed, set: setNotifFollowed },
            { label: 'Nearby Alerts', desc: 'Emergency alerts near you', value: notifNearby, set: setNotifNearby },
          ].map(pref => (
            <div key={pref.label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                  {pref.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pref.desc}</div>
              </div>
              <button
                onClick={() => pref.set(!pref.value)}
                role="switch"
                aria-checked={pref.value}
                aria-label={pref.label}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: pref.value ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 200ms ease',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 3,
                  left: pref.value ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
              </button>
            </div>
          ))}
        </Section>

        {/* Save + Logout */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 24 }}>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', gap: 6 }}
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <motion.button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ gap: 6 }}
            whileTap={{ scale: 0.97 }}
          >
            {saved ? (
              <>
                <CheckCircle size={15} />
                Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function FormRow({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
      }}>
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
