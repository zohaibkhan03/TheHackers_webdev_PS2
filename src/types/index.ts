// ============================================
// LocalPulse - Core Data Types
// ============================================

export type Category =
  | 'internship'
  | 'lost-found'
  | 'events'
  | 'issues'
  | 'emergency'
  | 'general';

export type PostStatus =
  | 'draft'
  | 'active'
  | 'needs-review'
  | 'expired'
  | 'resolved'
  | 'removed';

export interface Location {
  city: string;
  area: string;
  pincode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  community: string;
  location: Location;
  role: 'user' | 'moderator' | 'admin';
  savedPosts: string[];
  followedPosts: string[];
  preferredCategories: Category[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    followed: boolean;
    nearby: boolean;
  };
}

export interface PostUpdate {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  type: 'update' | 'correction' | 'resolution';
}

export interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: PostStatus;
  authorId: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  eventDate?: string;
  resolvedAt?: string;
  images?: string[];
  tags?: string[];
  helpfulCount: number;
  validConfirmations: number;
  viewCount: number;
  updates: PostUpdate[];
  reports: Report[];
  isOfficial?: boolean;
  isVerified?: boolean;
  // Category-specific fields
  contactInfo?: string;
  deadline?: string;
  stipend?: string;
  organization?: string;
  lostItemName?: string;
  foundLocation?: string;
  reward?: string;
  eventVenue?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  externalLink?: string;
  sourceUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'update' | 'deadline' | 'correction' | 'resolution' | 'confirmation' | 'report';
  title: string;
  body: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  city: string;
  memberCount: number;
  postCount: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  internship: 'Internship & Scholarship',
  'lost-found': 'Lost & Found',
  events: 'Community Events',
  issues: 'Local Issues',
  emergency: 'Emergency & Alerts',
  general: 'General Announcements',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  internship: 'var(--color-internship)',
  'lost-found': 'var(--color-lost-found)',
  events: 'var(--color-events)',
  issues: 'var(--color-issues)',
  emergency: 'var(--color-emergency)',
  general: 'var(--color-success)',
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  'needs-review': 'Needs Review',
  expired: 'Expired',
  resolved: 'Resolved',
  removed: 'Removed',
};
