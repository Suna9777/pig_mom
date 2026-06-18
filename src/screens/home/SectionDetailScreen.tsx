import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList, BasicArticle, CCNUInfo, ExperienceShare } from '../../types';
import { SECTION_MAP } from '../../constants/sections';
import { fetchBasicArticles, fetchCCNUInfos } from '../../services/api';
import { MOCK_EXPERIENCES } from '../../data/mockData';
import { useApp, useTheme } from '../../context/AppContext';
import { EmptyState, LoadMoreFooter } from '../../components/EmptyState';
import { PAGE_SIZE } from '../../constants/theme';
import { paginate, hasMore } from '../../utils/helpers';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'SectionDetail'>;
  route: RouteProp<HomeStackParamList, 'SectionDetail'>;
};

type TabKey = 'basic' | 'ccnu' | 'experience';

/** 板块详情页 — 三分区 */
export function SectionDetailScreen({ navigation, route }: Props) {
  const { sectionId } = route.params;
  const section = SECTION_MAP[sectionId];
  const { colors, fonts } = useTheme();
  const { addBrowseHistory } = useApp();
  const [tab, setTab] = useState<TabKey>('basic');
  const [articles, setArticles] = useState<BasicArticle[]>([]);
  const [ccnuInfos, setCcnuInfos] = useState<CCNUInfo[]>([]);
  const [experiences, setExperiences] = useState<ExperienceShare[]>([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async () => {
    const [arts, ccnu] = await Promise.all([
      fetchBasicArticles(sectionId),
      fetchCCNUInfos(sectionId),
    ]);
    setArticles(arts);
    setCcnuInfos(ccnu);
    setExperiences(MOCK_EXPERIENCES.filter((e) => e.sectionId === sectionId));
  }, [sectionId]);

  useEffect(() => {
    loadData();
    navigation.setOptions({ title: section?.title || '板块详情' });
  }, [sectionId, loadData, navigation, section]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadData();
    setRefreshing(false);
  };

  const currentData: Array<{ id: string }> =
    tab === 'basic' ? articles : tab === 'ccnu' ? ccnuInfos : experiences;
  const displayData = paginate(currentData, page, PAGE_SIZE);

  const loadMore = () => {
    if (loadingMore || !hasMore(currentData, page, PAGE_SIZE)) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 300);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '基础知识' },
    { key: 'ccnu', label: 'CCNU专属' },
    { key: 'experience', label: '经验分享' },
  ];

  const renderBasic = (item: BasicArticle) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title}</Text>
      {item.steps.map((step, i) => (
        <Text key={i} style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 6 }}>
          {i + 1}. {step}
        </Text>
      ))}
      {item.officialUrl && (
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            addBrowseHistory({ type: 'article', title: item.title, targetId: item.id, sectionId });
            Linking.openURL(item.officialUrl!);
          }}
        >
          <Ionicons name="link" size={16} color={colors.secondary} />
          <Text style={{ color: colors.secondary, fontSize: fonts.sm, marginLeft: 4 }}>
            {item.officialName || '官方链接'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCCNU = (item: CCNUInfo) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 6 }}>{item.description}</Text>
      {item.address && <InfoRow label="地址" value={item.address} />}
      {item.time && <InfoRow label="时间" value={item.time} />}
      {item.price && <InfoRow label="价格" value={item.price} />}
      {item.phone && <InfoRow label="电话" value={item.phone} />}
    </View>
  );

  const renderExperience = (item: ExperienceShare) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => {
        addBrowseHistory({ type: 'post', title: item.title, targetId: item.postId, sectionId });
        navigation.navigate('PostDetail', { postId: item.postId });
      }}
    >
      <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 6 }}>{item.summary}</Text>
    </TouchableOpacity>
  );

  function InfoRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.infoRow}>
        <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, width: 40 }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: fonts.sm, flex: 1 }}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { setTab(t.key); setPage(1); }}
          >
            <Text style={{ color: tab === t.key ? colors.primary : colors.textSecondary, fontSize: fonts.md, fontWeight: tab === t.key ? '600' : '400' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={<LoadMoreFooter loading={loadingMore} hasMore={hasMore(currentData, page, PAGE_SIZE)} />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          if (tab === 'basic') return renderBasic(item as BasicArticle);
          if (tab === 'ccnu') return renderCCNU(item as CCNUInfo);
          return renderExperience(item as ExperienceShare);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  card: { padding: 14, borderRadius: 10, marginBottom: 10 },
  link: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  infoRow: { flexDirection: 'row', marginTop: 6 },
});
