// ============================================
// LocalPulse - Shared Category Data Model
// Single source of truth for all category metadata.
// Extensible: future moderator-approved custom categories
// can be added at runtime without changing this file.
// ============================================

import type { Category } from './index';

export interface CategoryDefinition {
  id: Category | string; // string allows future custom categories
  label: string;
  shortLabel: string;
  description: string;
  /** Lucide icon name — resolved in CategoryIcon component */
  iconName: string;
  /** CSS custom property reference */
  color: string;
  colorLight: string;
  /** Whether this category can trigger emergency banners */
  isUrgent: boolean;
  /** Whether this is a built-in category or custom/moderator-added */
  isBuiltIn: boolean;
  /** Sort order for display */
  order: number;
}

/** The six canonical built-in categories */
export const BUILT_IN_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'internship',
    label: 'Internship & Scholarship',
    shortLabel: 'Jobs',
    description: 'Jobs, internships, scholarships',
    iconName: 'Briefcase',
    color: 'var(--color-internship)',
    colorLight: 'var(--color-internship-light)',
    isUrgent: false,
    isBuiltIn: true,
    order: 1,
  },
  {
    id: 'lost-found',
    label: 'Lost & Found',
    shortLabel: 'Lost & Found',
    description: 'Lost pets, items, people',
    iconName: 'Search',
    color: 'var(--color-lost-found)',
    colorLight: 'var(--color-lost-found-light)',
    isUrgent: false,
    isBuiltIn: true,
    order: 2,
  },
  {
    id: 'events',
    label: 'Community Events',
    shortLabel: 'Events',
    description: 'Local gatherings & happenings',
    iconName: 'Calendar',
    color: 'var(--color-events)',
    colorLight: 'var(--color-events-light)',
    isUrgent: false,
    isBuiltIn: true,
    order: 3,
  },
  {
    id: 'issues',
    label: 'Local Issues',
    shortLabel: 'Issues',
    description: 'Roads, utilities, civic problems',
    iconName: 'AlertTriangle',
    color: 'var(--color-issues)',
    colorLight: 'var(--color-issues-light)',
    isUrgent: false,
    isBuiltIn: true,
    order: 4,
  },
  {
    id: 'emergency',
    label: 'Emergency & Alerts',
    shortLabel: 'Emergency',
    description: 'Urgent safety alerts',
    iconName: 'Siren',
    color: 'var(--color-emergency)',
    colorLight: 'var(--color-emergency-light)',
    isUrgent: true,
    isBuiltIn: true,
    order: 5,
  },
  {
    id: 'general',
    label: 'General Announcements',
    shortLabel: 'General',
    description: 'Community news & announcements',
    iconName: 'Megaphone',
    color: 'var(--color-general)',
    colorLight: 'var(--color-general-light)',
    isUrgent: false,
    isBuiltIn: true,
    order: 6,
  },
];

/**
 * Runtime registry — allows future custom categories to be injected.
 * Store/API can push into this array; all components read from here.
 */
export const CATEGORY_REGISTRY: CategoryDefinition[] = [...BUILT_IN_CATEGORIES];

/** Look up a category definition by id */
export function getCategoryDef(id: string): CategoryDefinition | undefined {
  return CATEGORY_REGISTRY.find(c => c.id === id);
}

/** Look up label, falling back gracefully */
export function getCategoryLabel(id: string): string {
  return getCategoryDef(id)?.label ?? id;
}

/** Add a custom category at runtime (moderator-approved) */
export function registerCustomCategory(def: CategoryDefinition): void {
  if (!CATEGORY_REGISTRY.find(c => c.id === def.id)) {
    CATEGORY_REGISTRY.push({ ...def, isBuiltIn: false });
    CATEGORY_REGISTRY.sort((a, b) => a.order - b.order);
  }
}
