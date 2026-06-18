import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useApp, useTheme } from '../../context/AppContext';
import { EmptyState } from '../../components/EmptyState';
import { showToast } from '../../utils/feedback';
import { formatRelativeTime } from '../../utils/helpers';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Notifications'> };

/** 系统通知 */
export function NotificationsScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { state, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {state.notifications.length > 0 && (
        <TouchableOpacity style={styles.markAll} onPress={() => { markAllNotificationsRead(); showToast('已全部标记已读'); }}>
          <Text style={{ color: colors.primary, fontSize: fonts.sm }}>全部已读</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={state.notifications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message="暂无通知" />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, opacity: item.read ? 0.7 : 1 }]}
            onPress={() => {
              markNotificationRead(item.id);
              if (item.postId) navigation.navigate('PostDetail', { postId: item.postId });
            }}
          >
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }}>{item.content}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fonts.xs, marginTop: 4 }}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  markAll: { alignItems: 'flex-end', padding: 12 },
  card: { padding: 14, borderRadius: 10, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 14, right: 14 },
});
