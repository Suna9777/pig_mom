import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useApp, useTheme } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/helpers';
import { POST_TYPE_LABELS } from '../../constants/tags';
import { COLORS } from '../../constants/theme';
import { showConfirm, showToast } from '../../utils/feedback';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Drafts'> };

/** 草稿箱 */
export function DraftsScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { state, removeDraft } = useApp();

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={state.drafts}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="暂无草稿" />}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('CreatePost', { draftId: item.id })}
        >
          <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.title || '无标题'}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }} numberOfLines={2}>
            {item.content || '无内容'}
          </Text>
          <View style={styles.footer}>
            <Text style={{ color: colors.primary, fontSize: fonts.xs }}>{POST_TYPE_LABELS[item.type]}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>{formatRelativeTime(item.savedAt)}</Text>
            <TouchableOpacity
              onPress={() =>
                showConfirm('删除草稿', '确定删除？', async () => {
                  await removeDraft(item.id);
                  showToast('已删除');
                })
              }
            >
              <Text style={{ color: COLORS.danger, fontSize: fonts.xs }}>删除</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
});
