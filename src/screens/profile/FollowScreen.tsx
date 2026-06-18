import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp, useTheme } from '../../context/AppContext';
import { EmptyState } from '../../components/EmptyState';
import { showToast } from '../../utils/feedback';

/** 关注（简化版） */
export function FollowScreen() {
  const { colors, fonts } = useTheme();
  const { state, toggleFollow } = useApp();

  const users = Array.from(
    new Map(
      state.posts
        .filter((p) => p.authorId !== state.user.id)
        .map((p) => [p.authorId, p.authorName])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={users}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="暂无可关注用户" />}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const following = state.following.includes(item.id);
        return (
          <View style={[styles.row, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontSize: fonts.md, flex: 1 }}>{item.name}</Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: following ? colors.card : colors.primary, borderColor: colors.primary }]}
              onPress={async () => {
                await toggleFollow(item.id);
                showToast(following ? '已取消关注' : '关注成功');
              }}
            >
              <Text style={{ color: following ? colors.primary : '#fff', fontSize: fonts.sm }}>
                {following ? '已关注' : '关注'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
});
