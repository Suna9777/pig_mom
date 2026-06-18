import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

/** 设置列表项 */
export function SettingItem({ icon, title, subtitle, onPress, rightElement, showArrow = true }: SettingItemProps) {
  const { colors, fonts } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color={colors.primary} style={styles.icon} />
        <View style={styles.textWrap}>
          <Text style={{ color: colors.text, fontSize: fonts.md }}>{title}</Text>
          {subtitle && <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 2 }}>{subtitle}</Text>}
        </View>
        {rightElement}
      </View>
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.arrow} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 12,
  },
  icon: { marginRight: 12 },
  textWrap: { flex: 1, minWidth: 0 },
  arrow: { flexShrink: 0 },
});
