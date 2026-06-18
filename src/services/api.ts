/**
 * API 服务层 — 预留后端对接
 * 当前实现为本地 mock 数据 + AsyncStorage
 * 将来可将各函数替换为 fetch/axios 调用
 */

import { BasicArticle, CCNUInfo, Post, Comment, SectionId } from '../types';
import { MOCK_BASIC_ARTICLES, MOCK_CCNU_INFOS, MOCK_POSTS, MOCK_COMMENTS } from '../data/mockData';
import { getItem, setItem } from './storage';
import { STORAGE_KEYS } from '../constants/storage';
import { normalizeComment, stripRepliesForStorage, StoredComment } from '../utils/comments';

/** 剥离旧版 resolved 字段，确保帖子数据不含该字段 */
function stripResolvedFromPost(post: Post & { resolved?: boolean }): Post {
  const { resolved: _removed, ...clean } = post;
  return clean;
}

function stripResolvedFromPosts(posts: (Post & { resolved?: boolean })[]): Post[] {
  return posts.map(stripResolvedFromPost);
}

const API_BASE = 'https://api.pigmom.ccnu.edu.cn'; // 预留 API 地址

/** 获取板块基础知识 — 将来: GET /sections/:id/articles */
export async function fetchBasicArticles(sectionId: SectionId): Promise<BasicArticle[]> {
  // return fetch(`${API_BASE}/sections/${sectionId}/articles`).then(r => r.json());
  return MOCK_BASIC_ARTICLES.filter((a) => a.sectionId === sectionId);
}

/** 获取 CCNU 专属信息 — 将来: GET /sections/:id/ccnu */
export async function fetchCCNUInfos(sectionId: SectionId): Promise<CCNUInfo[]> {
  // return fetch(`${API_BASE}/sections/${sectionId}/ccnu`).then(r => r.json());
  return MOCK_CCNU_INFOS.filter((c) => c.sectionId === sectionId);
}

/** 获取帖子列表 — 将来: GET /posts */
export async function fetchPostsFromAPI(): Promise<Post[]> {
  // return fetch(`${API_BASE}/posts`).then(r => r.json());
  const stored = await getItem<(Post & { resolved?: boolean })[]>(STORAGE_KEYS.POSTS, []);
  const raw = stored.length > 0 ? stored : MOCK_POSTS;
  const posts = stripResolvedFromPosts(raw);
  if (stored.some((p) => 'resolved' in p)) {
    await setItem(STORAGE_KEYS.POSTS, posts);
  }
  return posts;
}

/** 获取评论 — 将来: GET /posts/:id/comments */
export async function fetchCommentsFromAPI(): Promise<Comment[]> {
  const stored = await getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  const raw = stored.length > 0 ? stored : MOCK_COMMENTS;
  const normalized = raw.map(normalizeComment);
  const needsMigration = stored.some((c) => c.replyToId != null || !('parentId' in c));
  if (needsMigration) {
    await setItem(STORAGE_KEYS.COMMENTS, normalized.map(stripRepliesForStorage));
  }
  return normalized;
}

/** 发布帖子 — 将来: POST /posts */
export async function createPostAPI(post: Post): Promise<Post> {
  // return fetch(`${API_BASE}/posts`, { method: 'POST', body: JSON.stringify(post) }).then(r => r.json());
  const clean = stripResolvedFromPost(post as Post & { resolved?: boolean });
  const posts = stripResolvedFromPosts(await getItem<(Post & { resolved?: boolean })[]>(STORAGE_KEYS.POSTS, MOCK_POSTS));
  const updated = [clean, ...posts];
  await setItem(STORAGE_KEYS.POSTS, updated);
  return clean;
}

/** 更新帖子 — 将来: PUT /posts/:id */
export async function updatePostAPI(post: Post): Promise<Post> {
  const clean = stripResolvedFromPost(post as Post & { resolved?: boolean });
  const posts = stripResolvedFromPosts(await getItem<(Post & { resolved?: boolean })[]>(STORAGE_KEYS.POSTS, MOCK_POSTS));
  const updated = posts.map((p) => (p.id === clean.id ? clean : p));
  await setItem(STORAGE_KEYS.POSTS, updated);
  return clean;
}

/** 删除帖子 — 将来: DELETE /posts/:id */
export async function deletePostAPI(postId: string): Promise<void> {
  const posts = await getItem<Post[]>(STORAGE_KEYS.POSTS, MOCK_POSTS);
  await setItem(STORAGE_KEYS.POSTS, posts.filter((p) => p.id !== postId));
}

/** 创建评论 — 将来: POST /posts/:id/comments */
export async function createCommentAPI(comment: Comment): Promise<Comment> {
  const flat = stripRepliesForStorage(normalizeComment(comment));
  const comments = (await getItem<StoredComment[]>(STORAGE_KEYS.COMMENTS, MOCK_COMMENTS)).map(normalizeComment);
  const updated: StoredComment[] = [...comments.map(stripRepliesForStorage), flat];
  await setItem(STORAGE_KEYS.COMMENTS, updated);
  return normalizeComment(flat);
}

export { API_BASE };
