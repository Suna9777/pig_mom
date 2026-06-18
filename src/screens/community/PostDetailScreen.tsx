import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityStackParamList, HomeStackParamList, ProfileStackParamList } from '../../types';
import { ImageGrid } from '../../components/ImageViewer';
import { ReportModal } from '../../components/ReportModal';
import { CommentItem } from '../../components/CommentItem';
import { useApp, useTheme } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/helpers';
import { countAllComments } from '../../utils/comments';
import { POST_TYPE_LABELS } from '../../constants/tags';
import { SECTION_MAP } from '../../constants/sections';
import { showFeedback, showToast } from '../../utils/feedback';
import { COLORS } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<
  CommunityStackParamList & HomeStackParamList & ProfileStackParamList,
  'PostDetail'
>;
type RoutePropType = RouteProp<
  CommunityStackParamList & HomeStackParamList & ProfileStackParamList,
  'PostDetail'
>;

/** 帖子详情页 */
export function PostDetailScreen({ navigation, route }: { navigation: NavProp; route: RoutePropType }) {
  const { postId } = route.params;
  const { colors, fonts } = useTheme();
  const {
    getPostById,
    getCommentsByPost,
    addComment,
    toggleLike,
    toggleFavorite,
    toggleUseful,
    blockUser,
    reportContent,
    state,
  } = useApp();
  const post = getPostById(postId);
  const comments = getCommentsByPost(postId);
  const commentTotal = countAllComments(comments);
  const [commentText, setCommentText] = useState('');
  const [reportVisible, setReportVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);

  const isLiked = state.likes.includes(postId);
  const isFavorited = state.favorites.includes(postId);
  const isUseful = state.usefulMarks.includes(postId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setReportTarget({ type: 'post', id: postId });
            setReportVisible(true);
          }}
        >
          <Ionicons name="flag-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, postId, colors]);

  const handleReply = useCallback(
    async (parentId: string, authorName: string, content: string) => {
      await addComment(postId, content, { parentId, authorName });
      showToast('回复成功');
    },
    [addComment, postId]
  );

  const handleReportComment = useCallback((commentId: string) => {
    setReportTarget({ type: 'comment', id: commentId });
    setReportVisible(true);
  }, []);

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>帖子不存在</Text>
      </View>
    );
  }

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(postId, commentText.trim());
    setCommentText('');
    showToast('评论成功');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.badges}>
            <Text style={[styles.badge, { backgroundColor: COLORS[post.type === 'help' ? 'help' : post.type === 'share' ? 'share' : 'trade'] + '33', color: COLORS[post.type === 'help' ? 'help' : post.type === 'share' ? 'share' : 'trade'], fontSize: fonts.xs }]}>
              {POST_TYPE_LABELS[post.type]}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: fonts.xl, fontWeight: '700' }}>{post.title}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginVertical: 8 }}>
            {post.authorName} · {formatRelativeTime(post.createdAt)} · {SECTION_MAP[post.sectionId]?.title}
          </Text>
          <Text style={{ color: colors.text, fontSize: fonts.md, lineHeight: 24 }}>{post.content}</Text>
          <ImageGrid images={post.images} />
          <View style={styles.tags}>
            {post.tags.map((t) => (
              <Text key={t} style={{ color: colors.primary, fontSize: fonts.sm }}>#{t} </Text>
            ))}
          </View>
        </View>

        {/* 互动按钮 */}
        <View style={[styles.actions, { backgroundColor: colors.card }]}>
          <ActionBtn icon="heart" label={`${post.likeCount}`} active={isLiked} onPress={() => { toggleLike(postId); showFeedback(isLiked ? '已取消点赞' : '点赞成功'); }} color={colors.primary} />
          <ActionBtn icon="star" label={`${post.favoriteCount}`} active={isFavorited} onPress={() => { toggleFavorite(postId); showFeedback(isFavorited ? '已取消收藏' : '收藏成功'); }} color={colors.primary} />
          {post.type === 'help' && (
            <ActionBtn icon="checkmark-circle" label={`有用 ${post.usefulCount}`} active={isUseful} onPress={() => { toggleUseful(postId); showFeedback('已标记有用'); }} color={COLORS.success} />
          )}
          <TouchableOpacity onPress={() => { blockUser(post.authorId); showToast('已屏蔽该用户'); }}>
            <Ionicons name="ban" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 评论列表 */}
        <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '600', margin: 16 }}>
          评论 ({commentTotal})
        </Text>
        {comments.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginHorizontal: 16, marginBottom: 12 }}>
            暂无评论，来说两句吧
          </Text>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={1}
              postId={postId}
              defaultAuthorName={state.user.nickname}
              onReply={handleReply}
              onReport={handleReportComment}
            />
          ))
        )}
      </ScrollView>

      {/* 顶级评论输入 */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: colors.text, fontSize: fonts.md, borderColor: colors.border }]}
            placeholder="写评论..."
            placeholderTextColor={colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={handleComment} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onReport={(reason) => {
          if (reportTarget) reportContent(reportTarget.type, reportTarget.id, reason);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function ActionBtn({ icon, label, active, onPress, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; active: boolean; onPress: () => void; color: string }) {
  const outlineIcon = `${icon}-outline` as keyof typeof Ionicons.glyphMap;
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={active ? icon : outlineIcon} size={22} color={active ? color : '#999'} />
      <Text style={{ color: active ? color : '#999', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20 },
  card: { margin: 16, padding: 16, borderRadius: 12 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, marginHorizontal: 16, borderRadius: 10 },
  actionBtn: { alignItems: 'center', gap: 2 },
  inputBar: { padding: 12, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
