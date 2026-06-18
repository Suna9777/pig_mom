import { Comment } from '../types';

/** 持久化用扁平评论（不含 replies 树） */
export type StoredComment = Omit<Comment, 'replies'>;

/** 将旧字段 replyToId 迁移为 parentId */
export function normalizeComment(
  raw: StoredComment & { replies?: Comment[]; replyToId?: string; replyToName?: string }
): Comment {
  const parentId = raw.parentId ?? raw.replyToId ?? null;
  const { replyToId, replyToName, replies, ...rest } = raw;
  return { ...rest, parentId, replies: [] };
}

/** 持久化前剥离 replies，避免冗余写入 */
export function stripRepliesForStorage(comment: Comment): StoredComment {
  const { replies: _replies, ...flat } = comment;
  return flat;
}

/** 扁平列表 → 树形结构（按 createdAt 升序） */
export function buildCommentTree(flat: Comment[]): Comment[] {
  const normalized = flat.map(normalizeComment);
  const map = new Map<string, Comment>();
  normalized.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  const roots: Comment[] = [];
  normalized.forEach((c) => {
    const node = map.get(c.id)!;
    if (!c.parentId) {
      roots.push(node);
    } else {
      const parent = map.get(c.parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  });

  const sortByTime = (list: Comment[]) =>
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const sortTree = (nodes: Comment[]) => {
    sortByTime(nodes);
    nodes.forEach((n) => sortTree(n.replies));
  };
  sortTree(roots);
  return roots;
}

/** 计算评论嵌套深度（顶级 = 1） */
export function getCommentDepth(flat: Comment[], commentId: string): number {
  const map = new Map(flat.map((c) => [c.id, normalizeComment(c)]));
  let depth = 0;
  let current = map.get(commentId);
  while (current) {
    depth++;
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return depth;
}

/** 统计树中全部评论数（含子回复） */
export function countAllComments(tree: Comment[]): number {
  return tree.reduce((sum, c) => sum + 1 + countAllComments(c.replies), 0);
}
