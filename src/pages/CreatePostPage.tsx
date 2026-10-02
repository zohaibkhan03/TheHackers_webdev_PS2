import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Check, AlertCircle,
  Briefcase, Search, Calendar, AlertTriangle, Bell, Megaphone,
  MapPin, Image, X, Eye
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Category, PostStatus } from '../types';
import { CATEGORY_LABELS } from '../types';
import { COMMUNITIES } from '../data/mockData';

const CATEGORIES: { id: Category; icon: React.ReactNode; desc: string }[] = [
  { id: 'internship', icon: <Briefcase size={22} />, desc: 'Jobs, internships, scholarships' },
  { id: 'lost-found', icon: <Search size={22} />, desc: 'Missing pets, items, people' },
  { id: 'events', icon: <Calendar size={22} />, desc: 'Local gatherings & happenings' },
  { id: 'issues', icon: <AlertTriangle size={22} />, desc: 'Roads, utilities, civic problems' },
  { id: 'emergency', icon: <Bell size={22} />, desc: 'Urgent safety alerts' },
  { id: 'general', icon: <Megaphone size={22} />, desc: 'Community news & announcements' },
];

const STEPS = ['Category', 'Details', 'Location & Date', 'Preview'];

interface FormData {
  category: Category | '';
  title: string;
  description: string;
  organization: string;
  stipend: string;
  deadline: string;
  contactInfo: string;
  reward: string;
  lostItemName: string;
  eventDate: string;
  eventVenue: string;
  severity: string;
  externalLink: string;
  area: string;
  pincode: string;
  images: string[];
  tags: string;
  status: PostStatus;
}

const initialForm: FormData = {
  category: '',
  title: '',
  description: '',
  organization: '',
  stipend: '',
  deadline: '',
  contactInfo: '',
  reward: '',
  lostItemName: '',
  eventDate: '',
  eventVenue: '',
  severity: '',
  externalLink: '',
  area: '',
  pincode: '',
  images: [],
  tags: '',
  status: 'draft',
};

