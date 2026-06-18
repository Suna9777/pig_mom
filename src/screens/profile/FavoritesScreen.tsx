import React from 'react';
import { FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { PostCard } from '../../components/PostCard';
import { EmptyState } from '../../components/EmptyState';
import { useApp, useTheme } from '../../context/AppContext';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Favorites'> };

/** 收藏列表 */
export function FavoritesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { state } = useApp();
  const favPosts = state.posts.filter((p) => state.favorites.includes(p.id));

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={favPosts}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="暂无收藏" />}
      renderItem={({ item }) => (
        <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />
      )}
    />
  );
}
