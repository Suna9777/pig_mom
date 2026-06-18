/* ========== 猪猪妈妈 · 应用逻辑层 ========== */

const App = (() => {
  const USER_ID = 'user_001';
  const STORAGE_KEY = 'pigmom_app_state';

  let state = loadState();
  let currentTab = 'home';
  let currentSection = null;
  let currentSectionTab = 'basic';
  let currentTagFilter = '全部';
  let profileSubPage = null;
  let viewingUserId = null;
  let blockedUsers = new Set(state.blockedUsers || []);
  let blockedPosts = new Set(state.blockedPosts || []);

  function stripResolvedFromPosts(posts) {
    return posts.map(({ resolved, ...rest }) => rest);
  }

  function normalizeComment(c) {
    const parentId = c.parentId ?? c.replyToId ?? null;
    const { replyToId, replyToName, replies, ...rest } = c;
    return { ...rest, parentId };
  }

  function normalizeComments(comments) {
    return comments.map(normalizeComment);
  }

  function buildCommentTree(flat) {
    const map = new Map();
    flat.forEach(c => map.set(c.id, { ...c, replies: [] }));
    const roots = [];
    flat.forEach(c => {
      const node = map.get(c.id);
      if (!c.parentId) roots.push(node);
      else {
        const parent = map.get(c.parentId);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      }
    });
    const sort = list => {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      list.forEach(n => sort(n.replies));
    };
    sort(roots);
    return roots;
  }

  function getCommentDepth(flat, commentId) {
    const map = new Map(flat.map(c => [c.id, c]));
    let depth = 0;
    let cur = map.get(commentId);
    while (cur) {
      depth++;
      cur = cur.parentId ? map.get(cur.parentId) : null;
    }
    return depth;
  }

  function countAllComments(tree) {
    return tree.reduce((sum, c) => sum + 1 + countAllComments(c.replies), 0);
  }

  function defaultState() {
    return {
      nickname: '猪猪妈妈',
      posts: JSON.parse(JSON.stringify(POSTS)),
      comments: JSON.parse(JSON.stringify(COMMENTS)),
      notifications: JSON.parse(JSON.stringify(NOTIFICATIONS)),
      browseHistory: [],
      favorites: { articles: [], posts: [], experiences: [] },
      likedPosts: [],
      myPosts: [],
      drafts: [],
      settings: {
        pushEnabled: true,
        darkMode: false,
        fontSize: 'medium',
        recordHistory: true,
        commentPermission: 'all',
        profileVisibility: 'all'
      },
      blockedUsers: [],
      blockedPosts: [],
      followList: FOLLOW_LIST.map(f => f.id)
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.posts) parsed.posts = stripResolvedFromPosts(parsed.posts);
        if (parsed.comments) parsed.comments = normalizeComments(parsed.comments);
        return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } };
      }
    } catch (e) { /* ignore */ }
    return defaultState();
  }

  function saveState() {
    state.blockedUsers = [...blockedUsers];
    state.blockedPosts = [...blockedPosts];
    state.posts = stripResolvedFromPosts(state.posts);
    state.comments = normalizeComments(state.comments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-font', state.settings.fontSize);
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + '天前';
    return d.toLocaleDateString('zh-CN');
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /** 「我的」列表项：左侧内容 + 右侧箭头 */
  function menuItemHtml(onclick, iconClass, label, opts = {}) {
    const badge = opts.badge ? `<span class="menu-badge">${opts.badge}</span>` : '';
    const arrow = opts.showArrow === false ? '' : '<span class="menu-item-arrow"><i class="fas fa-chevron-right"></i></span>';
    const itemStyle = opts.itemStyle ? ` style="${opts.itemStyle}"` : '';
    const iconStyle = opts.iconStyle ? ` style="${opts.iconStyle}"` : '';
    return `<div class="menu-item"${itemStyle} onclick="${onclick}">
      <div class="menu-item-left">
        <i class="${iconClass}"${iconStyle}></i>
        <span class="menu-item-label">${label}</span>
        ${badge}
      </div>
      ${arrow}
    </div>`;
  }

  function getUserProfile(userId) {
    if (USER_PROFILES[userId]) return USER_PROFILES[userId];
    const post = state.posts.find(p => p.authorId === userId);
    return {
      id: userId,
      name: post?.authorName || '用户',
      avatar: '👤',
      bio: '这位同学还没有填写简介'
    };
  }

  function getPostsByUser(userId) {
    return state.posts
      .filter(p => p.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function getShareCount(post) {
    return post.shareCount ?? 0;
  }

  function openUserProfile(userId) {
    viewingUserId = userId;
    const profile = getUserProfile(userId);
    document.getElementById('userProfilePageTitle').textContent = profile.name;
    renderUserProfilePage(userId);
    document.getElementById('user-profile-view').classList.remove('hidden');
    document.querySelector('.bottom-nav').classList.add('hidden');
  }

  function backFromUserProfile() {
    viewingUserId = null;
    document.getElementById('user-profile-view').classList.add('hidden');
    document.querySelector('.bottom-nav').classList.remove('hidden');
  }

  function renderUserProfilePage(userId) {
    const profile = getUserProfile(userId);
    const posts = getPostsByUser(userId);
    const isFollowing = state.followList.includes(userId);
    const totalLikes = posts.reduce((s, p) => s + p.likeCount, 0);

    const postsHtml = posts.length
      ? posts.map(p => `
        <div class="user-post-item" onclick="App.showPostDetail('${p.id}')">
          <div class="user-post-time">${formatTime(p.createdAt)} · ${POST_TYPE_LABELS[p.type]}</div>
          <div class="user-post-content">${escapeHtml(p.content)}</div>
          <div class="user-post-stats">
            <span><i class="fas fa-heart"></i>${p.likeCount}</span>
            <span><i class="fas fa-comment"></i>${p.commentCount}</span>
            <span><i class="fas fa-share"></i>${getShareCount(p)}</span>
          </div>
        </div>`).join('')
      : `<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无发帖记录</p></div>`;

    document.getElementById('userProfileContent').innerHTML = `
      <div class="user-profile-banner">
        <div class="user-profile-top">
          <div class="user-profile-avatar">${profile.avatar}</div>
          <div>
            <div class="user-profile-name">${escapeHtml(profile.name)}</div>
            <div class="user-profile-id">ID: ${profile.id}</div>
          </div>
        </div>
        <div class="user-profile-bio">${escapeHtml(profile.bio)}</div>
        <div class="user-profile-stats">
          <div><strong>${posts.length}</strong>帖子</div>
          <div><strong>${totalLikes}</strong>获赞</div>
        </div>
        ${userId !== USER_ID ? `
          <button class="btn-primary" style="margin-top:14px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.5);"
            onclick="App.toggleFollowFromProfile('${userId}')">
            ${isFollowing ? '已关注' : '+ 关注'}
          </button>` : ''}
      </div>
      <div class="user-posts-title">历史发帖 (${posts.length})</div>
      ${postsHtml}`;
  }

  function toggleFollowFromProfile(userId) {
    const idx = state.followList.indexOf(userId);
    if (idx >= 0) {
      state.followList.splice(idx, 1);
      toast('已取消关注');
    } else {
      state.followList.push(userId);
      toast('关注成功');
    }
    saveState();
    renderUserProfilePage(userId);
    if (profileSubPage === 'follow') renderSubContent('follow');
  }

  /* ---- 模态框 ---- */
  function showModal(title, bodyHtml, onClose) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-box">
          <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close" id="modalClose"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
        </div>
      </div>`;
    const overlay = document.getElementById('modalOverlay');
    const close = () => { container.innerHTML = ''; if (onClose) onClose(); };
    document.getElementById('modalClose').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  }

  function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
  }

  /* ---- Tab 切换 ---- */
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('tab-' + tab).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });
    document.getElementById('fabPublish').classList.toggle('hidden', tab !== 'community');
    if (tab === 'community') renderPosts();
    if (tab === 'profile') renderProfile();
  }

  /* ---- 主页：板块网格 ---- */
  function renderSections() {
    const grid = document.getElementById('sectionGrid');
    grid.innerHTML = SECTIONS.map(s => `
      <div class="section-card" onclick="App.openSection('${s.id}')">
        <div class="section-icon" style="background:${s.color}">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>`).join('');
  }

  /* ---- 搜索 ---- */
  function doSearch(keyword) {
    const resultsEl = document.getElementById('searchResults');
    const gridEl = document.getElementById('sectionGrid');
    const banner = document.querySelector('.home-banner');
    const clearBtn = document.getElementById('clearSearch');

    if (!keyword.trim()) {
      resultsEl.classList.add('hidden');
      gridEl.classList.remove('hidden');
      banner.classList.remove('hidden');
      clearBtn.classList.add('hidden');
      return;
    }

    clearBtn.classList.remove('hidden');
    gridEl.classList.add('hidden');
    banner.classList.add('hidden');
    resultsEl.classList.remove('hidden');

    const kw = keyword.toLowerCase();
    const results = [];

    BASIC_ARTICLES.forEach(a => {
      const text = (a.title + a.steps.join('')).toLowerCase();
      if (text.includes(kw)) results.push({ ...a, matchType: '基础知识', desc: a.steps[0] });
    });
    CCNU_INFOS.forEach(c => {
      const text = (c.title + c.description + (c.address || '')).toLowerCase();
      if (text.includes(kw)) results.push({ ...c, matchType: '[校内]', desc: c.description });
    });
    EXPERIENCES.forEach(e => {
      const text = (e.title + e.summary).toLowerCase();
      if (text.includes(kw)) results.push({ ...e, matchType: '[经验]', desc: e.summary });
    });
    state.posts.forEach(p => {
      const text = (p.title + p.content).toLowerCase();
      if (text.includes(kw)) results.push({ id: p.id, type: 'post', title: p.title, sectionId: p.sectionId, matchType: '帖子', desc: p.content.slice(0, 60) });
    });
    SECTIONS.forEach(s => {
      if (s.title.includes(keyword) || s.description.includes(keyword)) {
        results.push({ id: s.id, type: 'section', title: s.title, matchType: '板块', desc: s.description });
      }
    });

    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>未找到相关内容</p></div>';
      return;
    }

    resultsEl.innerHTML = results.map(r => `
      <div class="result-item" onclick="App.handleSearchResult('${r.type || 'article'}','${r.id}','${r.sectionId || ''}','${r.postId || ''}')">
        <div class="result-type">${r.matchType}</div>
        <div class="result-title">${escapeHtml(r.title)}</div>
        <div class="result-desc">${escapeHtml(r.desc || '')}</div>
        ${r.sectionId ? `<div class="result-desc">${SECTION_MAP[r.sectionId]?.title || ''}</div>` : ''}
      </div>`).join('');
  }

  function handleSearchResult(type, id, sectionId, postId) {
    if (type === 'section') { openSection(id); return; }
    if (type === 'post') { switchTab('community'); showPostDetail(id); return; }
    if (type === 'experience') { showPostDetail(postId); return; }
    if (type === 'ccnu') {
      const item = CCNU_INFOS.find(c => c.id === id);
      if (item) showItemDetail(item);
      return;
    }
    const item = BASIC_ARTICLES.find(a => a.id === id);
    if (item) showItemDetail(item);
  }

  /* ---- 板块详情 ---- */
  function openSection(sectionId) {
    currentSection = sectionId;
    currentSectionTab = 'basic';
    document.getElementById('home-main').classList.add('hidden');
    document.getElementById('section-detail').classList.remove('hidden');
    document.getElementById('sectionDetailTitle').textContent = SECTION_MAP[sectionId].title;
    renderSectionTabs();
    renderSectionItems();
  }

  function goBackSection() {
    currentSection = null;
    document.getElementById('section-detail').classList.add('hidden');
    document.getElementById('home-main').classList.remove('hidden');
  }

  function renderSectionTabs() {
    const tabs = [
      { key: 'basic', label: '基础知识' },
      { key: 'ccnu', label: 'CCNU专属' },
      { key: 'experience', label: '经验分享' }
    ];
    document.getElementById('sectionSubTabs').innerHTML = tabs.map(t => `
      <div class="sub-tab ${currentSectionTab === t.key ? 'active' : ''}" onclick="App.setSectionTab('${t.key}')">${t.label}</div>
    `).join('');
  }

  function setSectionTab(key) {
    currentSectionTab = key;
    renderSectionTabs();
    renderSectionItems();
  }

  function renderSectionItems() {
    const list = document.getElementById('sectionItemList');
    let items = [];
    if (currentSectionTab === 'basic') {
      items = BASIC_ARTICLES.filter(a => a.sectionId === currentSection);
    } else if (currentSectionTab === 'ccnu') {
      items = CCNU_INFOS.filter(c => c.sectionId === currentSection);
    } else {
      items = EXPERIENCES.filter(e => e.sectionId === currentSection);
    }

    if (items.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无内容</p></div>';
      return;
    }

    list.innerHTML = items.map(item => {
      let tag = '';
      if (item.type === 'ccnu') tag = '<span class="tag-campus">[校内]</span>';
      if (item.type === 'experience') tag = '<span class="tag-exp">[经验]</span>';

      let desc = '';
      if (item.steps) desc = item.steps.map((s, i) => `<div class="item-step">${i + 1}. ${escapeHtml(s)}</div>`).join('');
      else if (item.description) desc = `<div class="item-desc">${escapeHtml(item.description)}</div>`;
      else if (item.summary) desc = `<div class="item-desc">${escapeHtml(item.summary)}</div>`;

      return `<div class="item-card" onclick="App.onItemClick('${item.type || 'article'}','${item.id}','${item.postId || ''}')">
        <div class="item-title">${tag}${escapeHtml(item.title)}</div>${desc}
      </div>`;
    }).join('');
  }

  function onItemClick(type, id, postId) {
    if (type === 'experience') { showPostDetail(postId); return; }
    const item = type === 'ccnu'
      ? CCNU_INFOS.find(c => c.id === id)
      : BASIC_ARTICLES.find(a => a.id === id);
    if (item) showItemDetail(item);
  }

  function showItemDetail(item) {
    addHistory({ type: item.type || 'article', title: item.title, targetId: item.id, sectionId: item.sectionId });
    let body = '';
    if (item.steps) {
      body = '<h3 style="margin-bottom:12px;">操作步骤</h3>' +
        item.steps.map((s, i) => `<p><strong>${i + 1}.</strong> ${escapeHtml(s)}</p>`).join('') +
        (item.officialUrl ? `<p style="margin-top:12px;"><a href="${item.officialUrl}" target="_blank" style="color:var(--secondary);">🔗 ${item.officialName || '官方链接'}</a></p>` : '');
    } else {
      body = `<p>${escapeHtml(item.description || item.content || '')}</p>`;
      if (item.address) body += `<div class="info-row"><span class="info-label">地址</span><span>${escapeHtml(item.address)}</span></div>`;
      if (item.time) body += `<div class="info-row"><span class="info-label">时间</span><span>${escapeHtml(item.time)}</span></div>`;
      if (item.price) body += `<div class="info-row"><span class="info-label">价格</span><span>${escapeHtml(item.price)}</span></div>`;
      if (item.phone) body += `<div class="info-row"><span class="info-label">电话</span><span>${escapeHtml(item.phone)}</span></div>`;
    }
    showModal(item.title, body);
  }

  function addHistory(entry) {
    if (!state.settings.recordHistory) return;
    state.browseHistory.unshift({ ...entry, id: 'h_' + Date.now(), viewedAt: new Date().toISOString() });
    if (state.browseHistory.length > 50) state.browseHistory.length = 50;
    saveState();
  }

  /* ---- 社群 ---- */
  function renderTagFilter() {
    document.getElementById('tagFilter').innerHTML = PRESET_TAGS.map(t => `
      <div class="filter-tag ${currentTagFilter === t ? 'active' : ''}" onclick="App.setTagFilter('${t}')">${t}</div>
    `).join('');
  }

  function setTagFilter(tag) {
    currentTagFilter = tag;
    renderTagFilter();
    renderPosts();
  }

  function getVisiblePosts() {
    return state.posts.filter(p => {
      if (blockedPosts.has(p.id) || blockedUsers.has(p.authorId)) return false;
      if (currentTagFilter === '全部') return true;
      return p.tags.includes(currentTagFilter);
    });
  }

  function renderPosts() {
    const posts = getVisiblePosts();
    const list = document.getElementById('postList');
    if (posts.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>暂无帖子</p></div>';
      return;
    }
    list.innerHTML = posts.map(p => {
      const liked = state.likedPosts.includes(p.id);
      const favorited = state.favorites.posts.includes(p.id);
      const useful = (p.usefulBy || []).includes(USER_ID);
      const author = getUserProfile(p.authorId);
      return `
      <div class="post-card" data-id="${p.id}">
        <div class="post-header">
          <span class="post-type ${p.type}">${POST_TYPE_LABELS[p.type]}</span>
          <button class="post-menu" onclick="App.showPostMenu('${p.id}')"><i class="fas fa-ellipsis-v"></i></button>
        </div>
        <div class="post-author" onclick="App.openUserProfile('${p.authorId}')">
          <span class="post-author-avatar">${author.avatar}</span>
          <span class="post-author-name">${escapeHtml(p.authorName)}</span>
        </div>
        <div class="post-title" onclick="App.showPostDetail('${p.id}')">
          ${escapeHtml(p.title)}
        </div>
        <div class="post-content" onclick="App.showPostDetail('${p.id}')">${escapeHtml(p.content)}</div>
        <div class="post-tags">${p.tags.map(t => `<span class="post-tag">${t}</span>`).join('')}</div>
        <div class="post-meta">
          <span>${formatTime(p.createdAt)}</span>
          <span><i class="fas fa-comment"></i> ${p.commentCount} · <i class="fas fa-heart"></i> ${p.likeCount} · <i class="fas fa-share"></i> ${getShareCount(p)}</span>
        </div>
        <div class="post-actions">
          <button class="action-btn ${liked ? 'active' : ''}" onclick="App.toggleLike('${p.id}')"><i class="fas fa-heart"></i> ${p.likeCount}</button>
          <button class="action-btn" onclick="App.showPostDetail('${p.id}')"><i class="fas fa-comment"></i> ${p.commentCount}</button>
          <button class="action-btn ${favorited ? 'active' : ''}" onclick="App.toggleFavorite('${p.id}')"><i class="fas fa-star"></i> ${p.favoriteCount}</button>
          ${p.type === 'help' ? `<button class="action-btn ${useful ? 'active' : ''}" onclick="App.toggleUseful('${p.id}')"><i class="fas fa-thumbs-up"></i> 有用 ${p.usefulCount || 0}</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function toggleLike(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    const idx = state.likedPosts.indexOf(postId);
    if (idx >= 0) { state.likedPosts.splice(idx, 1); post.likeCount--; toast('已取消点赞'); }
    else { state.likedPosts.push(postId); post.likeCount++; toast('点赞成功'); }
    saveState();
    renderPosts();
  }

  function toggleFavorite(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    const idx = state.favorites.posts.indexOf(postId);
    if (idx >= 0) { state.favorites.posts.splice(idx, 1); post.favoriteCount--; toast('已取消收藏'); }
    else { state.favorites.posts.push(postId); post.favoriteCount++; toast('收藏成功'); }
    saveState();
    renderPosts();
  }

  function toggleUseful(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    if (!post.usefulBy) post.usefulBy = [];
    const idx = post.usefulBy.indexOf(USER_ID);
    if (idx >= 0) { post.usefulBy.splice(idx, 1); post.usefulCount--; toast('已取消标记'); }
    else { post.usefulBy.push(USER_ID); post.usefulCount++; toast('已标记为有用'); }
    saveState();
    renderPosts();
  }

  function showPostMenu(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    showModal('帖子管理', `
      <button class="btn-primary" style="margin-bottom:8px;" onclick="App.reportPost('${postId}')">举报帖子</button>
      <button class="btn-secondary" onclick="App.blockUser('${post.authorId}','${escapeHtml(post.authorName)}')">屏蔽用户 ${escapeHtml(post.authorName)}</button>
    `);
  }

  function reportPost(postId) {
    closeModal();
    const reasons = REPORT_REASONS.map(r =>
      `<button class="btn-secondary" style="margin-bottom:6px;" onclick="App.submitReport('${postId}','${r}')">${r}</button>`
    ).join('');
    showModal('举报原因', reasons);
  }

  function submitReport(postId, reason) {
    closeModal();
    toast('举报已提交，感谢反馈');
  }

  function blockUser(userId, name) {
    closeModal();
    blockedUsers.add(userId);
    saveState();
    renderPosts();
    toast('已屏蔽用户：' + name);
  }

  function renderCommentHtml(comment, depth, postId) {
    const canReply = depth < 3;
    const indent = (depth - 1) * 20;
    let html = `
      <div class="comment-item" style="margin-left:${indent}px">
        <div class="comment-header-row">
          <span class="comment-author">${escapeHtml(comment.authorName)}</span>
          <span class="comment-time">${formatTime(comment.createdAt)}</span>
          ${canReply ? `<button type="button" class="comment-reply-btn" onclick="App.toggleReplyForm('${comment.id}')">回复</button>` : ''}
        </div>
        <div class="comment-text">${escapeHtml(comment.content)}</div>
        ${canReply ? `
        <div class="reply-form hidden" id="reply-form-${comment.id}">
          <input type="text" id="reply-name-${comment.id}" placeholder="你的姓名" value="${escapeHtml(state.nickname)}">
          <textarea id="reply-content-${comment.id}" placeholder="写下回复…"></textarea>
          <button type="button" onclick="App.submitReply('${postId}','${comment.id}')">提交</button>
        </div>` : ''}
      </div>`;
    comment.replies.forEach(child => { html += renderCommentHtml(child, depth + 1, postId); });
    return html;
  }

  function showPostDetail(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    addHistory({ type: 'post', title: post.title, targetId: postId, sectionId: post.sectionId });
    const flat = state.comments.filter(c => c.postId === postId);
    const tree = buildCommentTree(flat);
    const commentTotal = countAllComments(tree);
    const commentsHtml = tree.length
      ? tree.map(c => renderCommentHtml(c, 1, postId)).join('')
      : '<p style="color:var(--text-secondary);font-size:0.85rem;">暂无评论</p>';

    showModal(post.title, `
      <div style="margin-bottom:12px;">
        <span class="post-type ${post.type}">${POST_TYPE_LABELS[post.type]}</span>
      </div>
      <p style="line-height:1.7;margin-bottom:12px;">${escapeHtml(post.content)}</p>
      <div class="post-tags" style="margin-bottom:12px;">${post.tags.map(t => `<span class="post-tag">${t}</span>`).join('')}</div>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:16px;">
        <span class="post-author" style="display:inline-flex;margin:0;" onclick="App.openUserProfile('${post.authorId}')">
          <span class="post-author-avatar" style="width:24px;height:24px;font-size:0.85rem;">${getUserProfile(post.authorId).avatar}</span>
          <span class="post-author-name">${escapeHtml(post.authorName)}</span>
        </span>
        · ${formatTime(post.createdAt)}
      </p>
      <h3 style="margin-bottom:8px;font-size:0.95rem;">评论 (${commentTotal})</h3>
      ${commentsHtml}
      <div class="comment-input-row">
        <input type="text" id="commentInput" placeholder="写下你的评论…">
        <button onclick="App.submitComment('${postId}')">发送</button>
      </div>
    `);
  }

  function toggleReplyForm(commentId) {
    const form = document.getElementById('reply-form-' + commentId);
    if (form) form.classList.toggle('hidden');
  }

  function submitReply(postId, parentId) {
    const nameEl = document.getElementById('reply-name-' + parentId);
    const contentEl = document.getElementById('reply-content-' + parentId);
    const authorName = nameEl?.value?.trim();
    const content = contentEl?.value?.trim();
    if (!authorName || !content) { toast('姓名和内容不能为空'); return; }
    const flat = state.comments.filter(c => c.postId === postId);
    if (getCommentDepth(flat, parentId) >= 3) { toast('已达最大回复层级'); return; }
    state.comments.push({
      id: 'c_' + Date.now(), postId, parentId, authorId: USER_ID, authorName,
      content, createdAt: new Date().toISOString()
    });
    const post = state.posts.find(p => p.id === postId);
    if (post) post.commentCount++;
    saveState();
    toast('回复成功');
    closeModal();
    showPostDetail(postId);
  }

  function submitComment(postId) {
    const input = document.getElementById('commentInput');
    const content = input?.value?.trim();
    if (!content) { toast('请输入评论内容'); return; }
    state.comments.push({
      id: 'c_' + Date.now(), postId, parentId: null, authorId: USER_ID, authorName: state.nickname,
      content, createdAt: new Date().toISOString()
    });
    const post = state.posts.find(p => p.id === postId);
    if (post) post.commentCount++;
    saveState();
    toast('评论成功');
    closeModal();
    showPostDetail(postId);
  }

  /* ---- 发布帖子 ---- */
  function showPublishForm(draft) {
    const d = draft || { type: 'help', title: '', content: '', tags: [], images: [] };
    showModal('发布帖子', `
      <div class="form-group">
        <label>发布类型</label>
        <select id="pubType">
          <option value="help" ${d.type === 'help' ? 'selected' : ''}>求助</option>
          <option value="share" ${d.type === 'share' ? 'selected' : ''}>分享</option>
          <option value="trade" ${d.type === 'trade' ? 'selected' : ''}>交易</option>
        </select>
      </div>
      <div class="form-group">
        <label>标题</label>
        <input type="text" id="pubTitle" value="${escapeHtml(d.title)}" placeholder="输入标题">
      </div>
      <div class="form-group">
        <label>内容</label>
        <textarea id="pubContent" placeholder="详细描述…">${escapeHtml(d.content)}</textarea>
      </div>
      <div class="form-group">
        <label>图片（可选）</label>
        <input type="file" id="pubImage" accept="image/*" multiple onchange="App.previewImages(this)">
        <div class="img-preview" id="imgPreview"></div>
      </div>
      <div class="form-group">
        <label>标签选择</label>
        <div class="tag-select" id="pubTags">${PRESET_TAGS.filter(t => t !== '全部').map(t =>
          `<span class="tag-option ${d.tags.includes(t) ? 'selected' : ''}" data-tag="${t}" onclick="this.classList.toggle('selected')">${t}</span>`
        ).join('')}</div>
      </div>
      <button class="btn-primary" onclick="App.submitPost()">发布</button>
      <button class="btn-secondary" onclick="App.saveDraft()">存为草稿</button>
    `);
  }

  function previewImages(input) {
    const preview = document.getElementById('imgPreview');
    preview.innerHTML = '';
    [...input.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML += `<img src="${e.target.result}" alt="preview">`;
      };
      reader.readAsDataURL(file);
    });
  }

  function submitPost() {
    const type = document.getElementById('pubType').value;
    const title = document.getElementById('pubTitle').value.trim();
    const content = document.getElementById('pubContent').value.trim();
    const tags = [...document.querySelectorAll('#pubTags .tag-option.selected')].map(el => el.dataset.tag);
    if (!title || !content) { toast('请填写标题和内容'); return; }
    if (tags.length === 0) { toast('请至少选择一个标签'); return; }

    const newPost = {
      id: 'post_' + Date.now(), type, sectionId: 'life', title, content,
      images: [], tags, authorId: USER_ID, authorName: state.nickname,
      createdAt: new Date().toISOString(),
      likeCount: 0, commentCount: 0, favoriteCount: 0, usefulCount: 0, shareCount: 0,
      usefulBy: []
    };
    state.posts.unshift(newPost);
    state.myPosts.unshift(newPost.id);
    saveState();
    closeModal();
    toast('发布成功！');
    renderPosts();
  }

  function saveDraft() {
    const draft = {
      id: 'draft_' + Date.now(),
      type: document.getElementById('pubType').value,
      title: document.getElementById('pubTitle').value.trim(),
      content: document.getElementById('pubContent').value.trim(),
      tags: [...document.querySelectorAll('#pubTags .tag-option.selected')].map(el => el.dataset.tag),
      images: [], savedAt: new Date().toISOString()
    };
    state.drafts.push(draft);
    saveState();
    closeModal();
    toast('已保存到草稿箱');
  }

  /* ---- 我的页面 ---- */
  function renderProfile() {
    document.getElementById('profileNickname').textContent = state.nickname;
    document.getElementById('profileId').textContent = 'ID: ' + USER_ID;
    const unread = state.notifications.filter(n => !n.read).length;
    document.getElementById('profileMenu').innerHTML = `
      <div class="menu-group">
        ${menuItemHtml("App.openProfileSub('myQuestions')", 'fas fa-question-circle', '我的提问')}
        ${menuItemHtml("App.openProfileSub('favorites')", 'fas fa-star', '我的收藏')}
        ${menuItemHtml("App.openProfileSub('history')", 'fas fa-clock', '浏览历史')}
        ${menuItemHtml("App.openProfileSub('likesComments')", 'fas fa-heart', '点赞/评论记录')}
        ${menuItemHtml("App.openProfileSub('follow')", 'fas fa-user-plus', '我的关注')}
        ${menuItemHtml("App.openProfileSub('notifications')", 'fas fa-bell', '系统通知', { badge: unread || null })}
      </div>
      <div class="menu-group">
        ${menuItemHtml("App.openProfileSub('settings')", 'fas fa-cog', '设置管理')}
      </div>`;
  }

  function editNickname() {
    const name = prompt('修改昵称', state.nickname);
    if (name && name.trim()) {
      state.nickname = name.trim();
      saveState();
      renderProfile();
      toast('昵称已更新');
    }
  }

  function openProfileSub(page) {
    profileSubPage = page;
    document.getElementById('profile-main').classList.add('hidden');
    const sub = document.getElementById('profile-sub');
    sub.classList.remove('hidden');
    const titles = {
      myQuestions: '我的提问', favorites: '我的收藏', history: '浏览历史',
      likesComments: '点赞/评论记录', follow: '我的关注', notifications: '系统通知',
      settings: '设置管理', accountSecurity: '账号安全', generalSettings: '通用设置',
      privacySettings: '隐私设置', helpFeedback: '帮助与反馈', about: '关于我们',
      drafts: '草稿箱', posts: '发帖记录', collectedQuestions: '收藏问题'
    };
    sub.innerHTML = `<div class="page-header">
      <button class="back-btn" onclick="App.backProfile()"><i class="fas fa-arrow-left"></i></button>
      <h1>${titles[page] || page}</h1>
    </div><div id="subContent"></div>`;
    renderSubContent(page);
  }

  function backProfile() {
    if (['accountSecurity', 'generalSettings', 'privacySettings', 'helpFeedback', 'about'].includes(profileSubPage)) {
      openProfileSub('settings');
      return;
    }
    if (['drafts', 'posts', 'collectedQuestions'].includes(profileSubPage)) {
      openProfileSub('myQuestions');
      return;
    }
    profileSubPage = null;
    document.getElementById('profile-sub').classList.add('hidden');
    document.getElementById('profile-main').classList.remove('hidden');
    renderProfile();
  }

  function renderSubContent(page) {
    const el = document.getElementById('subContent');
    switch (page) {
      case 'myQuestions':
        el.innerHTML = `
          <div class="menu-group" style="margin:12px 16px;">
            ${menuItemHtml("App.openProfileSub('posts')", 'fas fa-edit', '发帖记录')}
            ${menuItemHtml("App.openProfileSub('collectedQuestions')", 'fas fa-bookmark', '收藏问题')}
            ${menuItemHtml("App.openProfileSub('drafts')", 'fas fa-file-alt', `草稿箱 (${state.drafts.length})`)}
          </div>
          <div style="padding:0 16px;color:var(--text-secondary);font-size:0.85rem;">历史答疑：你发布或参与的求助帖会显示在发帖记录中。</div>`;
        break;
      case 'posts':
        profileSubPage = 'posts';
        const myPostIds = [...new Set([...state.myPosts, ...state.posts.filter(p => p.authorId === USER_ID).map(p => p.id)])];
        const myPosts = state.posts.filter(p => myPostIds.includes(p.id));
        el.innerHTML = myPosts.length ? myPosts.map(p => `
          <div class="list-entry" onclick="App.showPostDetail('${p.id}')">
            <div class="list-entry-title">${escapeHtml(p.title)}</div>
            <div class="list-entry-desc">${POST_TYPE_LABELS[p.type]} · ${formatTime(p.createdAt)}</div>
          </div>`).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无发帖记录</p></div>';
        break;
      case 'collectedQuestions':
        profileSubPage = 'collectedQuestions';
        const helpFavs = state.favorites.posts.map(id => state.posts.find(p => p.id === id)).filter(p => p && p.type === 'help');
        el.innerHTML = helpFavs.length ? helpFavs.map(p => `
          <div class="list-entry" onclick="App.showPostDetail('${p.id}')">
            <div class="list-entry-title">${escapeHtml(p.title)}</div>
            <div class="list-entry-desc">${formatTime(p.createdAt)}</div>
          </div>`).join('') : '<div class="empty-state"><i class="fas fa-bookmark"></i><p>暂无收藏问题</p></div>';
        break;
      case 'drafts':
        profileSubPage = 'drafts';
        el.innerHTML = state.drafts.length ? state.drafts.map((d, i) => `
          <div class="list-entry" onclick="App.editDraft(${i})">
            <div class="list-entry-title">${escapeHtml(d.title || '无标题草稿')}</div>
            <div class="list-entry-desc">${formatTime(d.savedAt)}</div>
          </div>`).join('') : '<div class="empty-state"><i class="fas fa-file-alt"></i><p>草稿箱为空</p></div>';
        break;
      case 'favorites':
        const favPosts = state.favorites.posts.map(id => state.posts.find(p => p.id === id)).filter(Boolean);
        el.innerHTML = favPosts.length ? favPosts.map(p => `
          <div class="list-entry" onclick="App.showPostDetail('${p.id}')">
            <div class="list-entry-title">${escapeHtml(p.title)} <span class="post-tag">经验帖</span></div>
            <div class="list-entry-desc">${formatTime(p.createdAt)}</div>
          </div>`).join('') : '<div class="empty-state"><i class="fas fa-star"></i><p>暂无收藏</p></div>';
        break;
      case 'history':
        el.innerHTML = state.browseHistory.length ? state.browseHistory.map(h => `
          <div class="list-entry">
            <div class="list-entry-title">${escapeHtml(h.title)}</div>
            <div class="list-entry-desc">${h.type} · ${formatTime(h.viewedAt)}</div>
          </div>`).join('') : '<div class="empty-state"><i class="fas fa-clock"></i><p>暂无浏览历史</p></div>';
        break;
      case 'likesComments':
        const liked = state.likedPosts.map(id => state.posts.find(p => p.id === id)).filter(Boolean);
        const myComments = state.comments.filter(c => c.authorId === USER_ID);
        el.innerHTML = `
          <h3 style="padding:12px 16px 4px;font-size:0.9rem;">点赞记录</h3>
          ${liked.length ? liked.map(p => `<div class="list-entry" onclick="App.showPostDetail('${p.id}')"><div class="list-entry-title">${escapeHtml(p.title)}</div></div>`).join('') : '<div class="empty-state" style="padding:16px;"><p>暂无点赞</p></div>'}
          <h3 style="padding:12px 16px 4px;font-size:0.9rem;">评论记录</h3>
          ${myComments.length ? myComments.map(c => `<div class="list-entry"><div class="list-entry-title">${escapeHtml(c.content)}</div><div class="list-entry-desc">${formatTime(c.createdAt)}</div></div>`).join('') : '<div class="empty-state" style="padding:16px;"><p>暂无评论</p></div>'}`;
        break;
      case 'follow':
        el.innerHTML = `<div class="menu-group" style="margin:12px 16px;">` +
          FOLLOW_LIST.map(f => {
            const profile = getUserProfile(f.id);
            return `
          <div class="follow-item">
            <div class="follow-user-info" onclick="App.openUserProfile('${f.id}')">
              <div class="follow-avatar">${profile.avatar}</div>
              <div>
                <div class="follow-name">${escapeHtml(f.name)}</div>
                <div class="follow-desc">${escapeHtml(f.desc)}</div>
              </div>
            </div>
            <button class="toggle ${state.followList.includes(f.id) ? 'on' : ''}" onclick="event.stopPropagation();App.toggleFollow('${f.id}',this)"></button>
          </div>`;
          }).join('') + `</div>`;
        break;
      case 'notifications':
        el.innerHTML = state.notifications.map(n => `
          <div class="list-entry" style="${n.read ? 'opacity:0.6' : ''}" onclick="App.readNotification('${n.id}')">
            <div class="list-entry-title">${escapeHtml(n.title)} ${n.read ? '' : '<span class="menu-badge">新</span>'}</div>
            <div class="list-entry-desc">${escapeHtml(n.content)}</div>
          </div>`).join('');
        break;
      case 'settings':
        el.innerHTML = `
          <div class="menu-group" style="margin:12px 16px;">
            ${menuItemHtml("App.openProfileSub('accountSecurity')", 'fas fa-lock', '账号安全')}
            ${menuItemHtml("App.openProfileSub('generalSettings')", 'fas fa-sliders-h', '通用设置')}
            ${menuItemHtml("App.openProfileSub('privacySettings')", 'fas fa-user-shield', '隐私设置')}
            ${menuItemHtml("App.openProfileSub('helpFeedback')", 'fas fa-life-ring', '帮助与反馈')}
            ${menuItemHtml("App.openProfileSub('about')", 'fas fa-info-circle', '关于我们')}
          </div>`;
        break;
      case 'accountSecurity':
        profileSubPage = 'accountSecurity';
        el.innerHTML = `
          <div class="menu-group" style="margin:12px 16px;">
            ${menuItemHtml('App.changePassword()', 'fas fa-key', '修改密码')}
            ${menuItemHtml('App.bindPhone()', 'fas fa-mobile-alt', '绑定手机')}
            ${menuItemHtml('App.logout()', 'fas fa-sign-out-alt', '退出登录', { showArrow: false, itemStyle: 'color:#DC2626', iconStyle: 'color:#DC2626' })}
          </div>`;
        break;
      case 'generalSettings':
        profileSubPage = 'generalSettings';
        el.innerHTML = `
          <div class="setting-item"><span>消息推送</span><button class="toggle ${state.settings.pushEnabled ? 'on' : ''}" onclick="App.toggleSetting('pushEnabled',this)"></button></div>
          <div class="setting-item"><span>深色模式</span><button class="toggle ${state.settings.darkMode ? 'on' : ''}" onclick="App.toggleSetting('darkMode',this)"></button></div>
          <div class="setting-item"><span>字体大小</span>
            <select class="setting-select" onchange="App.setFontSize(this.value)">
              <option value="small" ${state.settings.fontSize === 'small' ? 'selected' : ''}>小</option>
              <option value="medium" ${state.settings.fontSize === 'medium' ? 'selected' : ''}>中</option>
              <option value="large" ${state.settings.fontSize === 'large' ? 'selected' : ''}>大</option>
            </select>
          </div>`;
        break;
      case 'privacySettings':
        profileSubPage = 'privacySettings';
        el.innerHTML = `
          <div class="setting-item"><span>记录浏览历史</span><button class="toggle ${state.settings.recordHistory ? 'on' : ''}" onclick="App.toggleSetting('recordHistory',this)"></button></div>
          <div class="setting-item"><span>评论权限</span>
            <select class="setting-select" onchange="App.setPrivacy('commentPermission',this.value)">
              <option value="all" ${state.settings.commentPermission === 'all' ? 'selected' : ''}>所有人</option>
              <option value="friends" ${state.settings.commentPermission === 'friends' ? 'selected' : ''}>仅好友</option>
              <option value="self" ${state.settings.commentPermission === 'self' ? 'selected' : ''}>仅自己</option>
            </select>
          </div>
          <div class="setting-item"><span>个人主页可见范围</span>
            <select class="setting-select" onchange="App.setPrivacy('profileVisibility',this.value)">
              <option value="all" ${state.settings.profileVisibility === 'all' ? 'selected' : ''}>公开</option>
              <option value="friends" ${state.settings.profileVisibility === 'friends' ? 'selected' : ''}>仅好友</option>
              <option value="self" ${state.settings.profileVisibility === 'self' ? 'selected' : ''}>仅自己</option>
            </select>
          </div>`;
        break;
      case 'helpFeedback':
        profileSubPage = 'helpFeedback';
        el.innerHTML = `
          <div class="menu-group" style="margin:12px 16px;">
            ${menuItemHtml('App.contactSupport()', 'fas fa-headset', '客服咨询')}
            ${menuItemHtml('App.reportIssue()', 'fas fa-bug', '问题上报')}
          </div>
          <h3 style="padding:12px 16px 4px;">常见 FAQ</h3>
          ${FAQ.map(f => `<div class="faq-item"><div class="faq-q">${f.q}</div><div class="faq-a">${f.a}</div></div>`).join('')}`;
        break;
      case 'about':
        profileSubPage = 'about';
        el.innerHTML = `
          <div class="about-info">
            <div class="about-logo">🐷</div>
            <h2>猪猪妈妈</h2>
            <p class="about-version">版本 1.0.0</p>
            <p style="color:var(--text-secondary);margin-top:8px;font-size:0.85rem;">华中师范大学生活指南</p>
          </div>
          <div class="menu-group" style="margin:12px 16px;">
            ${menuItemHtml('App.showAgreement()', 'fas fa-file-contract', '用户协议')}
            ${menuItemHtml('App.showPrivacy()', 'fas fa-shield-alt', '隐私政策')}
          </div>`;
        break;
    }
  }

  function editDraft(index) {
    showPublishForm(state.drafts[index]);
    state.drafts.splice(index, 1);
    saveState();
  }

  function toggleFollow(userId, btn) {
    const idx = state.followList.indexOf(userId);
    if (idx >= 0) { state.followList.splice(idx, 1); btn.classList.remove('on'); toast('已取消关注'); }
    else { state.followList.push(userId); btn.classList.add('on'); toast('关注成功'); }
    saveState();
  }

  function readNotification(id) {
    const n = state.notifications.find(n => n.id === id);
    if (n) { n.read = true; saveState(); renderProfile(); renderSubContent('notifications'); }
  }

  function toggleSetting(key, btn) {
    state.settings[key] = !state.settings[key];
    btn.classList.toggle('on', state.settings[key]);
    saveState();
    if (key === 'darkMode') toast(state.settings.darkMode ? '已开启深色模式' : '已关闭深色模式');
  }

  function setFontSize(size) {
    state.settings.fontSize = size;
    saveState();
    toast('字体大小已更新');
  }

  function setPrivacy(key, value) {
    state.settings[key] = value;
    saveState();
    toast('设置已保存');
  }

  function changePassword() {
    const pwd = prompt('请输入新密码（演示）');
    if (pwd) toast('密码修改成功');
  }

  function bindPhone() {
    const phone = prompt('请输入手机号');
    if (phone) toast('手机绑定成功：' + phone);
  }

  function logout() {
    if (confirm('确定退出登录？')) toast('已退出登录（演示）');
  }

  function contactSupport() {
    showModal('客服咨询', '<p>请发送邮件至 <strong>support@pigmom.ccnu.edu.cn</strong></p><p style="margin-top:8px;color:var(--text-secondary);font-size:0.85rem;">工作时间：周一至周五 9:00-17:00</p>');
  }

  function reportIssue() {
    const issue = prompt('请描述您遇到的问题');
    if (issue) toast('问题已上报，感谢反馈');
  }

  function showAgreement() {
    showModal('用户协议', `<div class="text-content">${escapeHtml(USER_AGREEMENT)}</div>`);
  }

  function showPrivacy() {
    showModal('隐私政策', `<div class="text-content">${escapeHtml(PRIVACY_POLICY)}</div>`);
  }

  /* ---- 初始化 ---- */
  function init() {
    applyTheme();
    renderSections();
    renderTagFilter();
    renderPosts();
    renderProfile();

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => doSearch(e.target.value));
    document.getElementById('clearSearch').addEventListener('click', () => {
      searchInput.value = '';
      doSearch('');
    });

    document.getElementById('fabPublish').addEventListener('click', () => showPublishForm());

    // 长按帖子举报
    document.getElementById('postList').addEventListener('contextmenu', (e) => {
      const card = e.target.closest('.post-card');
      if (card) { e.preventDefault(); showPostMenu(card.dataset.id); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    openSection, goBackSection, setSectionTab, onItemClick, handleSearchResult,
    setTagFilter, showPostDetail, toggleLike, toggleFavorite, toggleUseful,
    toggleReplyForm, submitReply,
    showPostMenu, reportPost, submitReport, blockUser, submitComment,
    showPublishForm, previewImages, submitPost, saveDraft,
    openProfileSub, backProfile, editNickname, editDraft, toggleFollow, toggleFollowFromProfile,
    openUserProfile, backFromUserProfile,
    readNotification, toggleSetting, setFontSize, setPrivacy,
    changePassword, bindPhone, logout, contactSupport, reportIssue,
    showAgreement, showPrivacy
  };
})();
