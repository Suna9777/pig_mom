import { SearchResult, SectionId, Post } from '../types';
import { MOCK_BASIC_ARTICLES, MOCK_CCNU_INFOS } from '../data/mockData';

/** 计算关键词相关度 */
function relevanceScore(text: string, keyword: string): number {
  const lower = text.toLowerCase();
  const kw = keyword.toLowerCase();
  if (lower === kw) return 100;
  if (lower.startsWith(kw)) return 80;
  if (lower.includes(kw)) return 50;
  // 模糊：每个字符匹配
  let score = 0;
  let idx = 0;
  for (const ch of kw) {
    const found = lower.indexOf(ch, idx);
    if (found >= 0) {
      score += 5;
      idx = found + 1;
    }
  }
  return score;
}

/** 全站搜索 */
export function searchAll(keyword: string, posts: Post[] = []): SearchResult[] {
  if (!keyword.trim()) return [];
  const results: SearchResult[] = [];

  MOCK_BASIC_ARTICLES.forEach((a) => {
    const titleScore = relevanceScore(a.title, keyword);
    const contentScore = relevanceScore(a.steps.join(' '), keyword);
    const score = Math.max(titleScore, contentScore);
    if (score > 0) {
      results.push({
        id: a.id,
        type: 'article',
        title: a.title,
        content: a.steps.join(' · '),
        sectionId: a.sectionId,
        relevance: score + (titleScore > 0 ? 10 : 0),
      });
    }
  });

  MOCK_CCNU_INFOS.forEach((c) => {
    const text = [c.title, c.description, c.address, c.time].filter(Boolean).join(' ');
    const titleScore = relevanceScore(c.title, keyword);
    const contentScore = relevanceScore(text, keyword);
    const score = Math.max(titleScore, contentScore);
    if (score > 0) {
      results.push({
        id: c.id,
        type: 'ccnu',
        title: c.title,
        content: c.description,
        sectionId: c.sectionId as SectionId,
        relevance: score + (titleScore > 0 ? 10 : 0),
      });
    }
  });

  posts.forEach((p) => {
    const titleScore = relevanceScore(p.title, keyword);
    const contentScore = relevanceScore(p.content, keyword);
    const score = Math.max(titleScore, contentScore);
    if (score > 0) {
      results.push({
        id: p.id,
        type: 'post',
        title: p.title,
        content: p.content.slice(0, 100),
        sectionId: p.sectionId,
        postId: p.id,
        relevance: score + (titleScore > 0 ? 15 : 0),
      });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
}
