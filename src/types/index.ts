/** 帖子类型 */
export type PostType = 'help' | 'share' | 'trade';

/** 九大板块 ID */
export type SectionId =
  | 'health'
  | 'transport'
  | 'life'
  | 'finance'
  | 'certificate'
  | 'career'
  | 'legal'
  | 'social'
  | 'study';

/** 板块基础信息 */
export interface Section {
  id: SectionId;
  title: string;
  icon: string;
  color: string;
  description: string;
}

/** 基础知识文章 */
export interface BasicArticle {
  id: string;
  sectionId: SectionId;
  title: string;
  steps: string[];
  officialUrl?: string;
  officialName?: string;
}

/** CCNU 专属信息 */
export interface CCNUInfo {
  id: string;
  sectionId: SectionId;
  title: string;
  address?: string;
  time?: string;
  price?: string;
  phone?: string;
  description: string;
}

/** 经验分享（关联帖子） */
export interface ExperienceShare {
  id: string;
  sectionId: SectionId;
  postId: string;
  title: string;
  summary: string;
}

/** 帖子 */
export interface Post {
  id: string;
  type: PostType;
  sectionId: SectionId;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  usefulCount: number;
  likedBy: string[];
  favoritedBy: string[];
  usefulBy: string[];
}

/** 评论 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  replies: Comment[];
  /** @deprecated 兼容旧数据，迁移后由 parentId 替代 */
  replyToId?: string;
  replyToName?: string;
}

/** 用户信息 */
export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  password?: string;
}

/** 草稿 */
export interface Draft {
  id: string;
  type: PostType;
  sectionId: SectionId;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  savedAt: string;
}

/** 浏览历史 */
export interface BrowseHistoryItem {
  id: string;
  type: 'article' | 'post' | 'ccnu';
  title: string;
  targetId: string;
  sectionId?: SectionId;
  viewedAt: string;
}

/** 系统通知 */
export interface Notification {
  id: string;
  type: 'reply' | 'like' | 'favorite' | 'system';
  title: string;
  content: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

/** 举报记录 */
export interface Report {
  id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  reason: string;
  createdAt: string;
}

/** 搜索结果 */
export interface SearchResult {
  id: string;
  type: 'article' | 'post' | 'ccnu';
  title: string;
  content: string;
  sectionId?: SectionId;
  postId?: string;
  relevance: number;
}

/** 字体大小 */
export type FontSizeOption = 'small' | 'medium' | 'large';

/** 深色模式 */
export type ThemeMode = 'system' | 'light' | 'dark';

/** 应用设置 */
export interface AppSettings {
  pushEnabled: boolean;
  themeMode: ThemeMode;
  fontSize: FontSizeOption;
  recordHistory: boolean;
  commentPermission: 'all' | 'friends' | 'self';
  profileVisibility: 'all' | 'friends' | 'self';
}

/** 导航参数 */
export type RootStackParamList = {
  MainTabs: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SectionDetail: { sectionId: SectionId };
  PostDetail: { postId: string };
};

export type CommunityStackParamList = {
  Community: undefined;
  PostDetail: { postId: string };
  CreatePost: { draftId?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  MyPosts: undefined;
  Favorites: undefined;
  Drafts: undefined;
  History: undefined;
  LikesComments: undefined;
  Follow: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  Settings: undefined;
  AccountSecurity: undefined;
  GeneralSettings: undefined;
  PrivacySettings: undefined;
  HelpFeedback: undefined;
  About: undefined;
  CreatePost: { draftId?: string };
};
