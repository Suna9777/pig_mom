import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Post } from '../types';
import { useTheme } from '../context/AppContext';
import { formatRelativeTime, truncate } from '../utils/helpers';
import { POST_TYPE_LABELS } from '../constants/tags';
import { COLORS } from '../constants/theme';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLongPress?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  help: COLORS.help,
  share: COLORS.share,
  trade: COLORS.trade,
};

/** 帖子卡片 */
export function PostCard({ post, onPress, onLongPress }: PostCardProps) {
  const { colors, fonts } = useTheme();
  const displayImages = post.images.slice(0, 9);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: TYPE_COLORS[post.type] + '33' }]}>
          <Text style={[styles.badgeText, { color: TYPE_COLORS[post.type], fontSize: fonts.xs }]}>
            {POST_TYPE_LABELS[post.type]}
          </Text>
        </View>
        {post.type === 'help' && post.resolved && (
          <View style={[styles.badge, { backgroundColor: COLORS.success + '33' }]}>
            <Text style={[styles.badgeText, { color: COLORS.success, fontSize: fonts.xs }]}>已解决</Text>
          </View>
        )}
        <Text style={[styles.time, { color: colors.textSecondary, fontSize: fonts.xs }]}>
          {formatRelativeTime(post.createdAt)}
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: fonts.lg }]}>{post.title}</Text>
      <Text style={[styles.content, { color: colors.textSecondary, fontSize: fonts.sm }]}>
        {truncate(post.content, 100)}
      </Text>
      {displayImages.length > 0 && (
        <View style={styles.imageGrid}>
          {displayImages.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
        </View>
      )}
      <View style={styles.tags}>
        {post.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '22' }]}>
            <Text style={{ color: colors.primary, fontSize: fonts.xs }}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>{post.authorName}</Text>
        <View style={styles.stats}>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>👍 {post.likeCount}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>💬 {post.commentCount}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>⭐ {post.favoriteCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontWeight: '600' },
  time: { marginLeft: 'auto' },
  title: { fontWeight: '700', marginBottom: 6 },
  content: { lineHeight: 20, marginBottom: 8 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  thumb: { width: 80, height: 80, borderRadius: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stats: { flexDirection: 'row', gap: 12 },
});
