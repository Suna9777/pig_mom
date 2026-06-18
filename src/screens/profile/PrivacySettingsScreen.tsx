import React from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp, useTheme } from '../../context/AppContext';
import { showToast } from '../../utils/feedback';

type PermOption = 'all' | 'friends' | 'self';

/** 隐私设置（UI 为主，逻辑简化） */
export function PrivacySettingsScreen() {
  const { colors, fonts } = useTheme();
  const { state, updateSettings } = useApp();

  const permOptions: { key: PermOption; label: string }[] = [
    { key: 'all', label: '所有人' },
    { key: 'friends', label: '仅好友' },
    { key: 'self', label: '仅自己' },
  ];

  const renderPermSelector = (
    title: string,
    value: PermOption,
    onChange: (v: PermOption) => void
  ) => (
    <>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.md }]}>{title}</Text>
      <View style={styles.options}>
        {permOptions.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[styles.chip, { backgroundColor: value === o.key ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => { onChange(o.key); showToast(`已设置为${o.label}`); }}
          >
            <Text style={{ color: value === o.key ? '#fff' : colors.text, fontSize: fonts.sm }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontSize: fonts.md, flex: 1 }}>记录浏览历史</Text>
        <Switch
          value={state.settings.recordHistory}
          onValueChange={(v) => updateSettings({ recordHistory: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {renderPermSelector('评论权限', state.settings.commentPermission, (v) =>
        updateSettings({ commentPermission: v })
      )}
      {renderPermSelector('个人主页可见范围', state.settings.profileVisibility, (v) =>
        updateSettings({ profileVisibility: v })
      )}

      <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 16 }}>
        屏蔽用户管理：在帖子详情页可屏蔽用户，屏蔽后其帖子不再显示。
      </Text>
      {state.blockedUsers.length > 0 && (
        <Text style={{ color: colors.text, fontSize: fonts.sm, marginTop: 8 }}>
          已屏蔽 {state.blockedUsers.length} 位用户
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, marginTop: 8 },
  options: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
});
