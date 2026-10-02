import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post, User, Notification, PostStatus, PostUpdate, Report } from '../types';
import { MOCK_POSTS, MOCK_USERS, MOCK_NOTIFICATIONS, COMMUNITIES } from '../data/mockData';

// ============================================
// LocalPulse - Global Application State (Zustand)
// ============================================

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isDark: boolean;

  // Data
  posts: Post[];
  notifications: Notification[];
  users: User[];

  // UI
  activeCommunity: string;
  activeLocation: string;

  // Auth Actions
  login: (userId: string) => void;
  logout: () => void;
  toggleDark: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Post Actions
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'validConfirmations' | 'viewCount' | 'updates' | 'reports'>) => Post;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  publishPost: (postId: string) => void;
  resolvePost: (postId: string) => void;
  addPostUpdate: (postId: string, update: Omit<PostUpdate, 'id' | 'postId'>) => void;
  markHelpful: (postId: string) => void;
  confirmValid: (postId: string) => void;
  incrementView: (postId: string) => void;
  reportPost: (postId: string, report: Omit<Report, 'id' | 'postId' | 'status' | 'createdAt'>) => void;

  // User Actions
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
  followPost: (postId: string) => void;
  unfollowPost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  isPostFollowed: (postId: string) => boolean;

  // Notification Actions
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Community
  setActiveCommunity: (community: string) => void;
  setActiveLocation: (location: string) => void;

  // Moderation
  approveReport: (postId: string, reportId: string) => void;
  dismissReport: (postId: string, reportId: string) => void;
  changePostStatus: (postId: string, status: PostStatus) => void;

  // Helpers
  getPostById: (id: string) => Post | undefined;
  getUserById: (id: string) => User | undefined;
  getUserPosts: (userId: string) => Post[];
  getSavedPosts: () => Post[];
  getFollowedPosts: () => Post[];
  /** Filter active posts that belong to the given community area */
  getPostsByCommunity: (communityId: string) => Post[];
  /** Compute real stats for a community from actual post data */
  getCommunityStats: (communityId: string) => {
    activePosts: number;
    totalPosts: number;
    emergencyCount: number;
    memberCount: number;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentUser: MOCK_USERS[0],
      isAuthenticated: true,
      isDark: false,
      posts: MOCK_POSTS,
      notifications: MOCK_NOTIFICATIONS,
      users: MOCK_USERS,
      activeCommunity: 'koramangala',
      activeLocation: 'Bengaluru',

      // Auth
      login: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (user) set({ currentUser: user, isAuthenticated: true });
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      toggleDark: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        document.documentElement.classList.toggle('dark', newDark);
      },
      updateUser: (updates) => {
        const user = get().currentUser;
        if (!user) return;
        const updated = { ...user, ...updates };
        set({
          currentUser: updated,
          users: get().users.map(u => u.id === user.id ? updated : u),
        });
      },

      // Posts
      createPost: (postData) => {
        const newPost: Post = {
          ...postData,
          id: `post-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          helpfulCount: 0,
          validConfirmations: 0,
          viewCount: 0,
          updates: [],
          reports: [],
        };
        set(state => ({ posts: [newPost, ...state.posts] }));
        return newPost;
      },

      updatePost: (postId, updates) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deletePost: (postId) => {
        set(state => ({ posts: state.posts.filter(p => p.id !== postId) }));
      },

      publishPost: (postId) => {
        get().updatePost(postId, { status: 'active' });
      },

      resolvePost: (postId) => {
        get().updatePost(postId, {
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
        });
      },

      addPostUpdate: (postId, update) => {
        const newUpdate: PostUpdate = {
          ...update,
          id: `upd-${Date.now()}`,
          postId,
        };
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, updates: [...p.updates, newUpdate], updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      markHelpful: (postId) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId ? { ...p, helpfulCount: p.helpfulCount + 1 } : p
          ),
        }));
      },

      confirmValid: (postId) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId ? { ...p, validConfirmations: p.validConfirmations + 1 } : p
          ),
        }));
      },

      incrementView: (postId) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p
          ),
        }));
      },

      reportPost: (postId, reportData) => {
        const report: Report = {
          ...reportData,
          id: `rep-${Date.now()}`,
          postId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId ? { ...p, reports: [...p.reports, report] } : p
          ),
        }));
        // Add notification for moderators
        const modNotif: Notification = {
          id: `notif-${Date.now()}`,
          userId: 'user-mod',
          type: 'report',
          title: 'New report to review',
          body: `A post has been reported: "${get().posts.find(p => p.id === postId)?.title?.substring(0, 50)}..."`,
          postId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ notifications: [modNotif, ...state.notifications] }));
      },

      // User Actions
      savePost: (postId) => {
        const user = get().currentUser;
        if (!user || user.savedPosts.includes(postId)) return;
        get().updateUser({ savedPosts: [...user.savedPosts, postId] });
      },

      unsavePost: (postId) => {
        const user = get().currentUser;
        if (!user) return;
        get().updateUser({ savedPosts: user.savedPosts.filter(id => id !== postId) });
      },

      followPost: (postId) => {
        const user = get().currentUser;
        if (!user || user.followedPosts.includes(postId)) return;
        get().updateUser({ followedPosts: [...user.followedPosts, postId] });
      },

      unfollowPost: (postId) => {
        const user = get().currentUser;
        if (!user) return;
        get().updateUser({ followedPosts: user.followedPosts.filter(id => id !== postId) });
      },

      isPostSaved: (postId) => {
        return get().currentUser?.savedPosts.includes(postId) ?? false;
      },

      isPostFollowed: (postId) => {
        return get().currentUser?.followedPosts.includes(postId) ?? false;
      },

      // Notifications
      markNotificationRead: (notifId) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        const userId = get().currentUser?.id;
        set(state => ({
          notifications: state.notifications.map(n =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }));
      },

      getUnreadCount: () => {
        const userId = get().currentUser?.id;
        return get().notifications.filter(n => n.userId === userId && !n.read).length;
      },

      // Community
      setActiveCommunity: (community) => set({ activeCommunity: community }),
      setActiveLocation: (location) => set({ activeLocation: location }),

      // Moderation
      approveReport: (postId, reportId) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  status: 'needs-review' as PostStatus,
                  reports: p.reports.map(r =>
                    r.id === reportId ? { ...r, status: 'reviewed' as const } : r
                  ),
                }
              : p
          ),
        }));
      },

      dismissReport: (postId, reportId) => {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  reports: p.reports.map(r =>
                    r.id === reportId ? { ...r, status: 'dismissed' as const } : r
                  ),
                }
              : p
          ),
        }));
      },

      changePostStatus: (postId, status) => {
        get().updatePost(postId, { status });
      },

      // Helpers
      getPostById: (id) => get().posts.find(p => p.id === id),
      getUserById: (id) => get().users.find(u => u.id === id),
      getUserPosts: (userId) => get().posts.filter(p => p.authorId === userId),
      getSavedPosts: () => {
        const savedIds = get().currentUser?.savedPosts ?? [];
        return get().posts.filter(p => savedIds.includes(p.id));
      },
      getFollowedPosts: () => {
        const followedIds = get().currentUser?.followedPosts ?? [];
        return get().posts.filter(p => followedIds.includes(p.id));
      },
      getPostsByCommunity: (communityId) => {
        const { posts } = get();
        const active = posts.filter(p => p.status === 'active' || p.status === 'needs-review');
        // 'all' means no community filter
        if (!communityId || communityId === 'all') return active;
        // Match by location.area name (case-insensitive partial) or community id
        return active.filter(p => {
          const area = p.location.area.toLowerCase();
          const id = communityId.toLowerCase();
          // e.g. communityId='koramangala' matches area='Koramangala'
          return area.includes(id.replace(/-/g, ' ')) ||
                 id.replace(/-/g, ' ').includes(area);
        });
      },
      getCommunityStats: (communityId) => {
        const communityPosts = get().getPostsByCommunity(communityId);
        const allForCommunity = get().posts.filter(p => {
          if (!communityId || communityId === 'all') return true;
          const area = p.location.area.toLowerCase();
          const id = communityId.toLowerCase().replace(/-/g, ' ');
          return area.includes(id) || id.includes(area);
        });
        const commData = COMMUNITIES.find(c => c.id === communityId);
        return {
          activePosts: communityPosts.length,
          totalPosts: allForCommunity.length,
          emergencyCount: communityPosts.filter(p => p.category === 'emergency').length,
          memberCount: commData?.memberCount ?? get().users.length,
        };
      },
    }),
    {
      name: 'localpulse-store',
      partialize: (state) => ({
        isDark: state.isDark,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        activeCommunity: state.activeCommunity,
        posts: state.posts,
        notifications: state.notifications,
      }),
    }
  )
);
