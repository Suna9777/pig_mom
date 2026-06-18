import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useApp, useTheme } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/helpers';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'History'> };

/** 浏览历史 */
export function HistoryScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { state } = useApp();

  const typeLabel = (type: string) => {
    if (type === 'article') return '基础知识';
    if (type === 'ccnu') return 'CCNU专属';
    return '帖子';
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={state.browseHistory}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="暂无浏览历史" />}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => {
            if (item.type === 'post') navigation.navigate('PostDetail', { postId: item.targetId });
          }}
        >
          <Text style={{ color: colors.primary, fontSize: fonts.xs }}>{typeLabel(item.type)}</Text>
          <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600', marginTop: 4 }}>{item.title}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.xs, marginTop: 4 }}>
            {formatRelativeTime(item.viewedAt)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, marginBottom: 10 },
});