export default function CreatePostPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const navigate = useNavigate();

  const { createPost, currentUser } = useAppStore();

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && !form.category) errs.category = 'Please select a category.';
    if (step === 1) {
      if (!form.title.trim()) errs.title = 'Title is required.';
      if (form.title.length < 10) errs.title = 'Title must be at least 10 characters.';
      if (!form.description.trim()) errs.description = 'Description is required.';
      if (form.description.length < 30) errs.description = 'Description must be at least 30 characters.';
    }
    if (step === 2 && !form.area) errs.area = 'Location area is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validate()) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const saveDraft = () => {
    if (!form.category || !form.title.trim()) return;
    createPost({
      ...buildPostData(),
      status: 'draft',
    });
    navigate('/dashboard');
  };

  const buildPostData = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category as Category,
    status: 'draft' as PostStatus,
    authorId: currentUser!.id,
    location: {
      city: 'Bengaluru',
      area: form.area || COMMUNITIES.find(c => c.id === 'koramangala')?.name || 'Bengaluru',
      pincode: form.pincode,
    },
    expiresAt: form.deadline || undefined,
    eventDate: form.eventDate || undefined,
    deadline: form.deadline || undefined,
    stipend: form.stipend || undefined,
    organization: form.organization || undefined,
    lostItemName: form.lostItemName || undefined,
    reward: form.reward || undefined,
    eventVenue: form.eventVenue || undefined,
    severity: (form.severity as 'low' | 'medium' | 'high' | 'critical') || undefined,
    externalLink: form.externalLink || undefined,
    contactInfo: form.contactInfo || undefined,
    images: form.images,
    tags: form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
  });

  const publish = () => {
    if (!validate()) return;
    createPost({
      ...buildPostData(),
      status: 'active',
    });
    setPublished(true);
    setTimeout(() => navigate('/explore'), 2500);
  };

  if (published) {
    return (
      <div style={{ minHeight: '80dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          <div style={{
            width: 72,
            height: 72,
            background: 'var(--color-success-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Check size={36} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>
            Update Published!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 8 }}>
            Your post is now live in the community feed.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Redirecting to feed...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80, paddingTop: 32 }}>
      <div className="container-page" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
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
              marginBottom: 20,
              padding: 0,
              fontFamily: 'var(--font-body)',
            }}
          >
            <ArrowLeft size={16} />
            Cancel
          </button>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Share Community Update
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Help your neighborhood stay informed.
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'background 300ms ease',
                  }} />
                )}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: i < step ? 'var(--color-primary)' : i === step ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: `2px solid ${i <= step ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 300ms ease',
                  flexShrink: 0,
                }}>
                  {i < step ? (
                    <Check size={14} style={{ color: 'white' }} />
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: i === step ? 'white' : 'var(--color-text-muted)' }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: i < step ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'background 300ms ease',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 11,
                color: i === step ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: i === step ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
                  What type of update is this?
                </h2>
                {errors.category && <ErrorMsg msg={errors.category} />}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { update('category', cat.id); setErrors({}); }}
                      style={{
                        padding: '20px 16px',
                        background: form.category === cat.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        border: `2px solid ${form.category === cat.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <span style={{ color: form.category === cat.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {cat.icon}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', marginBottom: 2 }}>
                          {CATEGORY_LABELS[cat.id]}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
                  Describe your update
                </h2>

                <FormField label="Title" error={errors.title} required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder={
                      form.category === 'internship' ? 'e.g., Software Internship at Razorpay - 45k/month' :
                      form.category === 'lost-found' ? 'e.g., Lost: Black Labrador near Koramangala BDA' :
                      form.category === 'events' ? 'e.g., Community Cleanup Drive - Jayanagar Park' :
                      form.category === 'emergency' ? 'e.g., Power Outage - HSR Layout Sector 2' :
                      'Clear, specific title...'
                    }
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    maxLength={120}
                    aria-label="Post title"
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 4 }}>
                    {form.title.length}/120
                  </div>
                </FormField>

                <FormField label="Description" error={errors.description} required>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Provide all relevant details. Be specific, accurate, and include any action items for the reader..."
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    style={{ minHeight: 140, resize: 'vertical' }}
                    aria-label="Post description"
                  />
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 4 }}>
                    {form.description.length} characters (30 min)
                  </div>
                </FormField>

                {/* Category-specific fields */}
                {form.category === 'internship' && (
                  <>
                    <FormField label="Organization">
                      <input type="text" value={form.organization} onChange={e => update('organization', e.target.value)}
                        placeholder="Company or institution name" className="input" aria-label="Organization" />
                    </FormField>
                    <FormField label="Stipend / Amount">
                      <input type="text" value={form.stipend} onChange={e => update('stipend', e.target.value)}
                        placeholder="e.g., 45,000/month or 1,00,000 one-time" className="input" aria-label="Stipend" />
                    </FormField>
                    <FormField label="Application Deadline">
                      <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                        className="input" aria-label="Deadline" />
                    </FormField>
                    <FormField label="Application Link or Contact">
                      <input type="url" value={form.externalLink} onChange={e => update('externalLink', e.target.value)}
                        placeholder="https://..." className="input" aria-label="External link" />
                    </FormField>
                  </>
                )}
                {form.category === 'lost-found' && (
                  <>
                    <FormField label="Item / Pet Name">
                      <input type="text" value={form.lostItemName} onChange={e => update('lostItemName', e.target.value)}
                        placeholder="e.g., Golden Retriever, Black Wallet" className="input" aria-label="Lost item name" />
                    </FormField>
                    <FormField label="Reward (optional)">
                      <input type="text" value={form.reward} onChange={e => update('reward', e.target.value)}
                        placeholder="e.g., 5,000" className="input" aria-label="Reward" />
                    </FormField>
                    <FormField label="Contact Information">
                      <input type="text" value={form.contactInfo} onChange={e => update('contactInfo', e.target.value)}
                        placeholder="Phone number or email" className="input" aria-label="Contact info" />
                    </FormField>
                  </>
                )}
                {form.category === 'events' && (
                  <>
                    <FormField label="Event Date & Time">
                      <input type="datetime-local" value={form.eventDate} onChange={e => update('eventDate', e.target.value)}
                        className="input" aria-label="Event date" />
                    </FormField>
                    <FormField label="Venue">
                      <input type="text" value={form.eventVenue} onChange={e => update('eventVenue', e.target.value)}
                        placeholder="Full address or landmark" className="input" aria-label="Venue" />
                    </FormField>
                    <FormField label="Registration Link (optional)">
                      <input type="url" value={form.externalLink} onChange={e => update('externalLink', e.target.value)}
                        placeholder="https://..." className="input" aria-label="Registration link" />
                    </FormField>
                  </>
                )}
                {form.category === 'issues' && (
                  <FormField label="Severity">
                    <select value={form.severity} onChange={e => update('severity', e.target.value)}
                      className="input" aria-label="Severity">
                      <option value="">Select severity</option>
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Significant disruption</option>
                      <option value="high">High - Major impact</option>
                      <option value="critical">Critical - Safety hazard</option>
                    </select>
                  </FormField>
                )}
                {form.category === 'emergency' && (
                  <div style={{
                    background: 'var(--color-error-light)',
                    border: '1px solid var(--color-error)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    fontSize: 13,
                    color: 'var(--color-error)',
                    marginBottom: 16,
                    display: 'flex',
                    gap: 8,
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    For real emergencies, contact police (100), fire (101), or ambulance (108) first. This platform supplements but does not replace emergency services.
                  </div>
                )}

                <FormField label="Tags (optional)">
                  <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)}
                    placeholder="Separate with commas: traffic, pothole, signal" className="input" aria-label="Tags" />
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
                  Location and timing
                </h2>

                <FormField label="Neighborhood / Area" error={errors.area} required>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <select
                      value={form.area}
                      onChange={e => update('area', e.target.value)}
                      className={`input ${errors.area ? 'input-error' : ''}`}
                      style={{ paddingLeft: 36 }}
                      aria-label="Area"
                    >
                      <option value="">Select area...</option>
                      {COMMUNITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      <option value="All of Bengaluru">All of Bengaluru</option>
                      <option value="Indiranagar">Indiranagar</option>
                      <option value="Jayanagar">Jayanagar</option>
                      <option value="MG Road">MG Road</option>
                      <option value="Dairy Circle">Dairy Circle</option>
                    </select>
                  </div>
                </FormField>

                <FormField label="Pincode (optional)">
                  <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value)}
                    placeholder="e.g., 560034" className="input" maxLength={6} aria-label="Pincode" />
                </FormField>

                <FormField label="Add Image URL (optional)">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="url"
                      id="img-url-input"
                      placeholder="https://picsum.photos/seed/yourimage/800/450"
                      className="input"
                      style={{ flex: 1 }}
                      aria-label="Image URL"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = document.getElementById('img-url-input') as HTMLInputElement;
                          if (input.value.trim()) {
                            setForm(prev => ({ ...prev, images: [...prev.images, input.value.trim()] }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        const input = document.getElementById('img-url-input') as HTMLInputElement;
                        if (input.value.trim()) {
                          setForm(prev => ({ ...prev, images: [...prev.images, input.value.trim()] }));
                          input.value = '';
                        }
                      }}
                    >
                      <Image size={15} /> Add
                    </button>
                  </div>
                  {form.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {form.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                            style={{
                              position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)',
                              border: 'none', borderRadius: 4, cursor: 'pointer', color: 'white', padding: 2,
                              display: 'flex',
                            }}
                            aria-label="Remove image"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormField>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
                  Review and publish
                </h2>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  marginBottom: 24,
                }}>
                  {form.images.length > 0 && (
                    <div style={{ height: 180, overflow: 'hidden', background: 'var(--color-surface-muted)' }}>
                      <img src={form.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    <span className={`badge badge-${form.category}`} style={{ marginBottom: 12, display: 'inline-flex' }}>
                      {CATEGORY_LABELS[form.category as Category]}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                      {form.title || 'Your title here'}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                      {form.description.substring(0, 200)}{form.description.length > 200 ? '...' : ''}
                    </p>
                    {form.area && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-muted)' }}>
                        <MapPin size={12} /> {form.area}, Bengaluru
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  background: 'var(--color-warning-light)',
                  border: '1px solid var(--color-warning)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: 13,
                  color: 'var(--color-warning)',
                  marginBottom: 24,
                  display: 'flex',
                  gap: 8,
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  By publishing, you confirm this information is accurate to the best of your knowledge. Intentionally false information may result in account suspension.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={back} className="btn btn-ghost">
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step > 0 && form.title.trim() && (
              <button
                onClick={saveDraft}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-text-muted)', fontSize: 13 }}
              >
                Save as Draft
              </button>
            )}
          </div>

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn btn-primary">
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  const post = createPost({ ...buildPostData(), status: 'draft' });
                  navigate('/dashboard');
                }}
                className="btn btn-ghost"
                style={{ gap: 6 }}
              >
                Save Draft
              </button>
              <button onClick={publish} className="btn btn-primary btn-lg">
                <Eye size={16} /> Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-text)',
        marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'var(--color-error)',
      marginTop: 6,
    }}>
      <AlertCircle size={12} />
      {msg}
    </div>
  );
}
