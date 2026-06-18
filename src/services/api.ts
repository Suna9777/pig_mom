/**
 * API 服务层 — 预留后端对接
 * 当前实现为本地 mock 数据 + AsyncStorage
 * 将来可将各函数替换为 fetch/axios 调用
 */

import { BasicArticle, CCNUInfo, Post, Comment, SectionId } from '../types';
import { MOCK_BASIC_ARTICLES, MOCK_CCNU_INFOS, MOCK_POSTS, MOCK_COMMENTS } from '../data/mockData';
import { getItem, setItem } from './storage';
import { STORAGE_KEYS } from '../constants/storage';

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
  const stored = await getItem<Post[]>(STORAGE_KEYS.POSTS, []);
  if (stored.length > 0) return stored;
  return MOCK_POSTS;
}

/** 获取评论 — 将来: GET /posts/:id/comments */
export async function fetchCommentsFromAPI(): Promise<Comment[]> {
  const stored = await getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  if (stored.length > 0) return stored;
  return MOCK_COMMENTS;
}

/** 发布帖子 — 将来: POST /posts */
export async function createPostAPI(post: Post): Promise<Post> {
  // return fetch(`${API_BASE}/posts`, { method: 'POST', body: JSON.stringify(post) }).then(r => r.json());
  const posts = await getItem<Post[]>(STORAGE_KEYS.POSTS, MOCK_POSTS);
  const updated = [post, ...posts];
  await setItem(STORAGE_KEYS.POSTS, updated);
  return post;
}

/** 更新帖子 — 将来: PUT /posts/:id */
export async function updatePostAPI(post: Post): Promise<Post> {
  const posts = await getItem<Post[]>(STORAGE_KEYS.POSTS, MOCK_POSTS);
  const updated = posts.map((p) => (p.id === post.id ? post : p));
  await setItem(STORAGE_KEYS.POSTS, updated);
  return post;
}

/** 删除帖子 — 将来: DELETE /posts/:id */
export async function deletePostAPI(postId: string): Promise<void> {
  const posts = await getItem<Post[]>(STORAGE_KEYS.POSTS, MOCK_POSTS);
  await setItem(STORAGE_KEYS.POSTS, posts.filter((p) => p.id !== postId));
}

/** 创建评论 — 将来: POST /posts/:id/comments */
export async function createCommentAPI(comment: Comment): Promise<Comment> {
  const comments = await getItem<Comment[]>(STORAGE_KEYS.COMMENTS, MOCK_COMMENTS);
  const updated = [...comments, comment];
  await setItem(STORAGE_KEYS.COMMENTS, updated);
  return comment;
}

export { API_BASE };
