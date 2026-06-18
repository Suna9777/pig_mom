import React from 'react';
import { FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { PostCard } from '../../components/PostCard';
import { EmptyState } from '../../components/EmptyState';
import { useApp, useTheme } from '../../context/AppContext';
import { showConfirm, showToast } from '../../utils/feedback';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyPosts'> };

/** 我的提问 */
export function MyPostsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { state, deletePost } = useApp();
  const myPosts = state.posts.filter((p) => p.authorId === state.user.id);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={myPosts}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="还没有发布帖子" />}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          onLongPress={() =>
            showConfirm('删除帖子', '确定删除这篇帖子吗？', async () => {
              await deletePost(item.id);
              showToast('已删除');
            })
          }
        />
      )}
    />
  );
}
