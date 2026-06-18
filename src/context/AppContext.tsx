import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  UserProfile,
  Post,
  Comment,
  Draft,
  BrowseHistoryItem,
  Notification,
  AppSettings,
  PostType,
  SectionId,
  SearchResult,
} from '../types';
import { getItem, setItem, prependToList, clearAll } from '../services/storage';
import { STORAGE_KEYS } from '../constants/storage';
import {
  fetchPostsFromAPI,
  fetchCommentsFromAPI,
  createPostAPI,
  updatePostAPI,
  deletePostAPI,
  createCommentAPI,
} from '../services/api';
import { MOCK_POSTS, MOCK_COMMENTS } from '../data/mockData';
import { generateId } from '../utils/helpers';
import { searchAll } from '../utils/search';
import { FONT_SIZES, COLORS } from '../constants/theme';
import { LoadingScreen } from '../components/LoadingScreen';

/** 默认用户 */
const DEFAULT_USER: UserProfile = {
  id: 'user_1',
  nickname: '猪猪妈妈',
  avatar: undefined,
};

/** 默认设置 */
const DEFAULT_SETTINGS: AppSettings = {
  pushEnabled: true,
  themeMode: 'system',
  fontSize: 'medium',
  recordHistory: true,
  commentPermission: 'all',
  profileVisibility: 'all',
};

interface AppState {
  user: UserProfile;
  posts: Post[];
  comments: Comment[];
  drafts: Draft[];
  favorites: string[];
  likes: string[];
  usefulMarks: string[];
  myComments: Comment[];
  searchHistory: string[];
  browseHistory: BrowseHistoryItem[];
  blockedUsers: string[];
  notifications: Notification[];
  settings: AppSettings;
  following: string[];
  loaded: boolean;
}

