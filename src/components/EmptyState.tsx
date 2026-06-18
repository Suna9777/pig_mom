import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/AppContext';

/** 空状态 */
export function EmptyState({ message = '暂无数据' }: { message?: string }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textSecondary, fontSize: fonts.md }}>{message}</Text>
    </View>
  );
}

/** 加载更多 Footer */
export function LoadMoreFooter({ loading, hasMore }: { loading: boolean; hasMore: boolean }) {
  const { colors, fonts } = useTheme();
  if (!hasMore) {
    return (
      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontSize: fonts.sm }}>没有更多了</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  footer: { padding: 20, alignItems: 'center' },
});
