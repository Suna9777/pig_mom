import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { PostCard } from '../../components/PostCard';
import { EmptyState } from '../../components/EmptyState';
import { useApp, useTheme } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/helpers';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'LikesComments'> };

/** 点赞/评论记录 */
export function LikesCommentsScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { state } = useApp();
  const [tab, setTab] = useState<'likes' | 'comments'>('likes');

  const likedPosts = state.posts.filter((p) => state.likes.includes(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.tabBar}>
        {(['likes', 'comments'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.textSecondary, fontSize: fonts.md }}>
              {t === 'likes' ? '点赞记录' : '评论记录'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'likes' ? (
        <FlatList
          data={likedPosts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState message="暂无点赞" />}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />
          )}
        />
      ) : (
        <FlatList
          data={state.myComments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState message="暂无评论" />}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.commentCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('PostDetail', { postId: item.postId })}
            >
              <Text style={{ color: colors.text, fontSize: fonts.sm }}>{item.content}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fonts.xs, marginTop: 4 }}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  commentCard: { padding: 14, borderRadius: 10, marginBottom: 10 },
});