type Action =
  | { type: 'SET_LOADED'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'REMOVE_POST'; payload: string }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'SET_DRAFTS'; payload: Draft[] }
  | { type: 'ADD_DRAFT'; payload: Draft }
  | { type: 'REMOVE_DRAFT'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'SET_LIKES'; payload: string[] }
  | { type: 'SET_USEFUL'; payload: string[] }
  | { type: 'SET_MY_COMMENTS'; payload: Comment[] }
  | { type: 'SET_SEARCH_HISTORY'; payload: string[] }
  | { type: 'SET_BROWSE_HISTORY'; payload: BrowseHistoryItem[] }
  | { type: 'SET_BLOCKED'; payload: string[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_FOLLOWING'; payload: string[] }
  | { type: 'RESET_ALL' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADED':
      return { ...state, loaded: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'REMOVE_POST':
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload) };
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };
    case 'SET_DRAFTS':
      return { ...state, drafts: action.payload };
    case 'ADD_DRAFT':
      return { ...state, drafts: [action.payload, ...state.drafts.filter((d) => d.id !== action.payload.id)] };
    case 'REMOVE_DRAFT':
      return { ...state, drafts: state.drafts.filter((d) => d.id !== action.payload) };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'SET_LIKES':
      return { ...state, likes: action.payload };
    case 'SET_USEFUL':
      return { ...state, usefulMarks: action.payload };
    case 'SET_MY_COMMENTS':
      return { ...state, myComments: action.payload };
    case 'SET_SEARCH_HISTORY':
      return { ...state, searchHistory: action.payload };
    case 'SET_BROWSE_HISTORY':
      return { ...state, browseHistory: action.payload };
    case 'SET_BLOCKED':
      return { ...state, blockedUsers: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_FOLLOWING':
      return { ...state, following: action.payload };
    case 'RESET_ALL':
      return {
        user: DEFAULT_USER,
        posts: MOCK_POSTS,
        comments: MOCK_COMMENTS,
        drafts: [],
        favorites: [],
        likes: [],
        usefulMarks: [],
        myComments: [],
        searchHistory: [],
        browseHistory: [],
        blockedUsers: [],
        notifications: [],
        settings: DEFAULT_SETTINGS,
        following: [],
        loaded: true,
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  isDark: boolean;
  fonts: typeof FONT_SIZES.medium;
  // 用户
  updateUser: (user: Partial<UserProfile>) => Promise<void>;
  // 帖子
  refreshPosts: () => Promise<void>;
  getVisiblePosts: (tag?: string) => Post[];
  getPostById: (id: string) => Post | undefined;
  publishPost: (data: {
    type: PostType;
    sectionId: SectionId;
    title: string;
    content: string;
    images: string[];
    tags: string[];
  }) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleFavorite: (postId: string) => Promise<void>;
  toggleUseful: (postId: string) => Promise<void>;
  // 评论
  getCommentsByPost: (postId: string) => Comment[];
  addComment: (postId: string, content: string, replyTo?: Comment) => Promise<void>;
  // 草稿
  saveDraft: (draft: Omit<Draft, 'id' | 'savedAt'> & { id?: string }) => Promise<void>;
  removeDraft: (id: string) => Promise<void>;
  // 搜索
  search: (keyword: string) => SearchResult[];
  addSearchHistory: (keyword: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  // 浏览历史
  addBrowseHistory: (item: Omit<BrowseHistoryItem, 'id' | 'viewedAt'>) => Promise<void>;
  // 屏蔽
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  // 举报
  reportContent: (targetType: 'post' | 'comment', targetId: string, reason: string) => void;
  // 通知
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
  // 设置
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  logout: () => Promise<void>;
  // 关注
  toggleFollow: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [state, dispatch] = useReducer(reducer, {
    user: DEFAULT_USER,
    posts: [],
    comments: [],
    drafts: [],
    favorites: [],
    likes: [],
    usefulMarks: [],
    myComments: [],
    searchHistory: [],
    browseHistory: [],
    blockedUsers: [],
    notifications: [],
    settings: DEFAULT_SETTINGS,
    following: [],
    loaded: false,
  });

  const isDark =
    state.settings.themeMode === 'dark' ||
    (state.settings.themeMode === 'system' && systemScheme === 'dark');

  const fonts = FONT_SIZES[state.settings.fontSize];

  // 初始化加载本地数据
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [user, posts, comments, drafts, favorites, likes, usefulMarks, myComments, searchHistory, browseHistory, blockedUsers, notifications, settings, following] =
        await Promise.all([
          getItem(STORAGE_KEYS.USER, DEFAULT_USER),
          fetchPostsFromAPI(),
          fetchCommentsFromAPI(),
          getItem<Draft[]>(STORAGE_KEYS.DRAFTS, []),
          getItem<string[]>(STORAGE_KEYS.FAVORITES, []),
          getItem<string[]>(STORAGE_KEYS.LIKES, []),
          getItem<string[]>(STORAGE_KEYS.USEFUL, []),
          getItem<Comment[]>(STORAGE_KEYS.MY_COMMENTS, []),
          getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY, []),
          getItem<BrowseHistoryItem[]>(STORAGE_KEYS.BROWSE_HISTORY, []),
          getItem<string[]>(STORAGE_KEYS.BLOCKED_USERS, []),
          getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
          getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
          getItem<string[]>(STORAGE_KEYS.FOLLOWING, []),
        ]);
      if (!mounted) return;
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_POSTS', payload: posts });
      dispatch({ type: 'SET_COMMENTS', payload: comments });
      dispatch({ type: 'SET_DRAFTS', payload: drafts });
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
      dispatch({ type: 'SET_LIKES', payload: likes });
      dispatch({ type: 'SET_USEFUL', payload: usefulMarks });
      dispatch({ type: 'SET_MY_COMMENTS', payload: myComments });
      dispatch({ type: 'SET_SEARCH_HISTORY', payload: searchHistory });
      dispatch({ type: 'SET_BROWSE_HISTORY', payload: browseHistory });
      dispatch({ type: 'SET_BLOCKED', payload: blockedUsers });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'SET_FOLLOWING', payload: following });
      dispatch({ type: 'SET_LOADED', payload: true });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    const user = { ...state.user, ...updates };
    dispatch({ type: 'SET_USER', payload: user });
    await setItem(STORAGE_KEYS.USER, user);
  }, [state.user]);

  const refreshPosts = useCallback(async () => {
    const posts = await fetchPostsFromAPI();
    dispatch({ type: 'SET_POSTS', payload: posts });
  }, []);

  const getVisiblePosts = useCallback(
    (tag?: string) => {
      let list = state.posts.filter((p) => !state.blockedUsers.includes(p.authorId));
      if (tag && tag !== '全部') {
        list = list.filter((p) => p.tags.includes(tag));
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [state.posts, state.blockedUsers]
  );

  const getPostById = useCallback(
    (id: string) => state.posts.find((p) => p.id === id),
    [state.posts]
  );

  const publishPost = useCallback(
    async (data: {
      type: PostType;
      sectionId: SectionId;
      title: string;
      content: string;
      images: string[];
      tags: string[];
    }) => {
      const post: Post = {
        id: generateId('post'),
        ...data,
        authorId: state.user.id,
        authorName: state.user.nickname,
        authorAvatar: state.user.avatar,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        favoriteCount: 0,
        usefulCount: 0,
        likedBy: [],
        favoritedBy: [],
        usefulBy: [],
      };
      await createPostAPI(post);
      dispatch({ type: 'ADD_POST', payload: post });
      return post;
    },
    [state.user]
  );

  const deletePost = useCallback(async (postId: string) => {
    await deletePostAPI(postId);
    dispatch({ type: 'REMOVE_POST', payload: postId });
  }, []);

  const toggleLike = useCallback(
    async (postId: string) => {
      const post = state.posts.find((p) => p.id === postId);
      if (!post) return;
      const liked = state.likes.includes(postId);
      const updated: Post = {
        ...post,
        likedBy: liked
          ? post.likedBy.filter((id) => id !== state.user.id)
          : [...post.likedBy, state.user.id],
        likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
      };
      await updatePostAPI(updated);
      dispatch({ type: 'UPDATE_POST', payload: updated });
      const likes = liked ? state.likes.filter((id) => id !== postId) : [...state.likes, postId];
      dispatch({ type: 'SET_LIKES', payload: likes });
      await setItem(STORAGE_KEYS.LIKES, likes);
      if (!liked && post.authorId !== state.user.id) {
        const notif: Notification = {
          id: generateId('notif'),
          type: 'like',
          title: '收到点赞',
          content: `${state.user.nickname} 赞了你的帖子「${post.title}」`,
          postId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        const notifications = [notif, ...state.notifications];
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
      }
    },
    [state.posts, state.likes, state.user, state.notifications]
  );

  const toggleFavorite = useCallback(
    async (postId: string) => {
      const post = state.posts.find((p) => p.id === postId);
      if (!post) return;
      const favorited = state.favorites.includes(postId);
      const updated: Post = {
        ...post,
        favoritedBy: favorited
          ? post.favoritedBy.filter((id) => id !== state.user.id)
          : [...post.favoritedBy, state.user.id],
        favoriteCount: favorited ? post.favoriteCount - 1 : post.favoriteCount + 1,
      };
      await updatePostAPI(updated);
      dispatch({ type: 'UPDATE_POST', payload: updated });
      const favorites = favorited
        ? state.favorites.filter((id) => id !== postId)
        : [...state.favorites, postId];
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
      await setItem(STORAGE_KEYS.FAVORITES, favorites);
    },
    [state.posts, state.favorites, state.user]
  );

  const toggleUseful = useCallback(
    async (postId: string) => {
      const post = state.posts.find((p) => p.id === postId);
      if (!post || post.type !== 'help') return;
      const marked = state.usefulMarks.includes(postId);
      const updated: Post = {
        ...post,
        usefulBy: marked
          ? post.usefulBy.filter((id) => id !== state.user.id)
          : [...post.usefulBy, state.user.id],
        usefulCount: marked ? post.usefulCount - 1 : post.usefulCount + 1,
      };
      await updatePostAPI(updated);
      dispatch({ type: 'UPDATE_POST', payload: updated });
      const marks = marked
        ? state.usefulMarks.filter((id) => id !== postId)
        : [...state.usefulMarks, postId];
      dispatch({ type: 'SET_USEFUL', payload: marks });
      await setItem(STORAGE_KEYS.USEFUL, marks);
    },
    [state.posts, state.usefulMarks, state.user]
  );

  const getCommentsByPost = useCallback(
    (postId: string) =>
      state.comments
        .filter((c) => c.postId === postId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [state.comments]
  );

  const addComment = useCallback(
    async (postId: string, content: string, replyTo?: Comment) => {
      const comment: Comment = {
        id: generateId('comment'),
        postId,
        authorId: state.user.id,
        authorName: state.user.nickname,
        content,
        createdAt: new Date().toISOString(),
        replyToId: replyTo?.id,
        replyToName: replyTo?.authorName,
      };
      await createCommentAPI(comment);
      dispatch({ type: 'ADD_COMMENT', payload: comment });
      const myComments = [...state.myComments, comment];
      dispatch({ type: 'SET_MY_COMMENTS', payload: myComments });
      await setItem(STORAGE_KEYS.MY_COMMENTS, myComments);
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        const updated = { ...post, commentCount: post.commentCount + 1 };
        await updatePostAPI(updated);
        dispatch({ type: 'UPDATE_POST', payload: updated });
        if (post.authorId !== state.user.id) {
          const notif: Notification = {
            id: generateId('notif'),
            type: 'reply',
            title: '收到回复',
            content: `${state.user.nickname} 评论了你的帖子「${post.title}」`,
            postId,
            read: false,
            createdAt: new Date().toISOString(),
          };
          const notifications = [notif, ...state.notifications];
          dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
          await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
      }
    },
    [state.user, state.comments, state.myComments, state.posts, state.notifications]
  );

  const saveDraft = useCallback(
    async (data: Omit<Draft, 'id' | 'savedAt'> & { id?: string }) => {
      const draft: Draft = {
        id: data.id || generateId('draft'),
        type: data.type,
        sectionId: data.sectionId,
        title: data.title,
        content: data.content,
        images: data.images,
        tags: data.tags,
        savedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_DRAFT', payload: draft });
      const drafts = [draft, ...state.drafts.filter((d) => d.id !== draft.id)];
      await setItem(STORAGE_KEYS.DRAFTS, drafts);
    },
    [state.drafts]
  );

  const removeDraft = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_DRAFT', payload: id });
    const drafts = state.drafts.filter((d) => d.id !== id);
    await setItem(STORAGE_KEYS.DRAFTS, drafts);
  }, [state.drafts]);

  const search = useCallback((keyword: string) => searchAll(keyword, state.posts), [state.posts]);

  const addSearchHistory = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return;
    const history = await prependToList(STORAGE_KEYS.SEARCH_HISTORY, keyword.trim(), 20);
    dispatch({ type: 'SET_SEARCH_HISTORY', payload: history });
  }, []);

  const clearSearchHistory = useCallback(async () => {
    dispatch({ type: 'SET_SEARCH_HISTORY', payload: [] });
    await setItem(STORAGE_KEYS.SEARCH_HISTORY, []);
  }, []);

  const addBrowseHistory = useCallback(
    async (item: Omit<BrowseHistoryItem, 'id' | 'viewedAt'>) => {
      if (!state.settings.recordHistory) return;
      const entry: BrowseHistoryItem = {
        ...item,
        id: generateId('history'),
        viewedAt: new Date().toISOString(),
      };
      const history = await prependToList(
        STORAGE_KEYS.BROWSE_HISTORY,
        entry,
        100
      );
      dispatch({ type: 'SET_BROWSE_HISTORY', payload: history });
    },
    [state.settings.recordHistory]
  );

  const blockUser = useCallback(async (userId: string) => {
    const blocked = [...new Set([...state.blockedUsers, userId])];
    dispatch({ type: 'SET_BLOCKED', payload: blocked });
    await setItem(STORAGE_KEYS.BLOCKED_USERS, blocked);
  }, [state.blockedUsers]);

  const unblockUser = useCallback(async (userId: string) => {
    const blocked = state.blockedUsers.filter((id) => id !== userId);
    dispatch({ type: 'SET_BLOCKED', payload: blocked });
    await setItem(STORAGE_KEYS.BLOCKED_USERS, blocked);
  }, [state.blockedUsers]);

  const reportContent = useCallback(
    (_targetType: 'post' | 'comment', _targetId: string, _reason: string) => {
      // 模拟举报提交
    },
    []
  );

  const markNotificationRead = useCallback(async (id: string) => {
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [state.notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [state.notifications]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const settings = { ...state.settings, ...updates };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await setItem(STORAGE_KEYS.SETTINGS, settings);
  }, [state.settings]);

  const logout = useCallback(async () => {
    await clearAll();
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const toggleFollow = useCallback(async (userId: string) => {
    const following = state.following.includes(userId)
      ? state.following.filter((id) => id !== userId)
      : [...state.following, userId];
    dispatch({ type: 'SET_FOLLOWING', payload: following });
    await setItem(STORAGE_KEYS.FOLLOWING, following);
  }, [state.following]);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  const value: AppContextValue = {
    state,
    isDark,
    fonts,
    updateUser,
    refreshPosts,
    getVisiblePosts,
    getPostById,
    publishPost,
    deletePost,
    toggleLike,
    toggleFavorite,
    toggleUseful,
    getCommentsByPost,
    addComment,
    saveDraft,
    removeDraft,
    search,
    addSearchHistory,
    clearSearchHistory,
    addBrowseHistory,
    blockUser,
    unblockUser,
    reportContent,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    updateSettings,
    logout,
    toggleFollow,
  };

  if (!state.loaded) return <LoadingScreen />;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}


/** 主题 hook */
export function useTheme() {
  const { isDark, fonts } = useApp();
  return {
    isDark,
    fonts,
    colors: isDark
      ? {
          ...COLORS,
          background: COLORS.darkBackground,
          card: COLORS.darkCard,
          text: COLORS.darkText,
          textSecondary: '#AAAAAA',
          border: '#333',
        }
      : COLORS,
  };
}
