import React from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp, useTheme } from '../../context/AppContext';
import { ThemeMode, FontSizeOption } from '../../types';
import { showToast } from '../../utils/feedback';

/** 通用设置 */
export function GeneralSettingsScreen() {
  const { colors, fonts } = useTheme();
  const { state, updateSettings } = useApp();

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'system', label: '跟随系统' },
    { key: 'light', label: '浅色' },
    { key: 'dark', label: '深色' },
  ];

  const fontOptions: { key: FontSizeOption; label: string }[] = [
    { key: 'small', label: '小' },
    { key: 'medium', label: '中' },
    { key: 'large', label: '大' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontSize: fonts.md, flex: 1 }}>消息推送</Text>
        <Switch
          value={state.settings.pushEnabled}
          onValueChange={(v) => updateSettings({ pushEnabled: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.md }]}>深色模式</Text>
      <View style={styles.options}>
        {themeOptions.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[styles.chip, { backgroundColor: state.settings.themeMode === o.key ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => { updateSettings({ themeMode: o.key }); showToast(`已切换为${o.label}`); }}
          >
            <Text style={{ color: state.settings.themeMode === o.key ? '#fff' : colors.text, fontSize: fonts.sm }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.md }]}>字体大小</Text>
      <View style={styles.options}>
        {fontOptions.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[styles.chip, { backgroundColor: state.settings.fontSize === o.key ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => { updateSettings({ fontSize: o.key }); showToast(`字体：${o.label}`); }}
          >
            <Text style={{ color: state.settings.fontSize === o.key ? '#fff' : colors.text, fontSize: fonts.sm }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, marginTop: 8 },
  options: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
});
