import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CommunityStackParamList } from '../../types';
import { PostCard } from '../../components/PostCard';
import { TagFilterBar } from '../../components/TagFilterBar';
import { EmptyState, LoadMoreFooter } from '../../components/EmptyState';
import { PRESET_TAGS } from '../../constants/tags';
import { useApp, useTheme } from '../../context/AppContext';
import { PAGE_SIZE } from '../../constants/theme';
import { paginate, hasMore } from '../../utils/helpers';

type Props = { navigation: NativeStackNavigationProp<CommunityStackParamList, 'Community'> };

const FILTER_TAGS = ['全部', ...PRESET_TAGS];

/** 社群页面 — 帖子列表 + 筛选 + 发布 */
export function CommunityScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { getVisiblePosts, refreshPosts, addBrowseHistory } = useApp();
  const [selectedTag, setSelectedTag] = useState('全部');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const allPosts = getVisiblePosts(selectedTag === '全部' ? undefined : selectedTag);
  const displayPosts = paginate(allPosts, page, PAGE_SIZE);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost', {})}
          style={{ marginRight: 8 }}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.primary]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  const loadMore = () => {
    if (loadingMore || !hasMore(allPosts, page, PAGE_SIZE)) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TagFilterBar
        tags={FILTER_TAGS}
        selected={selectedTag}
        onSelect={(tag) => { setSelectedTag(tag); setPage(1); }}
      />
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={<LoadMoreFooter loading={loadingMore} hasMore={hasMore(allPosts, page, PAGE_SIZE)} />}
        ListEmptyComponent={<EmptyState message="暂无帖子" />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => {
              addBrowseHistory({ type: 'post', title: item.title, targetId: item.id, sectionId: item.sectionId });
              navigation.navigate('PostDetail', { postId: item.id });
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
