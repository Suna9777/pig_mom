import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../../components/SearchBar';
import { SectionCard } from '../../components/SectionCard';
import { EmptyState } from '../../components/EmptyState';
import { SECTIONS } from '../../constants/sections';
import { SECTION_MAP } from '../../constants/sections';
import { useApp, useTheme } from '../../context/AppContext';
import { HomeStackParamList, SearchResult } from '../../types';
import { showFeedback } from '../../utils/feedback';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'> };

/** 首页 — 搜索 + 九大板块 */
export function HomeScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { search, addSearchHistory, clearSearchHistory, state } = useApp();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const searching = keyword.trim().length > 0;

  const handleSearch = useCallback(async () => {
    const kw = keyword.trim();
    if (!kw) {
      setResults([]);
      return;
    }
    const res = search(kw);
    setResults(res);
    await addSearchHistory(kw);
    showFeedback(`找到 ${res.length} 条结果`);
  }, [keyword, search, addSearchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (searching) handleSearch();
    setTimeout(() => setRefreshing(false), 500);
  }, [searching, handleSearch]);

  const navigateResult = (item: SearchResult) => {
    if (item.type === 'post' && item.postId) {
      navigation.navigate('PostDetail', { postId: item.postId });
    } else if (item.sectionId) {
      navigation.navigate('SectionDetail', { sectionId: item.sectionId });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <SearchBar value={keyword} onChangeText={setKeyword} onSubmit={handleSearch} />
      {searching ? (
        <View style={styles.searchSection}>
          {state.searchHistory.length > 0 && (
            <View style={styles.historyRow}>
              <Text style={{ color: colors.textSecondary, fontSize: fonts.sm }}>搜索历史</Text>
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={{ color: colors.primary, fontSize: fonts.sm }}>清除</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            ListEmptyComponent={<EmptyState message="未找到相关内容" />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { backgroundColor: colors.card }]}
                onPress={() => navigateResult(item)}
              >
                <Text style={[styles.resultType, { color: colors.primary, fontSize: fonts.xs }]}>
                  {item.type === 'article' ? '基础知识' : item.type === 'ccnu' ? 'CCNU专属' : '帖子'}
                </Text>
                <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }} numberOfLines={2}>
                  {item.content}
                </Text>
                {item.sectionId && (
                  <Text style={{ color: colors.textSecondary, fontSize: fonts.xs, marginTop: 4 }}>
                    {SECTION_MAP[item.sectionId]?.title}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={SECTIONS}
          numColumns={3}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListHeaderComponent={
            <Text style={[styles.header, { color: colors.text, fontSize: fonts.lg }]}>
              校园生活全能指南 · 武汉
            </Text>
          }
          renderItem={({ item }) => (
            <SectionCard
              section={item}
              onPress={() => navigation.navigate('SectionDetail', { sectionId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  header: { fontWeight: '700', marginBottom: 16, marginTop: 8 },
  searchSection: { flex: 1 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  resultItem: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 10 },
  resultType: { marginBottom: 4 },
});
